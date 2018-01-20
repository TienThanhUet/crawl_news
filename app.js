var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// var MongoClient= require('mongodb').MongoClient,
//     test= require('assert');

//----router-------------
var index = require('./routes/index');
var users = require('./routes/users');

//---comppents---------------
var constant = require('./config/constant');
var configSetup= require('./config/configSetup');
var parseRss= require("./crawl/parseRSS");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//connect database
mongoose.connect(configSetup.databaseURL, { useMongoClient: true });

//config router
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// constant.vietnamnet.forEach(rsslink=>{
//     parseRss.feed(rsslink.link,"DD-MM-YYYY",'#ArticleContent >p')
// })
// constant.soha.forEach(rsslink=>{
//     parseRss.feed(rsslink.link,null,'div.news-content >p')
// })
// constant.tienphong.forEach(rsslink=>{
//     parseRss.feed(rsslink.link,null,'div#article-body p')
// })
// constant.vtvnews.forEach(rsslink=>{
//     parseRss.feed(rsslink.link,null,'div.ta-justify p')
// })
constant.laodong.forEach(rsslink=>{
  parseRss.feed(rsslink.link,null,".article-content > p")
})
// parseRss.feed("http://dantri.com.vn/trangchu.rss")












// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
