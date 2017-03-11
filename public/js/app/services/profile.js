var socket = require('./socket');

module.exports = {
    saveMapping(params, cb) {
        socket.call('profileSaveMapping', params, (err, data) => {
            cb(err, data)
        });
    },
    fetchContact(cb) {
        socket.call('profileFetch', {}, (err, contact) => {
            cb(err, contact)
        });
    }
};