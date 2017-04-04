var socket = require('./socket');

module.exports = {
    fetch(cb) {
        socket.addHandler('onDialogsFetchResponse', cb);
        socket.call('dialogsFetch', {}, (data) => {
            cb(data)
        });
    },
    fetchMessages(uid, cb) {
        socket.addHandler('onMessagesFetchResponse', cb);
        socket.call('messagesFetch', {uid: uid}, (data) => {
            cb(data)
        });
    }
};