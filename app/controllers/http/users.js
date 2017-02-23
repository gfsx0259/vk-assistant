var User = require('../../models/user').User;

var actions = {
    login: function(req, res) {
        res.render('user/login');
    },
    logout: function(req, res) {
        req.logout();
        res.redirect('/');
    },
    regForm: function(req, res) {
        res.render('user/reg');
    },
    regProcess: function (req, res) {
        // TODO check for unique, validation
        var user = new User({ username: req.body.username, password: req.body.password});
        user.save(function() {
            res.redirect('/user/login');
        });
    }
};

/**
 * Constructor
 */
var users = function () {};

users.prototype = {
    getHandler: function (name) {
        return function (req, res) {
            actions[name].call(this, req, res);
        }
    }
};

module.exports = new users();
