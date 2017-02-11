var express = require('express');
var mongoose = require('mongoose');
var hbs = require('express-handlebars');

var User = require('./app/models/user').User;

var app = express();

// initialize database connection
mongoose.connect('mongodb://localhost/vk-assistant');

app.engine('hbs', hbs(
    {
        defaultLayout: 'main',
        layoutsDir: './app/views/layouts'}
    ));

app.set('view engine', 'hbs');
app.set('views', './app/views/scripts');

// parses request cookies to req.cookies
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// parses json, x-www-form-urlencoded, and multipart/form-data
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// use req.session as data store
var session = require('cookie-session');
app.use(session({keys: ['secret']}));

// TODO move user functionality to their controller
// authentication middleware
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

// pass user data to views
app.use(function(req,res,next){
    res.locals.user = req.user;
    next();
});

var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username : username},function(err, user){
            return err
                ? done(err)
                : user
                    ? password === user.password
                        ? done(null, user)
                        : done(null, false, { message: 'Incorrect password.' })
                    : done(null, false, { message: 'Incorrect username.' });
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user){
        err
            ? done(err)
            : done(null, user);
    });
});

var auth = passport.authenticate(
    'local', {
        successRedirect: '/services',
        failureRedirect: '/user/login'
    }
);

var mustBeAuthenticated = function (req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/user/login');
};

// authentication form page
app.get('/user/login', function(req, res) {
    res.render('user/login', {});
});

// process authentication form
app.post('/user/login', auth);

app.get('/user/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// authentication form page
app.get('/user/reg', function(req, res) {
    res.render('user/reg');
});

// authentication form page
app.post('/user/reg', function(req, res) {
    // TODO check for unique, validation
    var user = new User({ username: req.body.username, password: req.body.password});
    user.save(function(err) {
        res.redirect('/user/login');
    });
});

app.get('/', function (req, res) {
    res.render('home', {user: req.user});
});

var ServicesController = require('./app/controllers/services');

app.all('/services', mustBeAuthenticated);
app.all('/services/*', mustBeAuthenticated);

app.get('/services', ServicesController.getHandler('home'));
app.get('/services/msg', ServicesController.getHandler('msg'));
app.get('/services/profile', ServicesController.getHandler('profile'));
app.get('/services/dialogs', ServicesController.getHandler('dialogs'));
app.get('/services/send', ServicesController.getHandler('send'));

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
