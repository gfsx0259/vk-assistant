let vkAuthorizingServiceInstance = require('../vk/authorizing');
let vkRequestBuilderService = require('../vk/request/builder');

let Token = require('./../../models/token').Token,
    User = require('./../../models/user').User,
    Contact = require('./../../models/contact').Contact;

let _ = require('lodash');

class profileService {
    /**
     * @param socket
     */
    constructor(socket) {
        this.socket = socket;
    }

    /**
     * Получение токена по логину и паролю ВК, сохранение привязки к пользователю и сохренение данных контакта
     * @return object - Контактные данные
     */
    saveMapping(params, cb) {
        let getNewTokenPromise = new Promise((resolve, reject) => {
            vkAuthorizingServiceInstance.getAuth().authorize(params.username, params.password, (err, newTokenData) => {
                !err ? resolve(newTokenData) : reject(err);
            })
        });
        // Получение нового токена и сохранение его в БД
        getNewTokenPromise.then(newToken => {
            let tokenObject = new Token(_.merge(newToken, {
                    email: params.username,
                    password: params.password
                }
            ));

            let upsertData = tokenObject.toObject();
            delete upsertData._id;

            return new Promise((resolve, reject) => {
                Token.update({email: tokenObject.email},
                    upsertData,
                    {upsert: true},
                    (err, doc) => {
                        !err ? resolve({doc: doc, token: newToken}) : reject(err);
                    });
            });
            // Обновление привязки токена к пользователю
        }).then((params) => {
            return new Promise((resolve, reject) => {
                // Если токен был обновлён, то его id уже привязан к пользователю
                if (!params.doc['upserted']) {
                    resolve(params.token);
                } else {
                    // Если нет, то создаём привязку
                    User.findById(this.socket.request.session.passport.user._id, (err, user) => {
                        user.token = params.doc.upserted[0]._id;
                        user.save((err) => {
                            !err ? resolve(params.token) : reject(err);
                        });
                    })
                }
            });
            // Обновление контакта
        }).then((newToken) => {
            // Когда привязка к пользователю сохранена
            return new Promise((resolve, reject) => {
                Contact.find({_id: newToken.user_id}, (err, contact) => {
                    // Если контакт найден в БД
                    if (contact.length) {
                        return resolve(contact[0]);
                    } else {
                        (new vkRequestBuilderService()).fetch(
                            'users.get', newToken, {
                                user_ids: newToken.user_id,
                                fields: ['photo_200', 'city', 'verified'].join(',')
                            }, (err, data) => {
                                if (!err) {
                                    new Contact(_.merge(data[0], {_id: data[0].uid})).save(() => {
                                        resolve(data[0]);
                                    });
                                } else {
                                    reject(err);
                                }
                            }
                        );
                    }
                });
            })
        }).then(contact => {
            cb(null, contact);
        }).catch((err) => {
            console.warn(err);
        });
    }

    /**
     * Получение данных контакта ВК текущего пользователя по связке User->Token->Contact
     * @param cb
     */
    fetch(cb) {
        User.findOne({_id: this.socket.request.session.passport.user._id})
            .populate('token')
            .then(user => {
                Contact.findOne({_id: user.token.user_id}).then((contact) => {
                    cb(contact);
                })
            });
    }
}

module.exports = profileService;