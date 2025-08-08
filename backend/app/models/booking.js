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
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed'],
    default: 'pending'
  },  
  createdAt: {
    type: Date,
    default: Date.now
  },

  bookingCode: {
    type: String,
    unique: true,
    required: true,
  },

  sendMail: { 
    type: Boolean,
    default: false,
  },

  cancelStatus: {
  type: String,
  enum: ['pending', 'accepted', 'rejected'],
  default: undefined,
  },

  
});

module.exports = mongoose.model('Booking', bookingSchema);
