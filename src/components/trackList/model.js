const {Schema,model} = require('mongoose');

const trackListSchema = new Schema({
    name:{type:String},
    photo:{type:String},
    list:[{type:String}]
});

module.exports = model('TrackList',trackListSchema);