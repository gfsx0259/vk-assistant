var socket = require('./socket');

module.exports = {
    fetch(cb) {
        socket.addHandler('onDialogsFetchResponse', cb);
        socket.call('dialogsFetch', {}, (data) => {
            cb(data)
        });
    }
};