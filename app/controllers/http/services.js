var async = require('async');
var Contact = require('./../../models/contact').Contact;
var Dialog = require('./../../models/dialog');
var _ = require('lodash');

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
            res.json({items: items});
        });
    },
    photos: function (req, res, token) {

        var params = {
            owner_id: req.query.owner_id,
            count: 200,
            offset: 0
        };

        vkRequestBuilderServiceInstance.fetch('photos.getAll', token, params, function (err, items) {
            res.json({items: items});
        });
    },
    setLike: function (req, res, token) {

        const ownerId = req.body.owner_id;

        let setLikeCalls = [];

        req.body.pids.map(function (pid) {
            setLikeCalls.push(function (callback) {
                setTimeout(function () {
                    vkRequestBuilderServiceInstance.fetch('likes.add', token, {
                        owner_id: ownerId,
                        item_id: pid,
                        type: 'photo'
                    }, function (err, result) {
                        callback(null);
                    });
                }, 2000);
            });
        });

        async.waterfall(setLikeCalls, function (err, result) {
            if (err) throw 'An error occurs while set likes processing';
            res.json({status: 'success'});
        });
    },
    profile: function (req, res, token) {
        vkRequestBuilderServiceInstance.fetch(
            'users.get', token, {fields: ['photo_200', 'city', 'verified'].join(',')},
            function (err, data) {
                res.json({
                    profile: data[0]
                });
            });
    },
    // Чтение данных из базы при первом запросе от клиента
    dialogs: (req, res, token) => {
        Dialog.find({from_uid: token.user_id}).populate('contact').then((dialogs) => {
            // Если в базе уже есть диалоги, сразу отдаём их, обновления получим потом
            if (dialogs.length > 0) {
                res.json({items: dialogs});
            }
        }).catch(err => {
            console.warn(err);
        });
    },
    // TODO определить когда обращаться к API и как обновлять данные
    _dialogsUpdate: () => {
        // Первоначальное получение диалогов и контактов из базы
        // TODO реализовать получение новых на лету, хранить отметку времени "ts":1860038642
        vkRequestBuilderServiceInstance.fetch('messages.getDialogs', token, {offset: 0}, function (err, items) {

            // После получения всех диалогов, получим все данные контактов
            let getContactsDataPromise = new Promise((resolve, reject) => {
                vkRequestBuilderServiceInstance.fetch(
                    'users.get', token, {
                        user_ids: items.map(item => { return item.uid }).join(','),
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
                    value._id = value.mid;
                    value.from_uid = token.user_id;
                    value.contact = value.uid;
                    // Вставляем/обновляем записи по пользователю с которым ведётся диалог
                    BulkDialogs.find({uid: value.uid}).upsert().update({'$set': value});
                });
                BulkDialogs.execute();
            }).catch(function (err) {
                console.log(err);
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
var services = function () {
};

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