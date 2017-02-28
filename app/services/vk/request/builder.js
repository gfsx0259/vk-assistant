var request = require('request');
var _ = require('lodash');
var schema = require('./schema');

/**
 *
 * @param appId
 */
var vkRequestBuilderService = function () {};

vkRequestBuilderService.prototype = {
    fetch: function (method, token, params, callback) {

        var requestParams = {};
        var schema = require('./schema');

        if (typeof schema[method] == 'undefined') {
            throw 'Can`t get request schema';
        }

        schema[method].forEach(function (value) {
            if (params[value]) {
                requestParams[value] = params[value];
            }
        });

        requestParams = _.merge(requestParams, {access_token: token.access_token});

        console.log(method);
        request.post(
            'https://api.vk.com/method/' + method,
            {
                form: requestParams
            },
            function (error, response, body) {
                // If response is correct
                console.log(body);
                if (!error && response.statusCode == 200) {
                    body = JSON.parse(body);
                    // Check auth error
                    if (!body.error) {
                        callback(false, Array.isArray(body.response) ? body.response.filter(function (value) { return typeof value == 'object' }) : body.response);
                    } else {
                        callback(true);
                    }
                } else {
                    throw 'An error occurred during the execution of the API request'
                }
            }
        );
    },
    fetchPromise: function (method, token, params) {
        return new Promise((resolve, reject) => {
            var requestParams = {};
            schema[method].forEach(function (value) {
                if (params[value]) {
                    requestParams[value] = params[value];
                }
            });
            requestParams = _.merge(requestParams, {access_token: token.access_token});
            request.post(
                'https://api.vk.com/method/' + method, {
                    form: requestParams
                },
                function (error, response, body) {
                    body = JSON.parse(body);
                    resolve(body.response);
                }
            );
        });


    },

    fetchLongPull: function (params, callback) {
        console.log(params);
        request.post(
            'https://' + params['server'],
            {
                form: params
            },
            function (error, response, body) {
                console.log(error);
                // If response is correct
                if (!error) {
                    body = JSON.parse(body);
                    // Check auth error
                    if (!body.error) {
                        callback(false, body);
                    } else {
                        callback(true);
                    }
                } else {
                    throw 'An error occurred during the execution of the API request'
                }
            }
        );
    }
};

module.exports = vkRequestBuilderService;