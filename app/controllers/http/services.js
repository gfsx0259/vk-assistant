var async = require('async');
var Contact = require('./../../models/contact').Contact;

// Include services
var vkAuthorizingServiceInstance = require('./../../services/vk/authorizing');
var vkRequestBuilderService = require('./../../services/vk/request/builder');

// Initialize services
var vkRequestBuilderServiceInstance = new vkRequestBuilderService();

var servicesList = {
    home: function (req, res) {
        res.render('services/home');
    },
    msg: function (req, res, token) {
        vkRequestBuilderServiceInstance.fetch('messages.get', token, {}, function (err, items) {
            res.render('services/msg', {
                items: items
            });
        });
    },
    profile: function (req, res, token) {
        vkRequestBuilderServiceInstance.fetch(
            'users.get', token, {fields: ['photo_200', 'city', 'verified'].join(',')},
            function (err, data) {
                res.render('services/profile', {
                    profile: data[0]
                });
            });
    },
    dialogs: function (req, res, token) {

        var usersInfo = {};

        var mapUserInfoToDialog = function (value) {
            value['info'] = usersInfo[value.uid];
            return value;
        };

        vkRequestBuilderServiceInstance.fetch('messages.getDialogs', token, {offset: 0}, function (err, items) {

            var needFetchedUserIds = [];
            var fetchUsersInfoCalls = [];

            items.forEach(function (dialogItem) {
                fetchUsersInfoCalls.push(function (callback) {
                        Contact.findOne({user_id: dialogItem.uid}, function (err, contact) {
                            if (err) throw 'An error occurs while reading contacts from DB';

                            // Если данные удалось получить из БД
                            if (contact) {
                                usersInfo[dialogItem.uid] = contact;
                            } else {
                                // Если не удалось получить данные по контакту из базы
                                needFetchedUserIds.push(dialogItem.uid);
                            }

                            callback(null, dialogItem.uid);
                        });
                    }
                )
            });

            async.parallel(fetchUsersInfoCalls, function (err, result) {
                // Если необходим запрос для получения данных пользователей
                if (needFetchedUserIds.length) {
                    vkRequestBuilderServiceInstance.fetch(
                        'users.get', token, {
                            user_ids: needFetchedUserIds.join(','),
                            fields: ['photo_200', 'city', 'verified'].join(',')
                        },
                        function (err, data) {
                            var updateContactsCall = [];

                            data.forEach(function (userData) {
                                updateContactsCall.push(function (callback) {
                                    usersInfo[userData.uid] = userData;
                                    Contact.findOneAndUpdate(
                                        {user_id: userData.uid}, userData, {upsert: true}, function (err, doc) {
                                            if (!err) {
                                                callback(null, userData);
                                            }
                                        });
                                });
                            });

                            async.parallel(updateContactsCall, function (err, result) {
                                if (err) throw 'An error occurs while updating contact in DB';

                                res.render('services/dialogs', {
                                    items: items.map(mapUserInfoToDialog)
                                });
                            });
                        });
                } else {
                    // Если данные для всех пользователей удалось получить из БД
                    res.render('services/dialogs', {
                        items: items.map(mapUserInfoToDialog)
                    });
                }
            });
        });
    },
    send: function (req, res, token) {
        var params = {
            message: req.query.msg || 'empty msg',
            user_id: req.query.user_id
        };
        vkRequestBuilderServiceInstance.fetch('messages.send', token, params, function (err, items) {
            res.send(items.toString());
        });
    }
};


/**
 * Constructor
 */
var services = function () {};

services.prototype = {
    getHandler: function (name) {
        return function (req, res) {
            vkAuthorizingServiceInstance.actualizeToken(function (err, token) {
                if (!err) {
                    servicesList[name].call(this, req, res, token);
                } else {
                    throw 'Can`t get token';
                }
            });
        }
    }
};

module.exports = new services();