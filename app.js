var request = require('request');
var express = require('express');
var vkAuth = require('vk-auth');
var mongoose = require('mongoose');
var hbs = require('express-handlebars');

mongoose.connect('mongodb://localhost/vk-assistant');

// Protected user login data
var userCredentials = {
    email: 'v8199@yandex.ru',
    password: 'tartar777'
};

var schema = new mongoose.Schema({
    email: {type: String},
    user_id: {type: Number},
    token: {type: String},
    exp: {type: Number},
    date: {type: Date, default: Date.now}
}, {collection: 'tokens'});

var Token = mongoose.model('Token', schema);

var app = express();

app.engine('handlebars', hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var config = {
    app_id: '5859498'
};

var authInstance = vkAuth(config.app_id, 'messages');

app.get('/', function (req, res) {

    var method = 'messages.get';

    // Trying to get token data from DB
    fetchToken(userCredentials.email, function (err, tokenObject) {

        tokenObject = tokenObject[0];

        // If token data was fetched already
        if (tokenObject) {
            callApi(method, tokenObject, res);
        } else {
            authInstance.authorize(userCredentials.email, userCredentials.password, function (err, tokenParams) {
                tokenParams['email'] = userCredentials.email;
                // Save to db token collection
                saveToken(tokenParams);
                callApi(method, tokenParams, res);
            });
        }
    });
});

/**
 * Make vk api request
 * @param method
 * @param tokenObject
 * @param res
 */
function callApi(method, tokenObject, res) {
    request.post(
        'https://api.vk.com/method/' + method,
        {
            form: {
                access_token: tokenObject.access_token,
                count: 5
            }
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {

                var items = JSON.parse(body).response;

                items.filter(function (value) {
                    return typeof value == 'object';
                });

                res.render('home', {
                    items: items
                });
            }
        }
    );
}


/**
 * Fetch token from db by email
 * @param email
 * @param callback
 */
function fetchToken(email, callback) {
    Token.collection.find({email: email}, {limit: 1}).toArray(callback);
}


/**
 * Save token to db
 * @param params
 */
function saveToken(params) {
    Token.collection.insert(params, onInsert);

    function onInsert(err) {
        if (!err) {
            console.info('Token params were successfully stored.');
        }
    }
}

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
