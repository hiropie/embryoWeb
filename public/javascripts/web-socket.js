let dataT = [];
let dataH = [];
let timeList;
let timeHum;
let timeTmp;
let now;

let num = 0;

$(function() {
    let tmpChart = new Highcharts.Chart(op1);
    let humChart = new Highcharts.Chart(op2);

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
        dataT.push([timeList[timeList.length - 1], timeTmp[timeTmp.length - 1]]);
        dataH.push([timeList[timeList.length - 1], timeHum[timeHum.length - 1]]);
        now = toHour(Math.round(timeList[timeList.length - 1]));        
        $('#time').text(now.hour + ":" + now.min + ":" + now.sec);
        $('#tmp').text(Math.round(dataT[dataT.length-1][1]));
        $('#hum').text(Math.round(dataH[dataH.length-1][1]));
    });

    $('#pushDispenser').submit(function(){
        socket.emit('humUp', $('#push').val());
        return false;
    });

    setInterval(()=>{
        reChart(dataT, dataH);
    },10000)

});

function reChart(dataT,dataH){
    tmpChart.destroy();
    humChart.destroy();
    op1.series = dataT;
    op2.series = dataH;
    tmpChart = new Highcharts.Chart(op1);
    humChart = new Highcharts.Chart(op2);
}

let op1 = {
    chart: {
      renderTo: tmpGraph,
      type: 'line',
    },
    title: {
    },
    xAxis: {
      gridLineWidth: 1,
      // labels: {
      //   step: 30
      // },
      min: 0
    },
    yAxis: {
      min: 20,
      gridLineWidth: 1,
      type: 'linear'
    },
    series: [{
        name: 'temperture',
        data: []
    }]
  };

  let op2 = {
    chart: {
      renderTo: humGraph,
       type: 'line',
    },
    title: {
    },
    xAxis: {
      gridLineWidth: 1,
      // labels: {
      //   step: 30
      // },
      min: 0
    },
    yAxis: {
      min: 20,
      gridLineWidth: 1,
      type: 'linear'
    },
    series: [{
        name: 'humidity',
        data: []
      }
    ]
  };

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