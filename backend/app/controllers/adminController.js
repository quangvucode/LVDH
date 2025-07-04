const Booking = require("../models/booking");
const Room = require("../models/room");

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1. Số đơn hôm nay
    const todayBookings = await Booking.countDocuments({
      bookingDate: { $gte: today, $lt: tomorrow },
    });

    // 2. Doanh thu hôm nay
    const todayRevenueResult = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: today, $lt: tomorrow },
          isPaid: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalPrice" },
        },
      },
    ]);
    const revenue = todayRevenueResult[0]?.total || 0;

    // 3. Phòng còn trống = tổng phòng - phòng đã đặt hôm nay
    const totalRooms = await Room.countDocuments();
    const bookedRoomIds = await Booking.distinct("roomId", {
      bookingDate: { $gte: today, $lt: tomorrow },
    });
    const emptyRooms = totalRooms - bookedRoomIds.length;

    res.json({
      todayBookings,
      revenue,
      emptyRooms: emptyRooms < 0 ? 0 : emptyRooms,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
