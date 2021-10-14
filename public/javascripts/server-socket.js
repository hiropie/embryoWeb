$(function() {
    const socket = io();
    $('#gifChange').submit(function() {
        socket.emit('chat-message', $('#reload').val());
        $('#reload').val('');
        return false;
    });
    socket.on('chat-message', function(count) {
        $('#num').text(count);
        $('#embryo_gif').attr('src', '/images/gifs/actionScreen'+(count-1)+'.gif');
    });

    socket.on('humi', function(hum){
        $('#hum').text(hum);
    });

    socket.on('temp', function(tmp){
        $('#tmp').text(tmp);
    });

    $('#pushDispenser').submit(function(){
<<<<<<< HEAD
        socket.emit('humUp', $('#push').val());
=======
        socket.emit('humUp',$('#push').val());
>>>>>>> 385fdbe605fbf7c4025c68f5c148d226f2ee22f9
        return false;
    });
});