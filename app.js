var express = require('express');
var mongoose = require('mongoose');
var hbs = require('express-handlebars');

mongoose.connect('mongodb://localhost/vk-assistant');

// Include config
var Config = require(__dirname + '/config/main');

// Include mongodb models
var Token = require(__dirname + '/models/token').Token;

// Include services
var vkClientClass = require(__dirname + '/services/vk-client').instance;
var vkClientInstance = new vkClientClass(Config.application.id);

var app = express();

app.engine('handlebars', hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


app.get('/', function (req, res) {
    res.render('home');
});


app.get('/msg', function (req, res) {
    fetch('messages.get', function (data) {
        res.render('msg', {
            items: data
        });
    });
});

app.get('/profile', function (req, res) {
    fetch('users.get', function (data) {
        res.render('profile', {
            profile: data[0]
        });
    });
});


function fetch(method, cb) {
    // Trying to get token data from DB
    Token.findByEmail(Config.user.credentials.email, function (err, token) {
        // If token data was fetched already
        if (token) {
            // set data for profile req
            if (method == 'users.get') {
                token['user_ids'] = token['user_id'];
                token['fields'] = ['photo_200','city','verified'].join(',');
            }

            vkClientInstance.fetch(method, token, cb);
        } else {
            vkClientInstance.getAuth().authorize(Config.user.credentials.email, Config.user.credentials.password, function (err, token) {
                vkClientInstance.fetch(method, token, cb);

                // Save to db token collection
                token['email'] = Config.user.credentials.email;
                Token.create(token);
            });
        }
    });
}

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
