const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require("../middlewares/verifyToken");

// Tạo Order mới
router.post('/', verifyToken, orderController.createOrder);

// Thêm dịch vụ (OrderDetail)
router.patch('/:id/add-detail', verifyToken, orderController.addOrderDetail);

// Lấy chi tiết Order
router.get('/:id', verifyToken, orderController.getOrderDetails);

module.exports = router;
