const Room = require("../models/room");
const fs = require("fs");
const path = require("path");

exports.createRoom = async (req, res) => {
  try {
    const {
      roomName,
      description,
      roomType,
      amenities,
      status,
      priceDay,
      priceNight
    } = req.body;

    if (!req.files || !req.files.sliderImage) {
      return res.status(400).json({ message: "Thiếu ảnh slider" });
    }

    const sliderImage = req.files.sliderImage;
    const sliderImageName = Date.now() + "_" + sliderImage.name;
    const sliderPath = path.join(__dirname, "..", "uploads", sliderImageName);
    await sliderImage.mv(sliderPath);

    let thumbUrls = [];
    if (req.files.thumbImages) {
      const thumbs = Array.isArray(req.files.thumbImages)
        ? req.files.thumbImages
        : [req.files.thumbImages];
      for (const img of thumbs) {
        const thumbName = Date.now() + "_" + img.name;
        const thumbPath = path.join(__dirname, "..", "uploads", thumbName);
        await img.mv(thumbPath);
        thumbUrls.push(`/uploads/${thumbName}`);
      }
    }

    const amenitiesList = Array.isArray(amenities)
      ? amenities
      : amenities?.split(",").map((a) => a.trim()).filter(Boolean);

    const newRoom = new Room({
      roomName,
      description,
      roomType,
      amenities: amenitiesList,
      status,
      priceDay,
      priceNight,
      imageUrls: [
        `/uploads/${sliderImageName}`,
        ...thumbUrls
      ]
    });

    await newRoom.save();
    res.status(201).json({ message: "Tạo phòng thành công", room: newRoom });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


exports.updateRoom = async (req, res) => {
  try {
    console.log(" UPDATE ROOM ");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    const roomId = req.params.id;
    const {
      roomName,
      description,
      roomType,
      amenities,
      status,
      priceDay,
      priceNight,
      oldThumbs // frontend
    } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });

    // Cập nhật các trường cơ bản
    room.roomName = roomName;
    room.description = description;
    room.roomType = roomType;
    room.status = status;
    room.priceDay = priceDay;
    room.priceNight = priceNight;
    room.amenities = Array.isArray(amenities)
      ? amenities
      : amenities?.split(",").map((a) => a.trim()).filter(Boolean);

    // Cập nhật ảnh slider nếu có ảnh mới
    if (req.files?.sliderImage) {
      const sliderImage = req.files.sliderImage;
      const sliderImageName = Date.now() + "_" + sliderImage.name;
      const sliderPath = path.join(__dirname, "..", "uploads", sliderImageName);
      await sliderImage.mv(sliderPath);
      room.imageUrls[0] = `/uploads/${sliderImageName}`;
    }

    // Xử lý ảnh thumb: giữ lại ảnh cũ -- thêm ảnh mới
    let finalThumbs = [];

    // Nhận danh sách ảnh thumb cũ từ frontend (đã giữ lại)
    if (oldThumbs) {
      if (Array.isArray(oldThumbs)) {
        finalThumbs = oldThumbs;
      } else {
        finalThumbs = oldThumbs.split(",").map((url) => url.trim()).filter(Boolean);
      }
    }

    // Thêm thumb mới (nếu có)
    if (req.files?.thumbImages) {
      const thumbs = Array.isArray(req.files.thumbImages)
        ? req.files.thumbImages
        : [req.files.thumbImages];

      for (const img of thumbs) {
        const thumbName = Date.now() + "_" + img.name;
        const thumbPath = path.join(__dirname, "..", "uploads", thumbName);
        await img.mv(thumbPath);
        finalThumbs.push(`/uploads/${thumbName}`);
      }
    }

    // Gộp ảnh slider + ảnh thumb
    if (!room.imageUrls[0]) {
      room.imageUrls = finalThumbs; 
    } else {
      room.imageUrls = [room.imageUrls[0], ...finalThumbs];
    }

    await room.save();
    res.status(200).json({ message: 'Cập nhật phòng thành công', room });
  } catch (error) {
    console.error("UPDATE ROOM ERROR:", error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
    res.status(200).json({ message: 'Xóa phòng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getAllRoomsAdmin = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.status(200).json({ rooms });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
