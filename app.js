var express = require('express');
var request = require('request');
var vkAuth = require('vk-auth');
var exphbs  = require('express-handlebars');

var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var config = {
    app_id: '5859498'
};

var authInstance = vkAuth(config.app_id, 'messages');

app.get('/', function (req, res) {

    authInstance.authorize('v8199@yandex.ru', 'tartar777', function (err, tokenParams) {

        var method = 'messages.get';

        request.post(
            'https://api.vk.com/method/' + method,
            {
                form: {
                    access_token: tokenParams.access_token
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {

                    var items = JSON.parse(body).response;

                    items.filter(function(value) {
                        return typeof value == 'Object';
                    });

                    res.render('home', {
                        items: items
                    });
                }
            }
        );
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
