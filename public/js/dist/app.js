var socket = io();

socket.on('connect', function (data) {
    socket.on('messages', function (data) {
        alert(data);
    });
});

$(function () {
    $('#send').click(function () {
        socket.emit('join', 'Hello World from client');
    });
});