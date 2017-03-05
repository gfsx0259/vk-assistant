var vkAuthorizingServiceInstance = require('./../../services/vk/authorizing');
var vkRequestBuilderService = require('./../../services/vk/request/builder');
var vkRequestBuilderServiceInstance = new vkRequestBuilderService();
var _ = require('lodash');

var passport = require('passport');
var Dialog = require('./../../models/dialog');
var Contact = require('./../../models/contact').Contact;

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        err
            ? done(err)
            : done(null, user);
    });
});

var User = require('../../models/user').User;

var LocalStrategy = require('../../middleware/passport/strategy');
passport.use(new LocalStrategy(
    {},
    function (username, password, done, socket) {
        User.findOne({username: username}, function (err, user) {
            return err
                ? done(err, null, null, socket)
                : user
                    ? password === user.password
                        ? done(null, user, null, socket)
                        : done(null, false, {message: 'Incorrect password.'}, socket)
                    : done(null, false, {message: 'Incorrect username.'}, socket);
        });
    }
));


module.exports = {
    connection: (socket) => {
        socket.on('login', (params) => {
            passport.authenticate('websocket')(_.merge(params, {socket: socket}));
        });

        socket.on('logout', () => {
            socket.request.session.passport = {};
            socket.request.session.save();
            socket.emit('unauthorize', {
                result: true
            })
        });

        socket.on('reg', (params) => {
            let user = new User(params);
            user.save((err) => {
                if (err) {
                    socket.emit('onRegResponse', {status: 'error', error: {code: err.code || 0}});
                } else {
                    socket.emit('onRegResponse', {status: 'success'});
                }
            });
        });

        var dialogsFetchInit = function update(cb) {
            // Первоначальное получение диалогов и контактов из базы
            let actualizeTokenPromise = new Promise((resolve, reject) => {
                vkAuthorizingServiceInstance.actualizeToken((err, token) => {
                    !err ? resolve(token) : reject(err);
                })
            });

            actualizeTokenPromise
                .then((token) => {
                    vkRequestBuilderServiceInstance.fetch('messages.getDialogs', token, {offset: 0}, function (err, items) {
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
                                    from_uid: value.from_uid
                                }).upsert().update({'$set': value});
                            });
                            BulkDialogs.execute(cb);
                        }).catch(function (err) {
                            console.log(err);
                        });
                    });
                });
        };

        function dialogsFetch() {
            let actualizeTokenPromise = new Promise((resolve, reject) => {
                vkAuthorizingServiceInstance.actualizeToken(function (err, token) {
                    !err ? resolve(token) : reject(err);
                })
            });

            actualizeTokenPromise.then(token => {
                Dialog.find({from_uid: token.user_id}, null, {sort: {date: -1}}).populate('contact').then((dialogs) => {
                    // Если в базе уже есть диалоги, сразу отдаём их, обновления получим потом
                    if (dialogs.length > 0) {
                        socket.emit('onDialogsFetchResponse', {
                            items: dialogs
                        });
                    } else {
                        dialogsFetchInit(() => {
                            dialogsFetch();
                        });
                    }
                }).catch(err => {
                    console.warn(err);
                });
            }).catch(err => {
                console.warn(err);
            });
        }


        function updateDialogs(messages) {
            messages.forEach((msg) => {

                let parsedMsg = {
                    mid: msg[1],
                    uid: msg[3],
                    body: msg[6],
                    date: msg[4]
                };

                Dialog.findOneAndUpdate(
                    {uid: msg[3]}, parsedMsg, {upsert: true}, (err, doc) => {
                        if(!err) {
                            // После того, как данные были обновлены, вызовим получение и отправку данных на клиент заново
                            dialogsFetch();
                        }
                    });
            });
        }

        function dialogsFetchLongPull() {
            console.log('fetch pull working');
            // Если в этой сессии уже есть данные для LongPull сервера
            if (socket.request.session['longPullServerData'] && Date.now() <= socket.request.session['longPullServerData'].time + 3600) {
                return vkRequestBuilderServiceInstance.fetchLongPull(_.merge(socket.request.session['longPullServerData'], {
                    act: 'a_check',
                    wait: 25,
                    mode: 2
                })).then(updateData => {
                    console.log(updateData);
                    socket.request.session['longPullServerData']['ts'] = updateData['ts'];
                    socket.request.session['longPullServerData']['time'] = Date.now();
                    socket.request.session.save();

                    let newMessages = [];

                    updateData.updates.forEach((updateItem) => {

                        if (updateItem[0] == 4) {
                            console.warn('Новое сообщение!');
                            newMessages.push(updateItem);
                        }
                    });

                    if (newMessages.length) {
                        updateDialogs(newMessages);
                    }

                    dialogsFetchLongPull();
                }).catch({});
            } else {
                console.log('long pull else');
                dialogsFetchInit(() => {
                    dialogsFetch();
                });

                // Если нету, то получаем их и вызываем метод ещё раз
                new Promise((resolve, reject) => {
                    vkAuthorizingServiceInstance.actualizeToken((err, token) => {
                        !err ? resolve(token) : reject(err);
                    })
                }).then((token) => {
                    return vkRequestBuilderServiceInstance.fetchPromise(
                        'messages.getLongPollServer', token, {});
                }).then((data) => {
                    if (!data.failed) {
                        socket.request.session['longPullServerData'] = _.merge(data, {
                            time: Date.now()
                        });
                        socket.request.session.save(() => {
                            dialogsFetchLongPull();
                        });
                    }
                });
            }
        }

        // Получение списка диалогов из БД
        socket.on('dialogsFetch', function () {
            dialogsFetch();
        });

        // Запрос на получение обновлений
        socket.on('dialogsFetchLongPull', () => {
            dialogsFetchLongPull();
        });
    }
};