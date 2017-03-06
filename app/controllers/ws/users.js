let _ = require('lodash');
let User = require('../../models/user').User;

var passport = require('passport');

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser(function (id, done) {
    User.findById(id, (err, user) => {
        err ? done(err) : done(null, user);
    });
});

let LocalStrategy = require('../../middleware/passport/strategy');
passport.use(new LocalStrategy({},
    (username, password, done, socket) => {
        User.findOne({username: username}, (err, user) => {
            return err
                ? done(err, null, null, socket)
                : user
                    ? password === user.password
                        ? done(null, user, null, socket)
                        : done(null, false, {message: 'Incorrect password.'}, socket)
                    : done(null, false, {message: 'Incorrect username.'}, socket);
        });
    }
));

module.exports.respond = (socket) => {
    socket.on('login', (params) => {
        passport.authenticate('websocket')(_.merge(params, {socket: socket}));
    });

    socket.on('logout', () => {
        socket.request.session.passport = {};
        socket.request.session.save();
        socket.emit('unauthorize', {
            result: true
        })
    });

    socket.on('reg', (params) => {
        let user = new User(params);
        user.save((err) => {
            if (err) {
                socket.emit('onRegResponse', {status: 'error', error: {code: err.code || 0}});
            } else {
                socket.emit('onRegResponse', {status: 'success'});
            }
        });
    });
};