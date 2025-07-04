const Booking = require('../models/booking');
const Room = require('../models/room');
const mongoose = require('mongoose');

// Kiểm tra các khung giờ có liên tiếp không
function areConsecutiveSlots(slots) {
  const fullOrder = ["09:30-12:30", "13:00-16:00", "16:30-19:30", "20:00-08:00"];
  const indices = slots.map(s => fullOrder.indexOf(s)).filter(i => i !== -1).sort((a, b) => a - b);
  if (indices.length < 2) return false;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) return false;
  }
  return true;
}

exports.createBooking = async (req, res) => {
  const { phone, roomId, bookingDate, timeSlots, paymentMethod, name, email } = req.body;
  const userId = req.userId || null;

  try {
    if (!phone || !roomId || !bookingDate || !timeSlots || timeSlots.length === 0) {
      return res.status(400).json({ message: 'Thiếu thông tin đặt phòng' });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: 'ID phòng không hợp lệ' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    const existingBooking = await Booking.findOne({
      roomId,
      bookingDate: new Date(bookingDate),
      timeSlots: { $in: timeSlots }
    });

    if (existingBooking) {
      return res.status(409).json({ message: 'Khung giờ này đã có người đặt' });
    }

    const fullDaySlots = ["09:30-12:30", "13:00-16:00", "16:30-19:30", "20:00-08:00"];
    const isFullDay = fullDaySlots.every(slot => timeSlots.includes(slot));

    let total = 0;
    timeSlots.forEach(slot => {
      total += slot === "20:00-08:00" ? room.priceNight : room.priceDay;
    });

    let discount = 0;
    if (paymentMethod === "online") {
      discount += 10;
      if (isFullDay) {
        discount += 30;
      } else if (areConsecutiveSlots(timeSlots)) {
        discount += 10;
      }
    }

    const finalPrice = Math.round(total * (1 - discount / 100));

    const newBooking = new Booking({
      userId,
      phone,
      name,
      email,
      roomId,
      bookingDate: new Date(bookingDate),
      timeSlots,
      isFullDay,
      paymentMethod,
      finalPrice
    });

    await newBooking.save();
    
    if (paymentMethod === "offline" && sendMail && email) {
      const roomInfo = await Room.findById(roomId);
      const roomName = roomInfo ? roomInfo.roomName : "Không xác định";
      await sendBookingEmail(newBooking, roomName);
    }    

    return res.status(201).json({ message: 'Đặt phòng thành công', booking: newBooking });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getBookingHistory = async (req, res) => {
  const userId = req.userId;
  try {
    const bookings = await Booking.find({ userId }).sort({ bookingDate: -1 });
    if (!bookings.length) {
      return res.status(404).json({ message: 'Bạn chưa có đơn đặt phòng nào.' });
    }
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.lookupBooking = async (req, res) => {
  const { phone, bookingDate } = req.body;

  if (!phone || !bookingDate) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ số điện thoại và ngày' });
  }

  try {
    const start = new Date(bookingDate);
    start.setHours(0, 0, 0, 0); // bắt đầu ngày

    const end = new Date(bookingDate);
    end.setHours(23, 59, 59, 999); // kết thúc ngày

    const booking = await Booking.findOne({
      phone: phone.trim(),
      bookingDate: { $gte: start, $lte: end }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt phòng phù hợp' });
    }

    return res.status(200).json({ message: 'Tìm thấy đơn đặt phòng', booking });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


exports.requestCancelBooking = async (req, res) => {
  const bookingId = req.params.id;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt phòng' });
    }

    if (booking.cancelRequested) {
      return res.status(400).json({ message: 'Đã gửi yêu cầu hủy trước đó' });
    }

    booking.cancelRequested = true;
    await booking.save();

    return res.status(200).json({ message: 'Yêu cầu hủy đơn đã được gửi' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getBookedSlotsByRoom = async (req, res) => {
  const { roomId } = req.params;
  const { date } = req.query;

  if (!date) return res.status(400).json({ message: "Thiếu ngày cần kiểm tra" });

  try {
    const bookings = await Booking.find({
      roomId,
      bookingDate: new Date(date)
    });

    const bookedSlots = bookings.flatMap(b => b.timeSlots);

    res.json({ roomId, bookingDate: date, bookedSlots });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
