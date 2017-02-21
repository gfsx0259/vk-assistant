var socket = function () {
    this.io = io();

    // socket.on('connect', function (data) {
    //     connect.on('messages', function (data) {
    //         alert(data);
    //     });
    // });
    //
    // $(function () {
    //     $('#send').click(function () {
    //         connect.emit('join', 'Hello World from client');
    //     });
    // });
}

socket.prototype = {
    call: function (method, params) {
        this.io.emit(method, params);
    },
    addHandler: function (method, cb) {
        this.io.on(method, cb);
    }
}

module.exports = new socket();