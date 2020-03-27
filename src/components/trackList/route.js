const { Router } = require('express');
const router = Router();

const {  getLists, getList, saveList } = require('./controller');

router.get('/',getLists);
router.get('/:id',getList)
router.post('/', saveList);


module.exports = router;