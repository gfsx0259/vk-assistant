var request = require('request');

/**
 *
 * @param appId
 */
var vkRequestBuilderService = function () {};

vkRequestBuilderService.prototype = {
    fetch: function (method, token, callback) {
        request.post(
            'https://api.vk.com/method/' + method,
            {
                form: {
                    access_token: token.access_token,
                    fields: token.fields,
                    offset: token.offset || '',
                    user_id: token.user_id || '',
                    message: token.message || ''
                }
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