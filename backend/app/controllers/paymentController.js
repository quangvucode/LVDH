const { VNPay, ignoreLogger, VnpLocale, ProductCode } = require('vnpay');
const Booking = require('../models/booking');
const sendBookingEmail = require("../utils/sendBookingEmail");
const Room = require('../models/room');

const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMNCODE,
  secureSecret: process.env.VNP_HASH_SECRET,
  vnpayHost: process.env.VNP_URL,
  queryDrAndRefundHost: process.env.VNP_URL,
  testMode: true,
  hashAlgorithm: 'SHA512',
  enableLog: false,
  loggerFn: ignoreLogger,
});

exports.createPaymentUrl = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ message: "Thiếu bookingId hoặc số tiền" });
    }

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_TxnRef: bookingId,
      vnp_Amount: amount , // VNPay yêu cầu nhân 100
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_OrderInfo: `Thanh toán đơn đặt phòng ${bookingId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
    });

    return res.json({ paymentUrl });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.handleVnpReturn = async (req, res) => {
  const query = req.query;
  const result = vnpay.verifyReturnUrl(query);

  if (!result.isVerified) {
    return res.status(400).json({ message: "Chữ ký không hợp lệ hoặc bị giả mạo." });
  }

  const transactionStatus = result.vnp_ResponseCode;
  const bookingId = result.vnp_TxnRef;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đơn đặt phòng." });
    }

    if (transactionStatus === "00") {
      booking.isPaid = true;
      await booking.save();
      
      // Truy xuất tên phòng
      const room = await Room.findById(booking.roomId);
      const roomName = room ? room.roomName : "Không xác định";
      
      if (booking.email) {
        await sendBookingEmail(booking, roomName);
      }

      return res.status(200).json({
        message: "Thanh toán thành công!",
        booking: {
          _id: booking._id,
          bookingDate: booking.bookingDate,
          timeSlots: booking.timeSlots,
          phone: booking.phone,
          name: booking.name,
          email: booking.email,
          finalPrice: booking.finalPrice,
          paymentMethod: booking.paymentMethod,
        },
      });
    } else {
      await Booking.findByIdAndDelete(bookingId);
      return res.status(200).json({
        message: `Thanh toán thất bại. Mã lỗi: ${transactionStatus}`,
        deleted: true,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý callback: ${error.message}` });
  }
};


exports.sendSuccessEmail = async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) return res.status(400).json({ message: "Thiếu bookingId" });

  try {
    const booking = await Booking.findById(bookingId).populate("roomId");
    if (!booking) return res.status(404).json({ message: "Không tìm thấy booking" });

    const email = booking.email || booking.userId?.email;
    if (!email) return res.status(400).json({ message: "Không có email để gửi" });

    await sendSuccessEmail(email, booking);
    res.status(200).json({ message: "Đã gửi email xác nhận thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
  