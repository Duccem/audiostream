const mongoose = require('mongoose');
const {database} = require('./keys');

mongoose.connect(database.URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(db => console.log(`[DATABASE] Connected to the ${db.connection.name} database`))
    .catch(err => console.error('[DB] error:',err));

const getConnection = ()=> mongoose.connection.db;

module.exports = { getConnection }