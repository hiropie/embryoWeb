let dataT = [];
let dataH = [];
let timeList;
let timeHum;
let timeTmp;
let now;

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
        timeTmp = tmp;
    });

    socket.on('humi', function(hum){
        timeHum = hum;
    });


    socket.on('nowTime', function(time){
        timeList = time;
        // dataT.push([timeList[timeList.length - 1], timeTmp[timeTmp.length - 1]]);
        // dataH.push([timeList[timeList.length - 1], timeHum[timeHum.length - 1]]);
        now = toHour(Math.round(timeList[timeList.length - 1]));        
        $('#time').text(now.hour + ":" + now.min + ":" + now.sec);
        $('#tmp').text(Math.round(timeTmp[timeTmp.length-1]));
        $('#hum').text(Math.round(timeHum[timeHum.length-1]));
    });

    $('#pushDispenser').submit(function(){
        socket.emit('humUp', $('#push').val());
        return false;
    });

    var options = {
        chart: {
            // renderTo: 'tmpGraph',　
        },
        title: {
            text: 'Title'
        },
        subtitle: {
            text: 'SubTitle'
        },
        xAxis: [{
    　　title: {
                text: '時刻',         
            },
            categories: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00' ],
        }],
        yAxis: [{ // Primary yAxis
            title: {
                text: '気温',
            }
        }],
        series: [{
            name: '気温',
            type: 'spline',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5],
            tooltip: {
                valueSuffix: ' ℃' 
            }
        }]
    };
    let chart1 = new Highcharts.Chart("tmpGraph", options);
    let chart2 = new Highcharts.Chart("humGraph", options);

    socket.on("reDraw",function(){
        options.series[0].data = [3, 10, 2, 10, 3, 10];
        chart2 = new Highcharts.Chart("humGraph", options);
    });

    $('#change').click(function(){
        options.series[0].data = [3, 10, 2, 10, 3, 10];
        chart1 = new Highcharts.Chart("tmpGraph", options);
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