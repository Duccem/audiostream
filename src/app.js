const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
const router = require('./router');
const path = require('path');

//settings
require('./database');
const app = express();
app.set('port', process.argv[2] || process.env.PORT || 3000);
const storage = multer.diskStorage({//manejador de archivos como imagenes
    destination: path.join(__dirname,'public/uploads'),
    filename: (req,file,cb)=>{
        cb(null,new Date().getTime()+path.extname(file.originalname));
    }
});

//midlewares 
app.use(cors());
app.use(morgan('dev'));
app.use('/images',express.static(path.resolve(__dirname,'public')));
app.use('/track',multer({storage}).fields([
    {
        name:'track',
        maxCount:1
    },
    {
        name:'photo',
        maxCount:1
    }
]));
app.use('/tracklist',multer({storage}).single('photo'));
//Routes
router(app);

module.exports = app;