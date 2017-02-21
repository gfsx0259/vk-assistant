var util = require('util');
var Strategy = require('passport-strategy');


var WebSocketStrategy = function (options, verify) {

    Strategy.call(this);

    if (!verify) { throw new TypeError('LocalStrategy requires a verify callback'); }

    this._verify = verify;

    this.name = 'websocket';
};

/**
 * Inherit from `Strategy`.
 */
util.inherits(WebSocketStrategy, Strategy);


WebSocketStrategy.prototype.authenticate = function(params) {

    var email = params.email;
    var password = params.pass;

    this._verifiedCallback =  function (err, user, params, socket) {
        if (!err && user) {

            socket.request.session.passport = {user:user};

            socket.request.session.save();

            socket.emit('authorize', {
                result: true,
                user: user
            })
        } else {
            socket.request.session.passport = {};

            socket.emit('authorize', {
                result: false
            })
        }
    };

    this._verify(email, password, this._verifiedCallback, params.socket);
};

module.exports = WebSocketStrategy;