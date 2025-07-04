const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middlewares/verifyToken');
const optionalAuth = require('../middlewares/optionalAuth');


router.post('/create', optionalAuth, bookingController.createBooking);
router.get('/history', verifyToken, bookingController.getBookingHistory);
router.post('/lookup', bookingController.lookupBooking);
router.patch('/cancel-request/:id', bookingController.requestCancelBooking);
router.get('/by-room/:roomId', bookingController.getBookedSlotsByRoom);


module.exports = router;
