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

var articleService=require('../service/articleSerivce')
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
            if(!err){
                var arrNews=[];
                parsed.forEach(function(entry) {
                    /**
                     * entry include title, link, description, content, date
                     */
                    if(!entry.contentClean)
                        entry.contentClean=""
                    if(!entry.contentSnippet)
                        entry.contentSnippet=""
                    let contentSnippet = entry.contentSnippet.replace(/[&\/\\#,+()$~%.'":*?<>{}"']/g, ' ');
                    let contentClean = entry.contentClean.replace(/[&\/\\#,+()$~%.'":*?<>{}"']/g, ' ');
                    let imageLink= findImageLink(entry.content)
                    var postAt=formatDatetime(entry.pubDate)
                    if(postAt!=null){
                        var item ={
                            link:entry.link,
                            title:entry.title,
                            description: contentSnippet,
                            postAt:postAt,
                            imageLink: imageLink,
                            content: contentClean
                        }
                        arrNews.push(item)
                    }
                })
                InsertDatabase(arrNews);
                // var split =url.split("/");
                // logfile(arrNews,split);
            } else console.log("parse rss false")
        });
    }
}

function logfile(arrNews,split) {
    arrNews.forEach(news=>{
        let filename;
        try{
            filename = path.join(__dirname, 'logs',split[2]+'_'+ dateformat(news.time,"yyyy_mm_dd"), split[2]+'_'+ dateformat(news.time,"yyyy_mm_dd")+'_'+relativeValue()+".json");
        }catch(err){
            filename = path.join(__dirname, 'logs',split[2]+'_'+ dateformat(news.time,"yyyy_mm_dd"), split[2]+'_'+relativeValue()+".json");
        }
        checkDirectorySync(path.join(__dirname, 'logs', split[2]+'_'+ dateformat(news.time,"yyyy_mm_dd")))
        if(typeof news !== "string") news = JSON.stringify(news);
        fs.writeFile(filename, news,'utf8',(err)=>{

        });
    })
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
    // console.log(entry)
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
            entry.contentClean=content;
            callback(null,entry);
        }
    )
}

function removeSpecialCharacter(value) {
    value= value.replace('(GMT+7)',' ')
    return value
}

function formatDatetime(value) {
    value= removeSpecialCharacter(value)
    try{
        if(formatDatetimeValue)
            return moment(value,formatDatetimeValue);
            // return dateformat(moment(value,formatDatetimeValue),"yyyy-mm-dd HH:MM:ss")
        else
            return moment(value)
            // return dateformat(moment(value),"yyyy-mm-dd HH:MM:ss");
    }catch(err){
        console.log('err:' + value)
        return null
    }
}

function InsertDatabase(arrNews) {
    arrNews.forEach(news=>{
        articleService.create(news, function (err, result) {
            if (err) {
                // console.log("News exist : "+news.title)
            }
            else {
                // console.log("import News success")
            }
        })
    })
}

function findImageLink(content) {
    var position = content.indexOf("img");
    var imageLink=null;
    if(position!=-1){
        var split=content.split('"');
        for(p =0;p<split.length;p++){
            if (split[p].indexOf("png") != -1) {
                return split[p];
            }
            else if (split[p].indexOf("jpg") != -1) {
                return split[p];
            }
        }
    }
    else
        return imageLink;
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
    // try {
    //     fs.statSync(directory);
    // } catch(e) {
    //
    // }
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
}



