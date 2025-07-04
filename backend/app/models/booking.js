const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // khách vãng lai không có tài khoản
  },
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true // ngày đặt 
  },
  timeSlots: {
    type: [String], // Khung giờ
    required: true
  },
  isFullDay: {
    type: Boolean,
    default: false // cả ngày
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  finalPrice: {
    type: Number,
    required: true
  },  
  isPaid: {
    type: Boolean,
    default: false
  },
  isConfirmed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
