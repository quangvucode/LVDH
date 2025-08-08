const Booking = require("../models/booking");
const Room = require("../models/room");
const User = require("../models/user");


exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Đơn đặt hôm nay 
    const todayBookings = await Booking.countDocuments({
      bookingDate: { $gte: today, $lt: tomorrow },
    });

    // Slot hôm nay
    const slotToday = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $project: {
          slotCount: { $size: "$timeSlots" }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$slotCount" }
        }
      }
    ]);
    const totalSlotsToday = slotToday[0]?.total || 0;

    // Doanh thu hôm nay - Đã thanh toán 
    const paidTodayResult = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: today, $lt: tomorrow },
          isPaid: true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalPrice" }
        }
      }
    ]);
    const paidToday = paidTodayResult[0]?.total || 0;

    // Doanh thu hôm nay - Chưa thanh toán 
    const unpaidTodayResult = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: today, $lt: tomorrow },
          isPaid: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalPrice" }
        }
      }
    ]);
    const unpaidToday = unpaidTodayResult[0]?.total || 0;

    const revenueToday = paidToday + unpaidToday;

    // Doanh thu tháng này 
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueMonthResult = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startOfMonth },
          isPaid: true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalPrice" }
        }
      }
    ]);
    const revenueMonth = revenueMonthResult[0]?.total || 0;

    // Lọc khoảng ngày 
    const { from, to } = req.query;
    let fromDate, toDate;

    if (from && to) {
      fromDate = new Date(from);
      toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1); // Bao gồm cả ngày to
    } else {
      // Mặc định 7 ngày gần nhất
      toDate = new Date();
      toDate.setHours(0, 0, 0, 0);
      fromDate = new Date(toDate);
      fromDate.setDate(fromDate.getDate() - 6);
    }

    const revenuePerDay = [];
    const loopStart = new Date(fromDate);
    const loopEnd = new Date(toDate);

    while (loopStart < loopEnd) {
      const dayStart = new Date(loopStart);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const result = await Booking.aggregate([
        {
          $match: {
            bookingDate: { $gte: dayStart, $lt: dayEnd },
            isPaid: true,
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$finalPrice" }
          }
        }
      ]);

      const total = result[0]?.total || 0;

      const formattedDate = `${dayStart.getDate().toString().padStart(2, "0")}/${(dayStart.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      revenuePerDay.push({ date: formattedDate, total });

      loopStart.setDate(loopStart.getDate() + 1);
    }

    res.json({
      todayBookings,
      totalSlotsToday,
      revenueToday,
      paidToday,
      unpaidToday,
      revenueMonth,
      revenuePerDay,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find() // chỉ lấy user bình thường
      .select("-password -verifyToken -verifyTokenExpires")
      .sort({ createdAt: -1 }); // mới nhất lên trước

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy danh sách người dùng", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) return res.status(400).json({ message: "Thiếu ID người dùng" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // Không cho xoá admin khác (tuỳ yêu cầu)
    if (user.role === "admin") {
      return res.status(403).json({ message: "Không thể xoá tài khoản admin" });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Xoá người dùng thành công" });
  } catch (error) {
    console.error("Lỗi xoá user:", error);
    res.status(500).json({ message: "Lỗi server khi xoá người dùng" });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive, role },
      { new: true, runValidators: true }
    ).select("-password -verifyToken -verifyTokenExpires");

    if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.status(200).json({ message: "Cập nhật thành công", user: updatedUser });
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật người dùng" });
  }
};

exports.updateUserName = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Thiếu tên người dùng" });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    ).select("-password -verifyToken -verifyTokenExpires");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ message: "Cập nhật tên thành công", user: updatedUser });
  } catch (error) {
    console.error("Lỗi cập nhật tên người dùng:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật tên" });
  }
};

