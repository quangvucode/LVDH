const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    enum: ['standard', 'deluxe'],
    required: true
  },
  amenities: {
    type: [String],
    default: []
  },
  imageUrls: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  priceDay: {
    type: Number,
    required: true
  },
  priceNight: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Room', roomSchema);