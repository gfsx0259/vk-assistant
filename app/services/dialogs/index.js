let vkAuthorizingServiceInstance = require('../vk/authorizing');
let vkRequestBuilderService = require('../vk/request/builder');
let vkRequestBuilderServiceInstance = new vkRequestBuilderService();

let Dialog = require('./../../models/dialog');
let Message = require('./../../models/message');
let Contact = require('./../../models/contact').Contact;

let _ = require('lodash');

class dialogService {
    /**
     * @param socket
     */
    constructor(socket) {
        this.socket = socket;
    }

    messagesFetch(uid, cb) {
        Message.find({uid: uid}, null, {sort: {date: -1}}).then((messages) => {
            // Если в базе уже есть диалоги, сразу отдаём их, обновления получим потом
            if (messages.length > 0) {
                // Возвращаем данные через callback socket.io
                if (cb) {
                    cb({items: messages});
                }
            } else {
                console.log('_messagesFetchInit');
                this._messagesFetchInit();
            }
        }).catch(err => {
            console.log(err);
        });
    }

    _messagesFetchInit() {

        let actualizeTokenPromise = new Promise((resolve, reject) => {
            vkAuthorizingServiceInstance.actualizeToken(this.socket.request.session.passport.user._id, (err, token) => {
                !err ? resolve(token) : reject(err);
            })
        });

        actualizeTokenPromise.then(token => {
            vkRequestBuilderServiceInstance.fetch('messages.get', token, {count: 200}, function (err, items) {
                let BulkContacts = Message.collection.initializeUnorderedBulkOp();
                items.forEach(function (value) {
                    value._id = value.mid;
                    BulkContacts.find({_id: value.mid}).upsert().update({'$set': value});
                });
                BulkContacts.execute();
            });
        });
    }

    /**
     * Получение диалогов из БД, либо запрос в АПИ при их отсутствии (первоначальный запрос)
     */
    dialogsFetch(cb) {
        let actualizeTokenPromise = new Promise((resolve, reject) => {
            vkAuthorizingServiceInstance.actualizeToken(this.socket.request.session.passport.user._id, (err, token) => {
                !err ? resolve(token) : reject(err);
            })
        });

        actualizeTokenPromise.then(token => {
            Dialog.find({from_uid: token.user_id}, null, {sort: {date: -1}}).populate('contact').then((dialogs) => {
                // Если в базе уже есть диалоги, сразу отдаём их, обновления получим потом
                if (dialogs.length > 0) {
                    // Возвращаем данные через callback socket.io
                    if (cb) {
                        cb({items: dialogs});
                    } else {
                        // После Long Pull вызываем событие
                        this.socket.emit('onDialogsFetchResponse', {items: dialogs});
                    }
                } else {
                    this._dialogsFetchInit(() => {
                        this.dialogsFetch();
                    });
                }
            }).catch(err => {
            });
        }).catch(err => {
        });
    }

    /**
     * Отправка Long Pull запроса, запуск бесконечного цикла на время сессии,
     * в случае истечения срока данных Long Pull сервера - их получение и запуск цикла
     * @returns {Promise<R>|Promise.<T>|Promise}
     */
    dialogsFetchLongPull(loopCallback) {
        console.log('fetch pull working');
        // Если в этой сессии уже есть данные для LongPull сервера
        if (this.socket.request.session['longPullServerData'] && Date.now() <= this.socket.request.session['longPullServerData'].time + 86400 * 1000) {
            return vkRequestBuilderServiceInstance.fetchLongPull(_.merge(this.socket.request.session['longPullServerData'], {
                act: 'a_check',
                wait: 25,
                mode: 2
            })).then(updateData => {
                // Если сервер говорит, что ключ устарел
                if (updateData.failed) {
                    this._updateConnectionData({time: 0});
                } else {
                    this._updateConnectionData({time: Date.now(), ts: updateData['ts']});

                    let newMessages = [];

                    console.log(updateData);

                    updateData.updates.forEach((updateItem) => {

                        if (updateItem[0] == 4) {
                            console.warn('Новое сообщение!');
                            newMessages.push(updateItem);
                        }
                    });

                    if (newMessages.length) {
                        this._updateDialogs(newMessages);
                    }
                }
            }).catch((err) => {
                console.warn(err);
            });
        } else {
            console.log('long pull else');
            this._dialogsFetchInit(() => {
                this.dialogsFetch();
            });

            // Если нету, то получаем их и вызываем метод ещё раз
            new Promise((resolve, reject) => {
                vkAuthorizingServiceInstance.actualizeToken(this.socket.request.session.passport.user._id, (err, token) => {
                    !err ? resolve(token) : reject(err);
                })
            }).then((token) => {
                return vkRequestBuilderServiceInstance.fetchPromise(
                    'messages.getLongPollServer', token, {});
            }).then((data) => {
                this._updateConnectionData(_.merge(data, {time: Date.now()}));
            }).catch((err) => {
                console.warn(err);
            });
        }

        // Продолжаем цикл
        loopCallback();
    }

    /**
     * Получение диалогов обычным путём, либо при первоначальном запросе,
     * либо при необходимости забрать устаревшие данные, если данные Long Pull сервера устарели
     * @param cb
     * @private
     */
    _dialogsFetchInit(cb) {
        // Первоначальное получение диалогов и контактов из базы
        let actualizeTokenPromise = new Promise((resolve, reject) => {
            vkAuthorizingServiceInstance.actualizeToken(this.socket.request.session.passport.user._id, (err, token) => {
                !err ? resolve(token) : reject(err);
            })
        });

        actualizeTokenPromise
            .then((token) => {
            console.log('token', token);
                vkRequestBuilderServiceInstance.fetch('messages.getDialogs', token, {offset: 0}, function (err, items) {

                   console.log(err, items);

                    // После получения всех диалогов, получим все данные контактов
                    let getContactsDataPromise = new Promise((resolve, reject) => {
                        vkRequestBuilderServiceInstance.fetch(
                            'users.get', token, {
                                user_ids: items.map(item => {
                                    return item.uid
                                }).join(','),
                                fields: ['photo_200', 'city', 'verified'].join(',')
                            }, (err, data) => {
                                !err ? resolve(data) : reject(err);
                            }
                        );
                    });

                    // Когда данные контактов будут получены, сохраним в базу контакты и диалоги
                    getContactsDataPromise.then((data) => {
                        if (data.length) {
                            let BulkContacts = Contact.collection.initializeUnorderedBulkOp();
                            data.forEach(function (value) {
                                value._id = value.uid;
                                BulkContacts.find({_id: value.uid}).upsert().update({'$set': value});
                            });
                            BulkContacts.execute();
                        }

                        // Сохраним диалоги в базу
                        let BulkDialogs = Dialog.collection.initializeUnorderedBulkOp();
                        items.forEach((value) => {
                            // Id текущего пользователя добавляем к документу, чтобы знать к кому относятся диалоги
                            value.from_uid = token.user_id;
                            value.contact = value.uid;
                            // Вставляем/обновляем записи по пользователю с которым ведётся диалог
                            BulkDialogs.find({
                                uid: value.uid,
                                from_uid: token.user_id
                            }).upsert().update({'$set': value});
                        });
                        BulkDialogs.execute(cb);
                    }).catch(function (err) {
                        console.log(err);
                    });
                });
            });
    }

    /**
     * Применение обновления - результата запроса к Long Pull серверу
     * и отправка данных клиенту посредством вызова dialogsFetch
     * @param messages
     * @private
     */
    _updateDialogs(messages) {
        messages.forEach((msg) => {

            let parsedMsg = {
                mid: msg[1],
                uid: msg[3],
                body: msg[6],
                date: msg[4]
            };

            Dialog.findOneAndUpdate(
                {uid: msg[3]}, parsedMsg, {upsert: true}, (err) => {
                    if (!err) {
                        // После того, как данные были обновлены, вызовим получение и отправку данных на клиент заново
                        this.dialogsFetch();
                    }
                });
        });
    }

    /**
     * Обновление данных соединения с Long Pull сервером
     * @param params
     * @param cb
     * @private
     */
    _updateConnectionData(params, cb) {
        this.socket.request.session['longPullServerData'] = _.merge(
            this.socket.request.session['longPullServerData'],
            params
        );
        this.socket.request.session.save(cb);
    }
}

module.exports = dialogService;