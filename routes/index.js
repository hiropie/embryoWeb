'use strict'
const modify = require('./../public/javascripts/modify');
var express = require('express');
var router = express.Router();
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs');
const path = require('path');
const util = require('util');
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");
const screenshot = require('desktop-screenshot');


var accessNum = 0;
let count = 1;
const WIDTH   = 1280;             // 画像サイズ X
const HEIGHT  = 720;             // 画像サイズ Y
const GifFile = './public/images/gifs/actionScreen';   // 出力ファイル名

cleanDir(modify.toImage+"gifs");

/* GET home page. */
router.get('/', function(req, res, next) {
  
  accessNum++;
  makeShot(modify.toImage+modify.imgPath).then(()=>{
    new Promise((resolve)=>{
      setTimeout(() => {
        resolve();
      }, 2000);
      console.log("2秒経過");
    }).then(()=>{
      makeAnimeGif(accessNum);
    })
  });
  var data = {
    title: 'Express',
    num: accessNum,
  };
  res.render('index', data);
});

async function cleanDir(dirName){
    await new Promise((resolve)=>{
    fs.readdir(dirName, function(error, files){
      files.forEach(function(file){
        fs.unlinkSync(dirName+'/'+file);
        //console.log('delete');
      });
    });
  })
}

//スクショ作成
async function makeShot(dirName){
  count = 1;
  cleanDir(dirName);
  await new Promise((resolve)=>{
    // fs.readdir(modify.toImage+modify.imgPath, function(error, files){
    //   files.forEach(function(file){
    //     fs.unlinkSync(modify.toImage+modify.imgPath+'/'+file);
    //     //console.log('delete');
    //   });
    // });

    var loop = setInterval(()=>{
      shots();
      if(count > modify.clearInterval-1){
        clearInterval(loop);
        resolve();
      }
    },modify.interval*100);
  });
}

function shots(){
  screenshot(modify.toImage+modify.imgPath+'/'+count+".jpg", 
    {width: 1280, height: 720, quality: 200}, function(error, complete) {
  if(error)
    console.log("Screenshot failed", error);
  else
    console.log("Screenshot succeeded");
    count++;
  });
}

// convert Gif to MP4
const ffmpeg = require("fluent-ffmpeg")()
  .setFfprobePath(ffprobe.path)
  .setFfmpegPath(ffmpegInstaller.path);

async function convert(num){
  const gifPath = (GifFile+num+'.gif');
  
  ffmpeg
  .input(gifPath)
  .outputOptions([
    "-nostdin",
    "-pix_fmt yuv420p",
    "-c:v libx264",
    "-movflags +faststart",
    "-filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2'",
  ])
  .noAudio()
  .output(modify.toImage+'conversion.mp4')
  .on("end", () => {
    console.log("Converted");
  })
  .on("error", (e) => console.log(e))
  .run();
}

// Get File List
const dirpath = path.join(modify.toImage+modify.imgPath);
const readdirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);

async function readdirChronoSorted(dirPath, order) {
  order = order || 1;
  const files = await readdirAsync(dirPath);
  const stats = await Promise.all(
    files.map((filename) =>
      statAsync(path.join(dirPath, filename))
        .then((stat) => ({ filename, stat }))
    )
  );
  let list = stats.sort((a, b) =>
    order * (b.stat.mtime.getTime() - a.stat.mtime.getTime())
  ).map((stat) => stat.filename);
  return list;
}

async function makeFileList(){ 
    try{
          // console.log(await readdirChronoSorted(dirpath));
          // console.log(await readdirChronoSorted(dirpath, -1));
          // const FileList = await readdirChronoSorted(dirpath,-1);
          // console.log(FileList);
          const FileList = await readdirChronoSorted(dirpath,-1);
          console.log(FileList);
          return FileList;
        } catch (err) {
    console.log(err);
  }
}

// Make Gif 
async function makeAnimeGif(num){
  //ファイルリスト取得
  const list = await makeFileList();

  // アセット読み込み
  const asset = [];
  for(let i in list){
      asset[i] = await loadImage(modify.toImage+modify.imgPath+"/"+list[i]);
  }

  // アニメGIF設定
  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  encoder.createReadStream().pipe(fs.createWriteStream(GifFile+num+'.gif'));
  encoder.start();
  encoder.setRepeat(-1);   // 0:リピートあり, -1:なし
  encoder.setDelay(50);  // フレーム間隔(ミリ秒)
  encoder.setQuality(200); // 画像品質

  // canvas準備
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // フレーム生成
  for( let i=0; i<asset.length; i++ ){
      const icon = asset[i];
      // 画像を載せる
      ctx.clearRect(0 ,0, canvas.width, canvas.height);  //リセット
      ctx.drawImage(icon, 0, 0);   //画像位置オフセット

      // 作成者名も入れておく
      ctx.fillStyle = '#FF3300';
      //ctx.fillText('@abe', canvas.width-50, canvas.height-2);
      // フレームに追加
      encoder.addFrame(ctx);
  }
  encoder.finish()
  console.log(GifFile+num+'.gif');
}

module.exports = router;