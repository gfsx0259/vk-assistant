var socket = require('./socket');

module.exports = {
    login(email, pass, cb) {
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

    reg(params, cb) {
        doReg(params, (res) => {
            if (res.status == 'error') {
                switch (res.error.code) {
                    case 11000:
                        alert('Имя пользователя уже существует, пожалуйста, введите другое имя');
                        break;
                    case 0:
                        alert('Ошибка при сохранении, проверьте данные');
                        break;
                }
            }
            cb(res.status == 'success');
        })
    },

    logout(cb) {
        // Удаляем пользователя из сессии
        doLogout(() => {
            // Сбрасываем флаг на клиенте
            user.name = '';
            user.authorized = false;

            location.href = '/';

            if (cb) cb(true);
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

function doReg(params, cb) {
    socket.call('reg', params);
    socket.addHandler('onRegResponse', cb);
}

function doLogout(cb) {
    socket.call('logout');
    socket.addHandler('unauthorize', cb);
}