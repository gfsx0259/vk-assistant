var mongoose = require('mongoose');

var TokenSchema = new mongoose.Schema({
    email: {type: String},
    user_id: {type: Number},
    access_token: {type: String},
    ip: {type: String},
    expires_in: {type: Number},
    password: {type: String},
    date: {type: Number, default: Date.now}
}, {collection: 'tokens'});

TokenSchema.statics.findByEmail = function (email, callback) {
    return this.findOne({email: email}, callback);
}

module.exports = {
    Token: mongoose.model('Token', TokenSchema)
}
