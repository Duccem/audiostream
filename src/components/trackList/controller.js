const fs = require('fs-extra');

//Custom imports
const TrackList = require('./model');
const { cloudinary } = require('../../claudinary');


async function getLists(req,res){
    try {
        let lists = await TrackList.find();
        if(lists) return res.status(200).json({lists});
        return res.status(200).json({});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal server error'});
    }
}

async function getList(req,res){
    try {
        const { id } = req.params;
        const list = await TrackList.findById(id);
        if(list) return res.status(200).json({lists});
        return res.status(404).json({message:'Element not found'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal server error'});
    }
}

async function saveList(req,res){
    try {
        let name = req.body.name;
        let list = JSON.parse(req.body.list || '[]');
        let newList = new TrackList({name,list});
        const { url } = await cloudinary.v2.uploader.upload(req.file.path, {folder:'audiostream/list'});
        await fs.unlink(req.file.path);
        newList.photo = url;
        await newList.save();
        return res.status(201).json({message:'List created'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal server error'});
    }
}

module.exports = { getLists, getList, saveList }