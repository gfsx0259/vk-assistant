var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {type: String},
    password: {type: String},
    date: {type: Number, default: Date.now}
}, {collection: 'users'});

module.exports = {
    User: mongoose.model('User', UserSchema)
};
