let _ = require('lodash');
let profileService = require('../../services/profile');

module.exports.respond = (socket) => {

    let profileServiceInstance = new profileService(socket);

    socket.on('profileSaveMapping', (data, cb) => {
        profileServiceInstance.saveMapping(data, cb);
    });

    socket.on('profileFetch', (data, cb) => {
        profileServiceInstance.fetch(cb);
    })
};