var request = require('request');
var _ = require('lodash');
var schema = require('./schema');

/**
 *
 * @param appId
 */
var vkRequestBuilderService = function () {};

vkRequestBuilderService.prototype = {
    // TODO deprecated
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
        request.post(
            'https://api.vk.com/method/' + method,
            {
                form: requestParams
            },
            function (error, response, body) {
                // If response is correct
                if (!error && response.statusCode == 200) {
                    body = JSON.parse(body);
                    // Check auth error
                    if (!body.error) {
                        callback(false, Array.isArray(body.response) ? body.response.filter((value) => { return typeof value == 'object' }) : body.response);
                    } else {
                        callback(true);
                    }
                } else {
                    throw 'An error occurred during the execution of the API request'
                }
            }
        );
    },


    /**
     * Метод для осуществления запроса к VK API
     * @param method
     * @param token
     * @param params
     * @returns {Promise}
     */
    fetchPromise: function (method, token, params) {
        return new Promise((resolve, reject) => {
            let requestParams = {};
            schema[method].forEach(function (value) {
                if (params[value]) {
                    requestParams[value] = params[value];
                }
            });
            request.post(
                'https://api.vk.com/method/' + method, {
                    form: _.merge(requestParams, {access_token: token.access_token})
                },
                function (err, response, body) {
                    !err ? resolve(JSON.parse(body).response) : reject(err);
                }
            );
        });
    },

    /**
     * Метод для осуществления запроса к VK API LongPull Server
     * @param params
     * @returns {Promise}
     */
    fetchLongPull: function (params) {
        return new Promise((resolve, reject) => {
            request.post(
                'https://' + params['server'], {form: params},
                (err, response, body) => {
                    !err ? resolve(JSON.parse(body)) : reject(err);
                }
            );
        });
    }
};

module.exports = vkRequestBuilderService;