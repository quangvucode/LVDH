const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true } // giá tại thời điểm đặt
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema);
