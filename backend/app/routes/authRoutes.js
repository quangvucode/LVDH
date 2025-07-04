const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
