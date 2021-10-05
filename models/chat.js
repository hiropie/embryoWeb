const socketio = require('socket.io');
function chat(server) {
    const sio = socketio.listen(server);
    sio.on('connection', function(socket) {
        socket.on('chat-message', function(msg) {
            console.log('Send message to client');
            sio.emit('chat-message', msg + '💛');
        });
        socket.on("disconnect", function() {
        });
    });
};
module.exports = chat;