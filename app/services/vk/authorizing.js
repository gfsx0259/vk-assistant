let vkAuth = require('vk-auth');
let ip = require("ip");
let _ = require('lodash');

// Include models
let Token = require('./../../models/token').Token,
    User = require('./../../models/user').User,
    Config = require('./../../config/main');


class vkAuthorizingService {
    constructor(appId) {
        this.appId = appId;
    }

    /**
     * Объект, выполняющий авторизацию
     * @param scopes
     * @returns {*}
     */
    getAuth(scopes) {
        return vkAuth(this.appId, scopes || ['messages', 'photos', 'wall']);
    }

    /**
     * Вызывает callback, в качестве параметра передаёт токен
     * @param userId
     * @param cb
     */
    actualizeToken(userId, cb) {
        let findUserPromise = User
            .findOne({_id: userId})
            .populate('token');

        findUserPromise.then((user) => {
            // Если токена не существует - значит ещё нет привязки
            if (!user.token) {
                return false;
            }
            // Самостоятельно проверяем токен
            if (user.token && user.token.ip == ip.address() && parseInt(user.token.date) + (user.token.expires_in * 1000) > Date.now()) {
                cb(null, user.token);
            } else {
                this.getAuth().authorize(user.token.email, user.token.password, (err, token) => {

                    // Save to db token collection
                    token = _.merge(token, {
                        ip: ip.address(),
                        date: Date.now(),
                        email: user.token.email
                    });

                    Token.findOneAndUpdate(
                        {email: user.token.email}, token, {upsert: true}, (err) => {
                            if (!err) {
                                cb(null, token);
                            }
                        });
                });
            }
        }).catch(err => {
            console.warn(err);
        });
    }
}

module.exports = new vkAuthorizingService(Config.application.id);