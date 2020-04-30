const { Router } = require('express');
const router = Router();

const {getTrack, getAllTracks ,playTrack, saveTrack } = require('./controller');

router.get('/',getAllTracks);
router.get('/play/:id', playTrack);
router.get('/:id',getTrack)
router.post('/', saveTrack);

module.exports = router;