var config = require('../config/configSetup');
var News= require('../models/news');
/**
 * Created by sm on 11/15/17.
 */

module.exports = {
    findOne : function (id,callback) {
        News.find({_id : id},function (err,news) {
            if (err){
                callback(err,null)
                return;
            }
            callback(null,news)
        })
    },

    //default limit = 10
    findAndLimit : function (param,offset,callback) {
        News
            .find(param)
            .sort({"postAt": -1})
            .limit(10)
            .skip(offset)
            .exec(callback);
    },

    find : function (param,callback) {
        News.find(param).exec(callback)
    },

    findDetailArticle : function (param,callback) {
        News
            .find(param)
            .limit(10)
            .sort({"postAt": -1})
            .populate('loaiNews')
            .exec(callback)
    },

    create: function (params, callback) {
        News.create(params,function (err, news) {
            if (err){
                callback(err,null);
                return;
            }
            callback(null,news);
        })
    },
}


