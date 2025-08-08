const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const verifyToken = require("../middlewares/verifyToken");

// Lấy danh sách dịch vụ (khách hàng & admin)
router.get('/', serviceController.getServices);

// Admin quản lý dịch vụ
router.post('/', verifyToken, serviceController.createService);
router.patch('/:id', verifyToken, serviceController.updateService);
router.delete('/:id', verifyToken, serviceController.deleteService);

module.exports = router;
