var vkAuth = require('vk-auth');
var request = require('request');

var vkClient = function (appId) {
    this.appId = appId;
};

vkClient.prototype = {
    getAuth: function (scopes) {
        return vkAuth(this.appId, scopes || 'messages');
    },
    fetch: function (method, token, callback) {

        request.post(
            'https://api.vk.com/method/' + method,
            {
                form: {
                    access_token: token.access_token,
                    fields: token.fields,
                    count: 5
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {

                    var items = JSON.parse(body).response;

                    items.filter(function (value) {
                        return typeof value == 'object';
                    });

                    callback(items);
                }
            }
        );
    }
};

module.exports = {
    instance: vkClient
};