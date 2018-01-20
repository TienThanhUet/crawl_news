/**
 * Created by sm on 10/22/17.
 */
var CronJob = require('cron').CronJob;
var setUpConfig = require('./config/configSetup');
module.exports = function () {
    try {

        console.log("start alalyze the exist System");
        var job = new CronJob('00 * * * * *', function () {
                if (setUpConfig.crawlDataAtFirst == true) {
                    // constant.vietnamnet.forEach(rsslink=>{
                    //     parseRss.feed(rsslink.link,"DD-MM-YYYY",'#ArticleContent >p')
                    // })
                    // constant.soha.forEach(rsslink=>{
                    //     parseRss.feed(rsslink.link,null,'div.news-content >p')
                    // })
                    // constant.tienphong.forEach(rsslink=>{
                    //     parseRss.feed(rsslink.link,null,'div#article-body p')
                    // })
                    constant.vtvnews.forEach(rsslink => {
                        parseRss.feed(rsslink.link, null, 'div.ta-justify p')
                    })
                    // constant.laodong.forEach(rsslink=>{
                    //   parseRss.feed(rsslink.link,null,".article-content > p")
                    // })
                    // parseRss.feed("http://dantri.com.vn/trangchu.rss")
                } else {

                }
            }, function () {


            },
            true,
            'America/Los_Angeles'
        );
    } catch (ex) {
        console.log("cron pattern not valid");
    }
}