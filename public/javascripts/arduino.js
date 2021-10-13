const five = require("johnny-five");
const board = new five.Board({port: "COM3"}); //ポート名指定はWindowsで必要なため、

 

const boardDo = board.on('ready', function () {
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

  //led.blink(500);

//   setInterval(()=>{
//     console.log("  気温 : ", tmp);
//     console.log("  湿度 : ", hum);
//   },5000)
})

module.exports = boardDo;