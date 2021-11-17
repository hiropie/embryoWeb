// accessNumが1になる時、gif全消去でいいかも
// gifが1以外ない時に、更新を押したら新しくgif作る
const socketIo = require('socket.io');
const five = require("johnny-five");
const fs = require('fs');
const modify = require('./../public/javascripts/modify');
const generator = require('./../public/javascripts/gif');

let accessNum = 0;                 
let gifCount = 1;
const WIDTH   = 1280;             // 画像サイズ X
const HEIGHT  = 720;             // 画像サイズ Y
const GifFile = './public/images/gifs/actionScreen';   // 出力ファイル


const board = new five.Board({port: "COM6"}); //ポート名指定はWindowsで必要なため、

let time = []; //中身増える
let humBox = []; //中身増える
let tmpBox = []; //中身増える
let dataBox = [time, tmpBox, humBox];
let NoT = 0; //カウントアップ

function toHour(time){
  let sec = Math.round((time % 60) % 60);
  let min = Math.floor(time / 60) % 60;
  let hour = Math.floor(time / 3600);
  
  return{
    time: time,
    hour: ("00" + hour).slice(-2),
    min: ("00" + min).slice(-2),
    sec: ("00" + sec).slice(-2)
  }
}

function boardDo(server) {
  board.on('ready', function () {
    let startTime = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));;
    console.log(startTime);
    const push = new five.Led(7);
    const ben  = new five.Led(6);
    const bme280 = new five.IMU({
        controller: "BME280",
        address: 0x76, // optional
    });
    // Commenting when there is no sensor
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
      let nowTime = Math.floor((new Date() - startTime)/1000)
      if(NoT < 1440){
        // time[NoT] = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
        time[NoT] = nowTime
        tmpBox[NoT] = tmp
        humBox[NoT] = hum
        // tmpBox[NoT] = 0  //no sensor ver
        // humBox[NoT] = 0  //no sensor ver
      }else{
        time.shift();
        tmpBox.shift();
        humBox.shift();
        time.push(nowTime)
        tmpBox.push(tmp)
        humBox.push(hum)
      }
      NoT++;
      setTimeout(array,5000);
    },5000)

    setTimeout(function flag(){
      accessNum = 0;
      setTimeout(flag,3600000);
    },3600000)

    const sio = socketIo.listen(server);
    sio.on('connection', function(socket) {   //socket server run!!
      console.log('connect!!!');
      socket.emit("connect",startTime)      

      if(accessNum == 0){  //first access capture 
        accessNum = 1;
        console.log("gif make!");
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
        console.log("no gif make!");
        if(gifCount >= 2){
          socket.emit("Show", gifCount);
        }else{
          socket.emit("Show", accessNum);
        }
      }

      socket.on('capture', function() {
          gifCount++;
          console.log('Send message to client accessNum: '+gifCount);
          generator.capture(modify.toImage+modify.imgPath).then(()=>{
              new Promise((resolve)=>{
                setTimeout(() => {
                  resolve();
                }, 2000);
                console.log("2秒経過");
              }).then(()=>{
                generator.mkGif(gifCount);
              }).then(()=>{
                setTimeout(function(){
                  sio.emit('Show', gifCount);
                },5000);
              })
            });
      });

      socket.on('draw', function(){
        let elaps = toHour((new Date() - startTime)/1000) 
        console.log('sent ' + elaps.hour + ":" + elaps.min + ":" + elaps.sec);
          socket.emit('temp', tmpBox); 
          socket.emit('humi', humBox); 
          socket.emit('nowTime', time);
          socket.emit('reDraw');
      })

      socket.on("update", function(){
        if(gifCount >= 2){
          socket.emit("Show", gifCount);
          console.log("gifCount:"+gifCount);
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
      })
    });
  })
}

module.exports = boardDo;