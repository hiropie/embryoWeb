let timeList;
let timeHum;
let timeTmp;
let now;

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
        now = toHour(Math.round(timeList[timeList.length - 1]));        
        $('#time').text(now.hour + ":" + now.min + ":" + now.sec);
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

function toHour(time){
    let sec = (time % 60) % 60;
    let min = Math.floor(time / 60) % 60;
    let hour = Math.floor(time / 3600);
    
    return{
        hour : hour,
        min: min,
        sec: sec
    }
}

//時間が送られてきたら、timeHumとtimiTmpを使ってグラフを書く
//グラフidは、humGraphとtmpGraph