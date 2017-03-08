class socket {
    constructor() {
        this.io = io();
    }
    call(method, params, cb) {
        this.io.emit(method, params, cb);
    }
    addHandler(method, cb) {
        this.io.on(method, cb);
    }
}

module.exports = new socket();