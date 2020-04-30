//Modules
const mongoose = require("mongoose");
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
        console.log('hola')
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

        let trackID;
        try {
            trackID = new mongoose.mongo.ObjectID(id);
        } catch (error) {
            return res.status(400).json({ message: "Invalid track in URL parameter." });
        }
        //get the connection and the GridFS system
        const db = getConnection();
        let bucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: 'tracks'
        });

        let downloadStream = bucket.openDownloadStream(trackID);

        downloadStream.on('data', chunk => {
            res.write(chunk);
        });

        downloadStream.on('error', () => {
            res.sendStatus(404);
        });

        downloadStream.on('end', () => {
            res.end();
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
    const bucket = new mongoose.mongo.GridFSBucket(db,{
        bucketName:'tracks'
    });

    let uploadStream = bucket.openUploadStream(filename);
    let id = uploadStream.id;
    fs.createReadStream(path).pipe(uploadStream);

    uploadStream.on('error', (err) => {
        console.log(err)
        res.status(500).json({message:'Internal Server Error'});
    });

    uploadStream.on('finish', async () => {
        newTrack.song = id;
        await fs.unlink(path)
        await newTrack.save();
        res.status(201).json({newTrack});
    });
}

module.exports = {getTrack,getAllTracks, playTrack, saveTrack };