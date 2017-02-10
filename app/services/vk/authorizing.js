var vkAuth = require('vk-auth');
var ip = require("ip");

// Include config
var Token = require('./../../models/token').Token;
var Config = require('./../../config/main');

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
                cb(null, token);
            } else {
                this.getAuth().authorize(Config.user.credentials.email, Config.user.credentials.password, function (err, token) {

                    // Save to db token collection
                    token.ip = ip.address();
                    token.date = Date.now();
                    token.email = Config.user.credentials.email;

                    Token.findOneAndUpdate(
                        {email: token['email']}, token, {upsert: true}, function(err, doc){
                        if(!err){
                            cb(null, token);
                        }
                    });
                });
            }
        }.bind(this));
    }
};

module.exports = new vkAuthorizingService(Config.application.id);