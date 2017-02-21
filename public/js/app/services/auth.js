var socket = require('./socket');

module.exports = {
    login(email, pass, cb) {
        doLogin(email, pass, (res) => {
            if (res.result) {

                localStorage.user = res.user.username;

                if (cb) cb(true);
                this.onChange(true, res.user.username);
            } else {
                if (cb) cb(false);
                this.onChange(false, null);
            }
        })
    },

    logout(cb) {
        console.log('do login');
        doLogout(() => {

            localStorage.user = null;

            if (cb) cb(false);
            this.onChange(false, null);
        })
    },

    loggedIn() {
        return localStorage.user;
    },

    onChange() {
    }
}

function doLogin(email, pass, cb) {

    socket.call('login', {
        email: email,
        pass: pass
    });

    socket.addHandler('authorize', cb);
}

function doLogout(cb) {

    socket.call('logout');

    socket.addHandler('unauthorize', cb);
}