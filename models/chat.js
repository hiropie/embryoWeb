const socketio = require('socket.io');
const fs = require('fs');
const modify = require('./../public/javascripts/modify');
const generator = require('./../public/javascripts/gif');
// const boardDo = require('./../public/javascripts/arduino');


var accessNum = 1;
let count = 1;
const WIDTH   = 1280;             // 画像サイズ X
const HEIGHT  = 720;             // 画像サイズ Y
const GifFile = './public/images/gifs/actionScreen';   // 出力ファイル名

function chat(server) {
  const sio = socketio.listen(server);
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
        // led.on();
        setTimeout(() => {
          console.log('led off');
          // led.off();
        },500);
      })
      socket.on("disconnect", function() {
      });
  });
};

module.exports = chat;