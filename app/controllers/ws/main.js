var vkAuthorizingServiceInstance = require('./../../services/vk/authorizing');
var vkRequestBuilderService = require('./../../services/vk/request/builder');
var vkRequestBuilderServiceInstance = new vkRequestBuilderService();

module.exports = {
  connection: function (socket) {
      console.log('user connected');
      if (socket.request.session.passport && socket.request.session.passport.user) {
          var user = socket.request.session.passport.user;

          // TODO implement real time updating
          vkAuthorizingServiceInstance.actualizeToken(function (err, token) {
              if (!err) {
                  console.log(user, token);

                  vkRequestBuilderServiceInstance.fetch(
                      'messages.getLongPollServer', token, {},
                      function (err, data) {


                          data['wait'] = 25;
                          //data['ts'] = 1719908766;
                          data['act'] = 'a_check';
                          data['mode'] = 2;

                          vkRequestBuilderServiceInstance.fetchLongPull(data,
                              function (err, data) {
                                  console.log(data);
                                  socket.emit('messages', 'Hello from server ' + data.updates);
                              });
                      });


                  socket.on('join', function(data) {
                      socket.emit('messages', 'Hello from server ' + user.username);
                  });

                  socket.on('disconnect', function(){
                      console.log('user disconnected');
                  });
              } else {
                  throw 'Can`t get token';
              }
          });
      } else {
          console.log('User not authorized');
      }
  }
};