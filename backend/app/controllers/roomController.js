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



  exports.createRoom = async (req, res) => {
    try {
      const {
        roomName,
        description,
        roomType,
        amenities,
        status,
        priceOnline,
        priceAtReception,
        base64SliderImage,
        sliderImageName,
        base64ThumbImage,
        thumbImageName
      } = req.body;
  
      if (!base64SliderImage || !sliderImageName) {
        return res.status(400).json({ message: "Thiếu ảnh slider" });
      }
  
      // Ghi ảnh slider
      const sliderBuffer = Buffer.from(base64SliderImage, "base64");
      const sliderPath = path.join(__dirname, "..", "uploads", sliderImageName);
      fs.writeFileSync(sliderPath, sliderBuffer);
  
      // Nếu có ảnh thumbnail riêng thì lưu, nếu không thì dùng lại ảnh slider
      let thumbUrl = `/uploads/${sliderImageName}`;
      if (base64ThumbImage && thumbImageName) {
        const thumbBuffer = Buffer.from(base64ThumbImage, "base64");
        const thumbPath = path.join(__dirname, "..", "uploads", thumbImageName);
        fs.writeFileSync(thumbPath, thumbBuffer);
        thumbUrl = `/uploads/${thumbImageName}`;
      }
  
      const newRoom = new Room({
        roomName,
        description,
        roomType,
        amenities,
        status,
        priceOnline,
        priceAtReception,
        imageUrls: [`/uploads/${sliderImageName}`, thumbUrl]
      });
  
      await newRoom.save();
      res.status(201).json({ message: "Tạo phòng thành công", room: newRoom });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  };
