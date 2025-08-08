const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/', roomController.getAllRooms);
router.get('/filter', roomController.filterRooms);
router.get('/:id', roomController.getRoomById);

module.exports = router;
