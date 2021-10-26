let dataBox = [];
let now;
let nowTmp;
let nowHum;
let num = 0;

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

    socket.on('temp', function(tmp){
        nowTmp = tmp;
    });

    socket.on('humi', function(hum){
        nowHum = hum;
    });

    socket.on('nowData', function(time){
        dataBox.push([time, nowTmp, nowHum]);
        now = toHour(Math.round(time));        
        $('#time').text(now.hour + ":" + now.min + ":" + now.sec);
        $('#tmp').text(Math.round(nowTmp));
        $('#hum').text(Math.round(nowHum));
        // ここでグラフを描く

       

        // グラフのidはhumGraph,tmpGrap
        num++;
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