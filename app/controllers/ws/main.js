var vkAuthorizingServiceInstance = require('./../../services/vk/authorizing');
var vkRequestBuilderService = require('./../../services/vk/request/builder');
var vkRequestBuilderServiceInstance = new vkRequestBuilderService();

var passport = require('passport');
var Dialog = require('./../../models/dialog');

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        err
            ? done(err)
            : done(null, user);
    });
});

var User = require('../../models/user').User;

var LocalStrategy = require('../../middleware/passport/strategy');
passport.use(new LocalStrategy(
    {},
    function (username, password, done, socket) {
        User.findOne({username: username}, function (err, user) {
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


module.exports = {
    connection: function (socket) {
        console.log('user connected');

        socket.on('login', function (params) {

            params.socket = socket;

            passport.authenticate('websocket')(params);
        });


        socket.on('logout', function () {

            console.warn('server logout');

            socket.request.session.passport = {};
            socket.request.session.save();

            socket.emit('unauthorize', {
                result: true
            })
        });

        // Получение списка диалогов (первоначально)
        socket.on('dialogsFetch', function () {
            let actualizeTokenPromise = new Promise((resolve, reject) => {
                vkAuthorizingServiceInstance.actualizeToken(function (err, token) {
                    !err ? resolve(token) : reject(err);
                })
            });

            actualizeTokenPromise.then(token => {
                Dialog.find({from_uid: token.user_id}).populate('contact').then((dialogs) => {
                    // Если в базе уже есть диалоги, сразу отдаём их, обновления получим потом
                    if (dialogs.length > 0) {
                        socket.emit('onDialogsFetchResponse', {
                            items: dialogs
                        });
                    }
                }).catch(err => {
                    console.warn(err);
                });
            });
        });


        // Получение списка диалогов (первоначально)
        socket.on('dialogsFetchLongPull', function () {
            let actualizeTokenPromise = new Promise((resolve, reject) => {
                vkAuthorizingServiceInstance.actualizeToken(function (err, token) {
                    !err ? resolve(token) : reject(err);
                })
            });

            actualizeTokenPromise
                .then(token => {
                    return vkRequestBuilderServiceInstance.fetchPromise(
                        'messages.getLongPollServer', token, {});
                })
                .then(data => {

                    console.warn(data);
                    data['wait'] = 25;
                    //data['ts'] = 1719908766;
                    data['act'] = 'a_check';
                    data['mode'] = 2;

                    vkRequestBuilderServiceInstance.fetchLongPull(data,
                        function (err, data) {
                            console.log(data);
                            socket.emit('messages', 'Hello from server ' + data.updates);
                        });
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


        if (socket.request.session.passport && socket.request.session.passport.user) {
            var user = socket.request.session.passport.user;

            // TODO implement real time updating
            vkAuthorizingServiceInstance.actualizeToken(function (err, token) {
                if (!err) {
                    console.log(user, token);

                    // vkRequestBuilderServiceInstance.fetch(
                    //     'messages.getLongPollServer', token, {},
                    //     function (err, data) {
                    //
                    //         console.warn(data);
                    //         data['wait'] = 25;
                    //         //data['ts'] = 1719908766;
                    //         data['act'] = 'a_check';
                    //         data['mode'] = 2;
                    //
                    //         vkRequestBuilderServiceInstance.fetchLongPull(data,
                    //             function (err, data) {
                    //                 console.log(data);
                    //                 socket.emit('messages', 'Hello from server ' + data.updates);
                    //             });
                    //     });


                    socket.on('join', function (data) {
                        socket.emit('messages', 'Hello from server ' + user.username);
                    });

                    socket.on('disconnect', function () {
                        console.log('user disconnected');
                    });
                } else {
                    throw 'Can`t get token';
                }
            });
        } else {
            console.log('User not authorized');
        }
    }
};