var socket = function () {
    this.io = io();
};

socket.prototype = {
    call: function (method, params) {
        this.io.emit(method, params);
    },
    addHandler: function (method, cb) {
        this.io.on(method, cb);
    }
}

module.exports = new socket();