const Room = require('../models/room');
const fs = require("fs");
const path = require("path");

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.filterRooms = async (req, res) => {
  try {
    const { name, amenities } = req.query;
    const query = {};
    // Tìm phòng
    if (name) {
      query.roomName = { $regex: name, $options: "i" };
    }
    // Lọc tiện ích
    if (amenities) {
      const amenityArray = amenities.split(",").map((item) => item.trim());
      if (amenityArray.length > 0) {
        query.amenities = { $all: amenityArray };
      }
    }
    const rooms = await Room.find(query);
    res.status(200).json({ rooms });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

  