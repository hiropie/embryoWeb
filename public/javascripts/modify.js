//specify the interval time in seconds 
var interval = 1;

//specify the path to which screenshots are to be stored
var imgPath = 'screenshots';
var toImage = "./public/images/"

//specify any prefix for the image if needed, preferably with a trailing underscore.Else leave it blank
var imgPrefix = 'screen_';

//specify interval in seconds to clear the screenshots folder.Leave it blank if no need for reset
//blink.jsでは撮影する枚数を示す
var clearInterval = 30;

//時刻を取得する
require('date-utils');
let date = new Date();
let currentTime = date.toFormat('YYYY/MM/DD HH24:MI:SS');

exports.toImage = toImage;
exports.now = currentTime;
exports.interval = interval;
exports.imgPath = imgPath;
exports.imgPrefix = imgPrefix;
exports.clearInterval = clearInterval;