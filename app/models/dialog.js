var mongoose = require('mongoose');

var DialogSchema = new mongoose.Schema({
    mid: {type: Number, required: true},
    date: {type: Number},
    out: {type: Number},
    from_uid: {type: Number},  //Current user vk id
    uid: {type: Number},    //User friends ids
    read_state: {type: Number},
    title: {type: String},
    body: {type: String},
    contact:  {type: mongoose.Schema.Types.ObjectId, ref: 'Contact'}
}, {collection: 'dialogs'});

module.exports = mongoose.model('Dialog', DialogSchema);
