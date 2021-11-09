'use strict'
const express = require('express');
const fs = require('fs');
const generator = require('./../public/javascripts/gif');
const modify = require('./../public/javascripts/modify');
var router = express.Router();

let count = 1;
const WIDTH   = 1280;             // 画像サイズ X
const HEIGHT  = 720;             // 画像サイズ Y
const GifFile = './public/images/gifs/actionScreen';   // 出力ファイル名

cleanDir(modify.toImage+"gifs");

/* GET home page. */
router.get('/', function(req, res, next) {
  var data = {
    title: 'Embryo'
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

module.exports = router;