const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create', paymentController.createPaymentUrl);
router.get('/vnpay-return', paymentController.handleVnpReturn);
router.post("/send-success-email", paymentController.sendSuccessEmail);

module.exports = router;
