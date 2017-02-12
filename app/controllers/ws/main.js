module.exports = {
  connection: function (socket) {
      console.log('user connected');
      if (socket.request.session.passport.user) {
          var user = socket.request.session.passport.user;
          socket.on('join', function(data) {
              socket.emit('messages', 'Hello from server ' + user.username);
          });

          socket.on('disconnect', function(){
              console.log('user disconnected');
          });
      } else {
          console.log('User not authorized');
      }
  }
};