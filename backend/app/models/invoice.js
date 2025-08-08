const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customerName: String,
  totalAmount: { type: Number, required: true }, // tổng tiền cần thanh toán
  discount: { type: Number, default: 0 }, // nếu có giảm giá
  paidAmount: { type: Number, default: 0 },         // <--- THÊM TRƯỜNG NÀY
  remainingAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  note: { type: String }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
