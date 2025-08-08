const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },        // Tên dịch vụ: Thuê xe, Ăn sáng...
  description: { type: String, required: false }, // Mô tả (nếu cần)
  price: { type: Number, required: true },        // Giá dịch vụ
  status: {
    type: String,
    enum: ['active', 'inactive'],                // Có thể bật/tắt dịch vụ
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', serviceSchema);
