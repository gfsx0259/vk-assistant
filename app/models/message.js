var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    _id: {type: Number, required: true},
    date: {type: Number},
    out: {type: Number},
    from_uid: {type: Number},  //Current user vk id
    uid: {type: Number},    //User friends ids
    read_state: {type: Number},
    title: {type: String},
    body: {type: String},
}, {collection: 'messages'});

module.exports = mongoose.model('Message', MessageSchema);
