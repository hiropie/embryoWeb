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
        timeTmp = tmpBox;
    });

    socket.on('humi', function(humBox){
        timeHum = humBox;
    });

    socket.on('nowTime', function(time){
        timeList = time;
        $('#time').text(Math.round(timeList[timeList.length - 1]));
        $('#tmp').text(Math.round(timeTmp[timeTmp.length - 1]));
        $('#hum').text(Math.round(timeHum[timeHum.length - 1]));
        // ここでグラフを描く
        // グラフのidはhumGraph,tmpGrap
    });

    $('#pushDispenser').submit(function(){
        socket.emit('humUp', $('#push').val());
        return false;
    });
});

//時間が送られてきたら、timeHumとtimiTmpを使ってグラフを書く
//グラフidは、humGraphとtmpGraph