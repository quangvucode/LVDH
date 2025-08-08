const Booking = require("../models/booking");
const Room = require("../models/room");
const Order = require('../models/order');
const OrderDetail = require('../models/orderDetail');

exports.getBookingByCode = async (req, res) => {
    try {
      const booking = await Booking.findOne({ bookingCode: req.params.code })
        .populate("roomId", "roomName")
        .lean();
  
      if (!booking) {
        return res.status(404).json({ message: "Không tìm thấy mã đơn" });
      }
  
      res.status(200).json({
        booking: {
          ...booking,
          roomName: booking.roomId?.roomName || "Không xác định",
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  };

exports.getAllBookings = async (req, res) => {
    try {
      const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
  
      // Lấy danh sách phòng để ánh xạ tên phòng
      const rooms = await Room.find({}, "_id roomName").lean();
      const roomMap = {};
      rooms.forEach(room => {
        roomMap[room._id.toString()] = room.roomName;
      });
  
      // Thêm roomName vào mỗi booking
      const result = bookings.map(b => ({
        ...b,
        roomName: roomMap[b.roomId?.toString()] || "Không xác định"
      }));
  
      res.status(200).json({ bookings: result });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  };
  
  exports.confirmCancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { action } = req.body;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: "Hành động không hợp lệ. Chỉ chấp nhận 'accept' hoặc 'reject'" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đơn đặt phòng" });
    }

    if (booking.cancelStatus !== "pending") {
      return res.status(400).json({ message: "Đơn này không có yêu cầu hủy hoặc đã được xử lý" });
    }

    // Cập nhật trạng thái hủy
    booking.cancelStatus = action === "accept" ? "accepted" : "rejected";
    await booking.save();

    res.status(200).json({
      message: `Yêu cầu hủy đã được ${action === "accept" ? "chấp nhận" : "từ chối"}`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

  
  exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!["confirmed", "completed"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đơn đặt phòng" });
    }

    booking.status = status;
    
    if (status === "completed" && booking.paymentMethod === "offline") {
      booking.isPaid = true;
    }
    await booking.save();

    res.status(200).json({ message: `Cập nhật trạng thái thành công: ${status}` });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getBookingDetails = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate("roomId", "roomName")
      .populate("userId", "fullName email phone"); // thêm populate user

    if (!booking) {
      return res.status(404).json({ message: "Booking không tồn tại" });
    }

    // lấy orders và details như cũ
    const orders = await Order.find({ bookingId }).lean();
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const details = await OrderDetail.find({ orderId: order._id })
          .populate("serviceId");
        return { ...order, details };
      })
    );

    res.status(200).json({
      booking,
      orders: ordersWithDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết booking",
      error: error.message,
    });
  }
};

