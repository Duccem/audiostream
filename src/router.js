const trackRouter = require('./components/track/route');
const listRouter = require('./components/trackList/route');

module.exports = app => {
    app.use('/track',trackRouter);
    app.use('/tracklist',listRouter);
}