var express = require('express');
var passport = require('passport');
var webpack = require('webpack');

var app = express();

if (process.env.NODE_ENV !== 'production') {
    // Для автоматического обновления модулей на клиенте 
    var webpackDevMiddleware = require('webpack-dev-middleware');
    var webpackHotMiddleware = require('webpack-hot-middleware');
    var compiler = webpack(require('./webpack.config'));

    app.use(webpackDevMiddleware(compiler, {noInfo: true, publicPath: '/dist/'}));
    app.use(webpackHotMiddleware(compiler));
}

app.use(express.static('public/js'));

app.set('json spaces', 40);

// Set up the Session middleware using a MongoDB session store
expressSession = require("express-session");
var sessionMiddleware = expressSession({
    secret: "vk-assistant",
    store: new (require("connect-mongo")(expressSession))({
        url: "mongodb://localhost/vk-assistant"
    }),
    resave: true,
    saveUninitialized: true
});

app.use(sessionMiddleware);

// init middleware
var bootstrap = require('./app/bootstrap');
new bootstrap(app);

// create server base on app
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.use(function(socket, next){
    // Wrap the express middleware
    sessionMiddleware(socket.request, {}, next);
});

let User = require('./app/models/user').User;

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        err ? done(err) : done(null, user);
    });
});

// processing ws connections
io.on('connection', (socket) => {

    socket.on('clients', (data, cb) => {
        cb('23');
    });

    require('./app/controllers/ws/users').respond(socket);
    require('./app/controllers/ws/dialogs').respond(socket);
});

// authentication middleware
app.use(passport.initialize());
app.use(passport.session());

// pass user data to views
app.use(function(req,res,next){
    var user = {
        name: req.user ? req.user.username : '',
        authorized: req.user ? true : false
    };

    res.locals.user  = user;
    res.locals.userJson = JSON.stringify(res.locals.user);
    next();
});

var mustBeAuthenticated = function (req, res, next) {
    req.isAuthenticated() ? next() : res.json({status: 'err', msg: 'authentication is required for requested action'});
};

app.all('/services', mustBeAuthenticated);
app.all('/services/*', mustBeAuthenticated);

app.get('/', function (req, res) {
    res.render('home', {user: req.user});
});

var ServicesController = require('./app/controllers/http/services');

app.get('/services', ServicesController.getHandler('home'));
app.get('/services/msg', ServicesController.getHandler('msg'));
app.get('/services/profile', ServicesController.getHandler('profile'));
app.get('/services/dialogs', ServicesController.getHandler('dialogs'));
app.get('/services/send', ServicesController.getHandler('send'));
app.post('/services/setLike', ServicesController.getHandler('setLike'));
app.get('/services/photos', ServicesController.getHandler('photos'));

http.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
