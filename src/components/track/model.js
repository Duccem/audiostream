const {Schema,model} = require('mongoose');
const {ObjectId} = Schema;

const trackSchema = new Schema({
    title:{type:String, default:'Unknow'},
    artist:{type:String, default:'Unknow'},
    album:{type:String, default:'Unknow'},
    photo:{type:String},
    song:{type:ObjectId, ref:'tracks'},
    duration:{type:Number}
});

module.exports = model('TrackInformation', trackSchema);