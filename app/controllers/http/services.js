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
    dialogs: function (req, res, token) {

        // Чтение данных из базы
        // TODO Подумать как получить контакты из связанной таблицы pollute?
        //
        // Dialog.find({ from_uid : token.user_id}, (err, items) => {
        //     console.log(items);
        //     res.json({items: items});
        // });
        // return false;

        // Первоначальное получение диалогов и контактов из базы
        // TODO реализовать получение новых на лету, хранить отметку времени "ts":1860038642
        vkRequestBuilderServiceInstance.fetch('messages.getDialogs', token, {offset: 0}, function (err, items) {

            // После получения всех диалогов, получим все данные контактов
            let fetchPromise = new Promise((resolve, reject) => {
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
            fetchPromise.then((data) => {
                if (data.length) {
                    var BulkContact = Contact.collection.initializeUnorderedBulkOp();
                    data.forEach(function (value) {
                        BulkContact.find({uid: value.uid}).upsert().update({'$set': value});
                    });
                    BulkContact.execute();
                }

                // Сохраним диалоги в базу
                // Подумать, как связать диалоги с контактами, метод pollute
                var Bulk = Dialog.collection.initializeUnorderedBulkOp();
                items.forEach(function (value) {
                    // Id текущего пользователя добавляем к документу, чтобы знать к кому относятся диалоги
                    value.from_uid = token.user_id;
                    // Вставляем/обновляем записи
                    Bulk.find({mid: value.mid}).upsert().update({'$set': value});
                });
                Bulk.execute();

                // Возврат результата клиенту, в будущем не должно так работать, данные должны читаться из базы
                items = items.map(function (value) {
                    value['info'] = data.filter(function (c) {
                        return c.uid = value.uid;
                    });
                    return value;
                });

                res.json({items: items});

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