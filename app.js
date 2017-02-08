var express = require('express');
var mongoose = require('mongoose');
var hbs = require('express-handlebars');

mongoose.connect('mongodb://localhost/vk-assistant');

// Include config
var Config = require(__dirname + '/config/main');

// Include services
var vkAuthorizingServiceInstance = require(__dirname + '/services/vk/authorizing');
var vkRequestBuilderService = require(__dirname + '/services/vk/request/builder');

// Initialize services
var vkRequestBuilderServiceInstance = new vkRequestBuilderService();

var app = express();

app.engine('handlebars', hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


app.get('/', function (req, res) {
    res.render('home');
});


app.get('/msg', function (req, res) {
    vkAuthorizingServiceInstance.actualizeToken(function (err, token) {
        if (err) return;

        vkRequestBuilderServiceInstance.fetch('messages.get', token, function (err, items) {
            res.render('msg', {
                items: items
            });
        });
    });
});

app.get('/profile', function (req, res) {
    vkAuthorizingServiceInstance.actualizeToken(function (err, token) {
        if (err) return;

        token['fields'] = ['photo_200', 'city', 'verified'].join(',');

        vkRequestBuilderServiceInstance.fetch('users.get', token, function (err, data) {
            res.render('profile', {
                profile: data[0]
            });
        });
    });
});


app.get('/dialogs', function (req, res) {
    vkAuthorizingServiceInstance.actualizeToken(function (err, token) {
        if (err) return;
        token['offset'] = 20;
        vkRequestBuilderServiceInstance.fetch('messages.getDialogs', token, function (err, items) {
            res.render('dialogs', {
                items: items
            });
        });
    });
});

app.get('/send', function (req, res) {
    vkAuthorizingServiceInstance.actualizeToken(function (err, token) {
        if (err) return;
        token['message'] = req.query.msg || 'test message';
        token['user_id'] = '407698507';
        vkRequestBuilderServiceInstance.fetch('messages.send', token, function (err, items) {
            res.send(items.toString());
    });
    });
});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
