var express = require('express');
var parseRss= require("../crawl/parseRSS");
var router = express.Router();
var async = require('async');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({hello:"vu tien thanh"});
});

module.exports = router;
