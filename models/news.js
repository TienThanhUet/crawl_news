var mongoose= require('mongoose');

/**
 * Created by sm on 12/4/17.
 */

var NewsSchema= mongoose.Schema({
    link:{
        type: String,
        unique: true,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    content:{
        type : String
    },
    imageLink:{
        type : String
    },
    postAt :{
        type : Date,
        require :true,
        default :Date.now()
    }
})

module.exports = mongoose.model('News',NewsSchema);
