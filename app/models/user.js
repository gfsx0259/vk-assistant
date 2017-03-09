var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true, min: 6, max: 20},
    password: {type: String, required: true},
    sex: {type: Number},
    date: {type: Number, default: Date.now},
    token:  {type: mongoose.Schema.Types.ObjectId, ref: 'Token'}
}, {collection: 'users'});

module.exports = {
    User: mongoose.model('User', UserSchema)
};
