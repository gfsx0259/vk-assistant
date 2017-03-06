let dialogService = require('../../services/vk/dialogs');

module.exports.respond = (socket) => {
    let dialogServiceInstance = new dialogService(socket);

    // Получение списка диалогов из БД
    socket.on('dialogsFetch', () => {
        dialogServiceInstance.dialogsFetch();
    });

    // Запрос на получение обновлений
    socket.on('dialogsFetchLongPull', () => {
        dialogServiceInstance.dialogsFetchLongPull();
    });
};
