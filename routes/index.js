var express = require('express');
var parseRss= require("../crawl/parseRSS");
var router = express.Router();
var async = require('async');

/* GET home page. */
router.get('/', function(req, res, next) {
  async.waterfall([
      function (callback) {
          callback(null,null)
      },
      function (fake,callback) {
          parseRss.feed("http://vietnamnet.vn/rss/home.rss",callback)
      }
      ],function (err,result) {
        res.send(result);
      }
  )
});

module.exports = router;
