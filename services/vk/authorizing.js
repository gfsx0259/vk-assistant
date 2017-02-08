var ip = require("ip");
var vkAuth = require('vk-auth');

// Include config
var Token = require(__dirname + '/../../models/token').Token;
var Config = require(__dirname + '/../../config/main');

/**
 *
 * @param appId
 */
var vkAuthorizingService = function (appId) {
    this.appId = appId;
};

vkAuthorizingService.prototype = {
    /**
     * Объект, выполняющий авторизацию
     * @param scopes
     * @returns {*}
     */
    getAuth: function (scopes) {
        return vkAuth(this.appId, scopes || ['messages']);
    },
    /**
     * Вызывает callback, в качестве параметра передаёт токен
     * @param cb
     */
    actualizeToken: function (cb) {
        Token.findByEmail(Config.user.credentials.email, function (err, token) {

            // Самостоятельно проверяем токен
            if (token && token.ip == ip.address() && parseInt(token.date) + (token.expires_in * 1000) > Date.now()) {
                cb(false, token);
            } else {
                this.getAuth().authorize(Config.user.credentials.email, Config.user.credentials.password, function (err, token) {

                    // Save to db token collection
                    token['email'] = Config.user.credentials.email;
                    token['ip'] = ip.address();

                    // TODO Корректно обновлять токен, не создавать новый
                    Token.create(token, function(err) {
                        if (!err) {
                            cb(token);
                        }
                    });
                });
            }
        }.bind(this));
    }
};

module.exports = new vkAuthorizingService(Config.application.id);