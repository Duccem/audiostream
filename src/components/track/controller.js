//Modules
const mongoose = require("mongoose");
const Grid = require('gridfs-stream');
const fs = require('fs-extra');
const mm = require('music-metadata');

//Custom imports
const TrackInformation = require('./model');
const { getConnection } = require('../../database');
const { cloudinary } = require('../../claudinary');




//Get the date of one track
async function getTrack(req,res){
    const { id } = req.params;
    try {
        const track = await TrackInformation.findById(id);
        if(!track) return res.status(404).json({message:'Track not found'})
        return res.status(200).json({track});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal Server Error'});
    }
}

async function getAllTracks(req,res){
    try {
        let tracks;
        const { name } = req.query;
        if(!name){
            tracks = await TrackInformation.find();
        }else{
            tracks = await TrackInformation.find({title:name});
        }
        return res.status(200).json({tracks});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal Server Error'});
    }
}

//Create a stram of one track to play it
function playTrack(req, res) {
    const { id } = req.params;
    try {

        //set the headers to the browser
        res.set('content-type','audio/mp3');
        res.set('accept-ranges','bytes');

        //get the connection and the GridFS system
        const db = getConnection();
        const gfs = Grid(db, mongoose.mongo);

        //check if the track esxist
        gfs.exist({root:'tracks', _id:id },function(err,file){
            if (err || !file) return res.status(404).json({message:'Track not found'})
            
            //if exist then create the stream of the track
            var readstream = gfs.createReadStream({root:'tracks', _id:id });
            readstream.pipe(res);
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal Server Error'});
    
    }
}

//Save the data of a track and the files attached 
async function saveTrack(req, res) {
    const newTrack = new TrackInformation(req.body);
    
    const { path, filename } = req.files['track'][0];

    try {
        if(req.files['photo'][0]){
            const { url } = await cloudinary.v2.uploader.upload(req.files['photo'][0].path, {folder:'audiostream/tracks'});
            await fs.unlink(req.files['photo'][0].path);
            newTrack.photo = url;
        }else{
            newTrack.photo = 'http://localhost:3000/images/default-song-image.jpg'
        }
        const metadata = await mm.parseFile(path);
        newTrack.duration = metadata.format.duration;
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:'Internal Server Error'});
    }
    
    const db = getConnection();
    const gfs = Grid(db, mongoose.mongo);
    
    const writestream = gfs.createWriteStream({ filename: filename, root:'tracks' });
    fs.createReadStream(path).pipe(writestream);
    writestream.on('close', async function (file) {
        newTrack.song = file._id;
        await fs.unlink(path)
        await newTrack.save();
        res.status(201).json({newTrack});
    });
    
    writestream.on('error',(err)=>{
        console.log(err)
        res.status(500).json({message:'Internal Server Error'});
    })
}

module.exports = {getTrack,getAllTracks, playTrack, saveTrack };