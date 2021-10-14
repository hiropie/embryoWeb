const socketio = require('socket.io');
const five = require("johnny-five");
const fs = require('fs');
const modify = require('./../public/javascripts/modify');
const generator = require('./../public/javascripts/gif');

var accessNum = 1;
let count = 1;
const WIDTH   = 1280;             // 画像サイズ X
const HEIGHT  = 720;             // 画像サイズ Y
const GifFile = './public/images/gifs/actionScreen';   // 出力ファイル

const board = new five.Board({port: "COM6"}); //ポート名指定はWindowsで必要なため、

function boardDo(server) {
    board.on('ready', function () {
        var led = new five.Led(7);
        var bme280 = new five.IMU({
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
        
        var sio = socketio.listen(server);
        sio.on('connection', function(socket) {
            socket.on('chat-message', function() {
                accessNum++;
                console.log('Send message to client accessNum: '+accessNum);
                generator.capture(modify.toImage+modify.imgPath).then(()=>{
                    new Promise((resolve)=>{
                      setTimeout(() => {
                        resolve();
                      }, 2000);
                      console.log("2秒経過");
                    }).then(()=>{
                      generator.mkGif(accessNum);
                    }).then(()=>{
                      sio.emit('chat-message', accessNum);
                    })
                  });
            });
            setInterval(()=>{
              console.log("  気温 : ", tmp);
              console.log("  湿度 : ", hum);
              socket.emit('humi', hum);
              socket.emit('temp', tmp);
            },5000)
            socket.on('humUp', function(){
              console.log('led on');
              led.on();
              setTimeout(() => {
                console.log('led off');
                led.off();
              },5000);
            })
            socket.on("disconnect", function() {
            });
        });
        // setInterval(()=>{
        //     console.log("  気温 : ", tmp);
        //     console.log("  湿度 : ", hum);
        // },5000)
    })
}

module.exports = boardDo;