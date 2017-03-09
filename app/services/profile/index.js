let vkAuthorizingServiceInstance = require('../vk/authorizing');
let vkRequestBuilderService = require('../vk/request/builder');

let Token = require('./../../models/token').Token;
let User = require('./../../models/user').User;
let Contact = require('./../../models/contact').Contact;

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
     * @return Contact
     */
    saveMapping(params, cb) {
        var socket = this.socket;
        vkAuthorizingServiceInstance.getAuth().authorize(params.username, params.password, (err, tokenData) => {
            if (!err) {
                var token = new Token(_.merge(tokenData, {
                        email: params.username,
                        password: params.password
                    }
                ));

                var upsertData = token.toObject();
                delete upsertData._id;

                Token.update(
                    {email: token.email}, upsertData, {upsert: true}, function (err, doc) {
                        if (!err) {
                            let saveUserRelation = new Promise((resolve, reject) => {
                                // Если токен был обновлён, то его id уже привязан к пользователю
                                if (!doc['upserted']) {
                                    resolve();
                                } else {
                                    // Если нет, то создаём привязку
                                    User.findById(socket.request.session.passport.user._id, (err, user) => {
                                        user.token = doc.upserted[0]._id;
                                        user.save((err) => {
                                            !err ? resolve() : reject(err);
                                        });
                                    })
                                }
                            });

                            // Когда привязка к пользователю сохранена
                            saveUserRelation.then(() => {
                                Contact.find({_id: token.user_id}, (err, contact) => {
                                    // Если контакт найден в БД
                                    if (contact.length) {
                                        cb(null, contact[0]);
                                    } else {
                                        let getContactsDataPromise = new Promise((resolve, reject) => {
                                            (new vkRequestBuilderService()).fetch(
                                                'users.get', token, {
                                                    user_ids: token.user_id,
                                                    fields: ['photo_200', 'city', 'verified'].join(',')
                                                }, (err, data) => {
                                                    !err ? resolve(data) : reject(err);
                                                }
                                            );
                                        });

                                        getContactsDataPromise.then((contact) => {
                                            contact = contact[0];
                                            new Contact(_.merge(contact, {_id: contact.uid})).save(() => {
                                                cb(null, contact);
                                            });
                                        })
                                    }
                                });
                            }).catch((err) => {
                                console.warn(err);
                            })
                        } else {
                            console.warn(err);
                        }
                    });
            } else {
                cb(true);
            }
        });
    }

    // TODO implement
    fetch(cb) {

    }
}

module.exports = profileService;