var socket = require('./socket');

module.exports = {
    login(email, pass, cb) {

        if (user.authorized) {
            this.onChange(true, user.name);
            return
        }

        doLogin(email, pass, (res) => {
            if (res.result) {

                user = {
                    name: res.user.username,
                    authorized: true
                };

                if (cb) cb(true);
                this.onChange(true, res.user.username);
            } else {
                if (cb) cb(false);
                this.onChange(false, null);
            }
        })
    },

    logout(cb) {
        // Удаляем пользователя из сессии
        doLogout(() => {
            // Сбрасываем флаг на клиенте
            user.name = '';
            user.authorized = false;

            if (cb) cb(false);
            this.onChange(false, null);
        })
    },

    loggedIn() {
        return user.authorized;
    },

    onChange() {
    }
};

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