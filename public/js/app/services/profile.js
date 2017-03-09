var socket = require('./socket');

module.exports = {
    saveMapping(params, cb) {
        socket.call('profileSaveMapping', params, (err, data) => {
            cb(err, data)
        });
    }
};