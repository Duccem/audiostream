const cloudinary = require("cloudinary");
const { cloudinar } = require('./keys');

cloudinary.config({
    cloud_name: cloudinar.CLOUD_NAME,
    api_key: cloudinar.API_KEY,
    api_secret: cloudinar.API_SECRET
});


module.exports = { cloudinary };