/**
 * Created by sm on 3/11/17.
 */
var parserRSS = require('rss-parser');
var async = require('async');
var request =require('request')
var cherrio = require('cheerio');
var async = require('async');
var dateformat = require('dateformat');
var fs= require('fs');
var path = require('path')
var moment = require('moment');

var TinTucService=require('../service/tinTucSerivce')
var relativeValue = require('../config/relativeValue');

var formatDatetimeValue;
var paramContent;
module.exports={
    feed:function (url,formateDtValue,pContent) {
        formatDatetimeValue =formateDtValue;
        paramContent=pContent;
        async.waterfall([
            function (callback) {
                callback(null,url)
            },
            function (url,callback) {
                parserRSS.parseURL(url, function(err, parsed) {
                    if(err){
                        console.log(err);
                        callback(err,null);
                    }
                    else callback(null,parsed);
                })
            },
            function (parsed,callback) {
            if(parsed!=null)
                getContentAll(parsed,callback)
            else
                callback("err",null)
            }
        ],function (err,parsed) {
            // console.log(parsed)
            console.log("done parse");
            if(!err){
                var arrNews=[];
                parsed.forEach(function(entry) {
                    /**
                     * entry include title, link, description, content, date
                     */
                    if(!entry.content)
                        entry.content=""
                    if(!entry.contentSnippet)
                        entry.contentSnippet=""
                    var item ={
                        url:entry.link,
                        title:entry.title,
                        description:entry.contentSnippet.replace(/[&\/\\#,+()$~%.'":*?<>{}"']/g, ' '),
                        time:formatDatetime(entry.pubDate),
                        content:entry.content.replace(/[&\/\\#,+()$~%.'":*?<>{}"']/g, ' ')
                    }
                    arrNews.push(item)
                })
                // InsertDatabase(arrNews);
                var split =url.split("/");
                // checkDirectorySync()
                arrNews.forEach(news=>{
                    let filename;
                    try{
                        filename = path.join(__dirname, 'logs', split[2]+'_'+ dateformat(news.time,"yyyy_mm_dd")+'_'+relativeValue()+".json");
                    }catch(err){
                        filename = path.join(__dirname, 'logs', split[2]+'_'+relativeValue()+".json");
                    }
                    if(typeof news !== "string") news = JSON.stringify(news);
                    fs.writeFile(filename, news,'utf8',(err)={

                    });
                })
                console.log("import done")
                // callback(null,arrNews)
            } else console.log("parse rss false")
        });
    }
}

function getContentAll(parsed,callback) {
    var arrFun=[];
    parsed.feed.entries.forEach(entry=>{
        var fun=function (callback) {
            parseGetContentItem(entry,function (err,entryContent) {
                if(err)
                    callback(err,null)
                else
                    callback(null,entryContent)
            })
        }
        arrFun.push(fun)
    })

    async.parallel(arrFun,function (err,result) {
        callback(null,result)
    })
}

function parseGetContentItem(entry,callback) {
    async.waterfall([
            function (callback) {
                makeRequest(entry.link,callback)
            },
            function (body,callback) {
                var $ = cherrio.load(body,{
                    normalizeWhitespace: true,
                    xmlMode: true
                });
                var content ="";
                try{
                    content= $(paramContent).text();
                }catch (err){}
                callback(null,content);
            }
        ],function (err,content) {
            if (err){
                console.log(err);
            }
            entry.content=content;
            callback(null,entry);
        }
    )
}

function formatDatetime(value) {
    try{
        if(formatDatetimeValue)
            return dateformat(moment(value,formatDatetimeValue),"yyyy-mm-dd HH:MM:ss");
        else
            return dateformat(moment(value),"yyyy-mm-dd HH:MM:ss");
    }catch(err){
        return value
    }
}

function InsertDatabase(result) {
    var stack = []
    stack.push(function (callback) {
        callback(null, result)
    })
    //make stack request to server
    for (let i = 0; i < result.length; i++) {
        var prototype = function (data, callback) {
            //luu tru vao csdl
            TinTucService.create(data[i], function (err, result) {
                if (err) {
                    console.log("News exist")
                }
                else {
                    console.log("import News success")
                }
                callback(null,data);
            })
        }
        stack.push(prototype)
    }
    async.waterfall(stack, function (err, result) {
        if (err) {
            console.log(err);
        }
        console.log("import done!");
    })
}

function makeRequest(url,callback) {
    // console.log(url)
    request({
        uri: url,
        method: "GET",
    }, function (err, response, body) {
        if (err) {
            callback(err, null)
            return ;
        }
        else callback(null, body)
    })
}

function checkDirectorySync(directory) {
    try {
        fs.statSync(directory);
    } catch(e) {
        fs.mkdirSync(directory);
    }
}



