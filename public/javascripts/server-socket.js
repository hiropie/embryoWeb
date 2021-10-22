let timeList;
let timeHum;
let timeTmp;

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

    socket.on('temp', function(tmpBox){
        timeTmp = tmp;
        $('#tmp').text(timeTmp);
    });

    socket.on('humi', function(humBox){
        timeHum = hum;
        $('#hum').text(timeHum);
    });

    socket.on('time', function(time){
        timeList = time;
    });

    $('#pushDispenser').submit(function(){
        socket.emit('humUp', $('#push').val());
        return false;
    });
});

//時間が送られてきたら、timeHumとtimiTmpを使ってグラフを書く
//グラフidは、humGraphとtmpGraph