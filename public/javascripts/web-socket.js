let dataT = [];
let dataH = [];
let timeList = [];
let timeHum = [];
let timeTmp = [];
let now;
let num = 0;
let clock;

let optionsT = {
    chart: {
        // renderTo: 'tmpGraph',
        zoomType: 'xy',
        borderColor: '#EBBA95',
        borderWidth: 2,
        margin: [100, 100, 100, 100],
    },
    title: {
        text: '温度'
    },
    xAxis: [{
        style: {
            fontSize: '24px',
        },
    　　title: {
                text: '時刻',         
            },
        categories: [],
        // type: "datetime",
        tickInterval: 60,
    }],
    yAxis: [{ // Primary yAxis
        style: {
            fontSize: '24px',
        },
        minorTickInterval: 5,
        min: 20,
        max: 60,
        title: {
            text: '気温'
        }
    }],
    legend: {
        enabled: false
    },
    series: [{
        type: 'line',
        turboThreshold: 0,
        data: [],
        // tooltip: {
        //     valueSuffix: ' ℃' 
        // }
    }]
};

let optionsH = {
    chart: {
        // renderTo: 'humGraph',　
        zoomType: 'xy',
        borderColor: '#EBBA95',
        borderWidth: 2,
        margin: [100, 100, 100, 100],
    },
    title: {
        text: '湿度'
    },
    xAxis: [{
        style: {
            fontSize: '24px',
        },
　　    title: {
            text: '時刻',         
        },
        categories: [],
        // type: "datetime",
        tickInterval: 60,
    }],
    yAxis: [{ // Primary yAxis
        style: {
            fontSize: '24px',
        },
        minorTickInterval: 5,
        min: 20,
        max: 60,
        title: {
            text: '湿度'
        }

    }],
    legend: {
        enabled: false
    },
    series: [{
        type: 'line',
        turboThreshold: 0,
        data: [],
        // tooltip: {
        //     valueSuffix: '%' 
        // }
    }]
};

optionsH.xAxis[0].categories = timeList;
optionsH.series[0].data = timeHum;
chart2 = new Highcharts.Chart("humGraph", optionsH);

optionsT.xAxis[0].categories = timeList;
optionsT.series[0].data = timeTmp;
chart1 = new Highcharts.Chart('tmpGraph', optionsT);

$(function() {
    const socket = io();
    $('#reload').click(function() {
        socket.emit('capture', $('#reload').val());
        $('#reload').val('');
        return false;
    });

    $('#change').click(function(){
        socket.emit('draw',$('#change').val());
        socket.emit('update');
    });

    $('#push').click(function(){
        socket.emit('humUp', $('#push').val());
        return false;
    });
    
    setTimeout(function update(){
        socket.emit("draw")
        setTimeout(update,60000);
    },60000)

    socket.on("connect",function(start){
        const startTime = start;
    })
    
    socket.on('Show', function(count) {
        $('#num').text(count);
        $('#embryo_gif').attr('src', '/images/gifs/actionScreen'+(count)+'.gif');
    });

    socket.on('temp', function(tmp){
        timeTmp = tmp;
    });

    socket.on('humi', function(hum){
        timeHum = hum;
    });


    socket.on('nowTime', function(time){
        for(let i=0; i<time.length; i++){ 
            clock = toHour(time[i])
            timeList[i] = clock.hour + ":" + clock.min + ":" + clock.sec ;
        }
        // now = toHour(Math.round(timeList[timeList.length - 1]));        
        $('#time').text(now.hour + ":" + now.min + ":" + now.sec);
        $('#tmp').text(Math.round(timeTmp[timeTmp.length-1]));
        $('#hum').text(Math.round(timeHum[timeHum.length-1]));
        // ('#time').text(timeList.length);
        // $('#tmp').text(timeTmp.length);
        // $('#hum').text(timeHum.length);
    });

    socket.on("reDraw",function(){
        optionsH.xAxis[0].categories = timeList;
        optionsH.series[0].data = timeHum;
        chart2 = new Highcharts.Chart("humGraph", optionsH);

        optionsT.xAxis[0].categories = timeList;
        optionsT.series[0].data = timeTmp;
        chart1 = new Highcharts.Chart('tmpGraph', optionsT);
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