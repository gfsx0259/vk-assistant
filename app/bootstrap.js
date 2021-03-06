var hbs = require('express-handlebars');
var mongoose = require('mongoose');

var bootstrap = function (app) {
    this.db();
    this.middleware(app);
};

bootstrap.prototype = {
    db: function () {
        // initialize database connection
        mongoose.Promise = global.Promise;
        mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/vk-assistant');
    },
    middleware: function (app) {
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
       // var session = require('cookie-session');
     //   app.use(session({keys: ['secret']}));
    }
};
module.exports = bootstrap;