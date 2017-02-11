var mongoose = require('mongoose');

var ContactSchema = new mongoose.Schema({
    user_id: {type: Number},
    first_name: {type: String},
    last_name: {type: String},
    photo_200: {type: String},
    date: {type: Number, default: Date.now}
}, {collection: 'contacts'});

ContactSchema.statics.findByIds = function (ids, callback) {
    return this.find({'user_id': { $in: ids}}, callback);
};

module.exports = {
    Contact: mongoose.model('Contact', ContactSchema)
};
