const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const verifyToken = require("../middlewares/verifyToken");


router.get('/', verifyToken, invoiceController.getAllInvoices);
router.get('/:id', verifyToken, invoiceController.getInvoiceDetails);
router.post('/', verifyToken, invoiceController.createInvoice);
router.delete('/:id', verifyToken, invoiceController.deleteInvoice);


module.exports = router;
