// Include services
var vkAuthorizingServiceInstance = require('./../services/vk/authorizing');
var vkRequestBuilderService = require('./../services/vk/request/builder');

// Initialize services
var vkRequestBuilderServiceInstance = new vkRequestBuilderService();

var servicesList = {
    home: function (req, res) {
        res.render('home');
    },
    msg: function (req, res, token) {
        vkRequestBuilderServiceInstance.fetch('messages.get', token, {}, function (err, items) {
            res.render('msg', {
                items: items
            });
        });
    },
    profile: function (req, res, token) {
        vkRequestBuilderServiceInstance.fetch(
            'users.get', token, {fields: ['photo_200', 'city', 'verified'].join(',')},
            function (err, data) {
                res.render('profile', {
                    profile: data[0]
                });
            });
    },
    dialogs: function (req, res, token) {
        vkRequestBuilderServiceInstance.fetch('messages.getDialogs', token, {offset: 20}, function (err, items) {
            res.render('dialogs', {
                items: items
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