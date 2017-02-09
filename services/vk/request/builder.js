var request = require('request');
var _ = require('lodash');

/**
 *
 * @param appId
 */
var vkRequestBuilderService = function () {};

vkRequestBuilderService.prototype = {
    fetch: function (method, token, params, callback) {

        var requestParams = {};
        var schema = require(__dirname + '/schema');

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
                        callback(false, body.response);
                    } else {
                        callback(true);
                    }
                }
            }
        );
    }
};

module.exports = vkRequestBuilderService;