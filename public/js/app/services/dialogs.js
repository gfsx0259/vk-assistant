var socket = require('./socket');

module.exports = {
    fetch(cb) {
        doFetch(cb);
    },
    fetchLongPull(cb) {
        doFetchLongPull(cb);
    }
};


function doFetch(cb) {
    socket.call('dialogsFetch');
    socket.addHandler('onDialogsFetchResponse', cb);
}

function doFetchLongPull(cb) {
    socket.call('dialogsFetchLongPull');
    socket.addHandler('onDialogsFetchLongPullResponse', cb);
}