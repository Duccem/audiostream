const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    database:  {
        URI: process.env.URI,
    },
    cloudinar:{
        CLOUD_NAME:process.env.CLOUDINARY_CLOUD_NAME,
        API_KEY:process.env.CLOUDINARY_API_KEY,
        API_SECRET:process.env.CLOUDINARY_API_SECRET
    }
}