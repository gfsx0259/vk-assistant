process.env.NODE_ENV = 'development';

var express = require('express');
var passport = require('passport');

var User = require('./app/models/user').User;

var app = express();

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

app.use(express.static('public/js/dist'));
app.use(express.static('public/js/lib'));

app.use('/node_modules', express.static(__dirname + '/node_modules'));


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

// processing ws connections
var socketController = require('./app/controllers/ws/main');
io.on('connection', socketController.connection);

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



passport.serializeUser(function(user, done) {
    console.log('ddddd');

    done(null, user);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user){
        err
            ? done(err)
            : done(null, user);
    });
});

var mustBeAuthenticated = function (req, res, next) {
    req.isAuthenticated() ? next() : res.json({status: 'err', msg: 'authentication is required for requested action'});
};

app.all('/services', mustBeAuthenticated);
app.all('/services/*', mustBeAuthenticated);

app.get('/', function (req, res) {
    res.render('home', {user: req.user});
});

var UsersController = require('./app/controllers/http/users');

// authentication form page
app.get('/user/login', UsersController.getHandler('login'));
// process authentication form

app.get('/user/logout', UsersController.getHandler('logout'));
app.get('/user/reg', UsersController.getHandler('regForm'));
app.post('/user/reg', UsersController.getHandler('regProcess'));

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
