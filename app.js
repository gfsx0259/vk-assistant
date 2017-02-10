var express = require('express');
var mongoose = require('mongoose');
var hbs = require('express-handlebars');

mongoose.connect('mongodb://localhost/vk-assistant');

var app = express();

app.engine('hbs', hbs({defaultLayout: 'main'}));
app.set('view engine', 'hbs');

var ServicesController = require('./controllers/services');

app.get('/', ServicesController.getHandler('home'));
app.get('/msg', ServicesController.getHandler('msg'));
app.get('/profile', ServicesController.getHandler('profile'));
app.get('/dialogs', ServicesController.getHandler('dialogs'));
app.get('/send', ServicesController.getHandler('send'));

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
