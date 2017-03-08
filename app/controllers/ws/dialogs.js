let dialogService = require('../../services/vk/dialogs');

module.exports.respond = (socket) => {
    let dialogServiceInstance = new dialogService(socket);

    var timeOut = null;

    // Цикл в рамках одного соединения
    function loop () {
        if (socket.request.session.passport.user) {
            timeOut = setTimeout(() => {
                console.log('run loop after 5 sec');
                dialogServiceInstance.dialogsFetchLongPull(() => {
                    loop()
                });
            }, 5000);
        }
    }

    // Остановить цикл при закрытии соединения
    socket.on('disconnect', () => {
        console.warn('clear timer on doconnect');
       clearTimeout(timeOut);
    });


    // Получение списка диалогов из БД
    socket.on('dialogsFetch', () => {
        dialogServiceInstance.dialogsFetch();
        console.log('run loop firstly');
        // Если пользователь переходил на другую вкладку, но не закрывал соединение,
        // => не создавать новый цикл, если уже существует
        if (!timeOut) {
            console.log('new!!');
            loop();
        }

    });

    // Запрос на получение обновлений
    socket.on('dialogsFetchLongPull', () => {
        dialogServiceInstance.dialogsFetchLongPull();
    });
};
