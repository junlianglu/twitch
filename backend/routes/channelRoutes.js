const express = require('express');
const router = express.Router();
const channelController = require('../controller/channelController');

router.get('/', channelController.getAll);
router.get('/:id', channelController.getOne);
router.post('/', channelController.create);
router.put('/:id', channelController.update);
router.delete('/:id', channelController.remove);

module.exports = router;
