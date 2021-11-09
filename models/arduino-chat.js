const socketio = require('socket.io');
const five = require("johnny-five");
const fs = require('fs');
const modify = require('./../public/javascripts/modify');
const generator = require('./../public/javascripts/gif');

let accessNum = 0;                 
let gifcount = 1;
const WIDTH   = 1280;             // 画像サイズ X
const HEIGHT  = 720;             // 画像サイズ Y
const GifFile = './public/images/gifs/actionScreen';   // 出力ファイル

const board = new five.Board({port: "COM6"}); //ポート名指定はWindowsで必要なため、
let time = []; //中身増える
let humBox = []; //中身増える
let tmpBox = []; //中身増える
let dataBox = [time, tmpBox, humBox];
let NoT = 0; //カウントアップ

function boardDo(server) {
  board.on('ready', function () {
    let startTime = new Date();
    console.log(startTime);
    const push = new five.Led(7);
    const ben  = new five.Led(6);
    const bme280 = new five.IMU({
        controller: "BME280",
        address: 0x76, // optional
    });
    bme280.on("data", function(e,data) {
        if( this.barometer.pressure >90 ){      //気圧の初回値が変なので、異常値は読み飛ばす
          hum = this.hygrometer.relativeHumidity;
          tmp = this.temperature.celsius;
          //console.log("  celsius(摂氏)      : ", this.temperature.celsius);
          //console.log("  fahrenheit(華氏)   : ", this.temperature.fahrenheit);
          //console.log("  pressure(hPa)     : ", this.barometer.pressure *10);
          //console.log("  relative humidity(相対湿度) : ", hum);
          //console.log("--------------------------------------");
          //process.exit(); //終了
        }
    });
    
    setTimeout(function array(){
      if(NoT < 1799){
        time[NoT] = new Date();; 
        tmpBox[NoT] = tmp;
        humBox[NoT] = hum;
      }else{
        time.shift();
        tmpBox.shift();
        humBox.shift();
        time.push(new Date()); 
        tmpBox.push(tmp);
        humBox.push(hum);
      }
      // console.log("  時間 : <", time[NoT], ">");
      // console.log("  気温 : ", tmp);
      // console.log("  湿度 : ", hum);
      NoT++;
      setTimeout(array,1000);
    },5000)

    // setInterval(()=>{
    //   console.log('time Open');
    //   ben.on();
    //   console.log('push start');
    //   push.on();
    //   setTimeout(() => {
    //     console.log('push end');
    //     push.off();
    //     console.log('time close');
    //     ben.off();
    //   },4500);
    // },900000)

    setTimeout(function flag(){
      accessNum = 0;
      setTimeout(flag,3600000);
    },3600000)

    var sio = socketio.listen(server);
    sio.on('connection', function(socket) {   //socket server run!!
      console.log('connect!!!');
            
      if(accessNum == 0){  //first access capture 
        accessNum = 1;
        console.log("It's been over an hour since our last update.");
        generator.capture(modify.toImage+modify.imgPath).then(()=>{
          new Promise((resolve)=>{
            setTimeout(() => {
              resolve();
            },2000);
            console.log("2秒経過");
          }).then(()=>{
            generator.mkGif(accessNum);
          }).then(()=>{
            setTimeout(function(){
              sio.emit('Show', accessNum);
            },5000);
          })
        });
      }else{
        console.log("It's been less than an hour since our last update.");
        if(gifcount >= 2){
          socket.emit("Show", gifcount);
        }else{
          socket.emit("Show", accessNum);
        }
      }

      socket.on('capture', function() {
          gifcount++;
          console.log('Send message to client accessNum: '+gifcount);
          generator.capture(modify.toImage+modify.imgPath).then(()=>{
              new Promise((resolve)=>{
                setTimeout(() => {
                  resolve();
                }, 2000);
                console.log("2秒経過");
              }).then(()=>{
                generator.mkGif(gifcount);
              }).then(()=>{
                setTimeout(function(){
                  sio.emit('Show', gifcount);
                },5000);
              })
            });
      });

      socket.on('draw', function(){
        console.log('sent' + new Date());
          socket.emit('temp', tmpBox); 
          socket.emit('humi', humBox); 
          socket.emit('nowTime', time);
          socket.emit('reDraw', time);
      })

      socket.on("update", function(){
        if(gifcount >= 2){
          socket.emit("Show", gifcount);
          console.log("gifcount:"+gifcount);
        }else{
          socket.emit("Show", accessNum);
          console.log("accessNum:"+accessNum);
        }
      })

      socket.on('humUp', function(){
        console.log('web Open');
        ben.on();
        console.log('push start');
        push.on();
        setTimeout(() => {
          console.log('push end');
          push.off();
          console.log('web close');
          ben.off();
        },4500);
      })



    

      socket.on("disconnect", function() {
        console.log("connection cutting")
      });
    });
  })
}

module.exports = boardDo;

//時間、湿度、温度のデータを配列で送って、server-socketでグラフ化
//配列は時間と回数で入れ替える。入れ替えにはshiftプロパティを使う
