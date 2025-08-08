const Invoice = require('../models/invoice');
const Order = require('../models/order');
const OrderDetail = require('../models/orderDetail');
const Booking = require('../models/booking');

// 
exports.getAllInvoices = async (req, res) => {
  try {
    const items = await Invoice.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'orderId',
        select: '_id bookingId totalPrice',
        populate: {
          path: 'bookingId',
          select: 'bookingCode finalPrice name userId',
          populate: { path: 'userId', select: 'fullName' }
        }
      });
    // Trả đúng mảng để FE cũ dùng được
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


// 
exports.createInvoice = async (req, res) => {
  try {
    const { orderId, discount, note, customerName } = req.body;

    // Lấy Order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order không tồn tại' });

    // Lấy chi tiết dịch vụ (OrderDetail)
    const details = await OrderDetail.find({ orderId });
    const servicesTotal = details.reduce(
      (s, d) => s + (Number(d.price) || 0) * (Number(d.quantity) || 0),
      0
    );

    // Tính tiền phòng nếu có Booking
    let roomTotal = 0;
    let paidAmount = 0;
    if (order.bookingId) {
      const bk = await Booking.findById(order.bookingId);

      // Nếu Booking đã thanh toán online (isPaid = true)
      if (bk?.isPaid) {
        paidAmount = Number(bk.finalPrice) || 0; // số tiền đã thanh toán
        // Không cộng lại tiền phòng đã thanh toán
        roomTotal = 0;
      } else {
        roomTotal = Number(bk?.finalPrice) || 0;
      }
    }

    // Giảm giá
    const discountAmount = Number(discount) || 0;

    // Tổng cuối = dịch vụ + tiền phòng (nếu chưa thanh toán) - giảm giá
    const total = Math.max(0, roomTotal + servicesTotal - discountAmount);

    // Lưu hóa đơn
    const invoice = await Invoice.create({
      orderId,
      totalAmount: total,
      discount: discountAmount,
      note: note || '',
      customerName: order.bookingId ? undefined : (customerName || ''),
      paidAmount, // phần đã thanh toán online (nếu có)
      remainingAmount: total, // phần còn lại phải thanh toán
    });

    // Cập nhật trạng thái Order + Booking
    order.status = 'completed';
    order.totalPrice = servicesTotal;
    await order.save();

    if (order.bookingId) {
      await Booking.findByIdAndUpdate(order.bookingId, {
        invoiceId: invoice._id
      });
    }

    res.status(201).json({
      message: 'Tạo hóa đơn thành công',
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi tạo hóa đơn',
      error: error.message,
    });
  }
};


// 
exports.getInvoiceDetails = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId).populate({
      path: 'orderId',
      select: '_id bookingId totalPrice',
      populate: {
        path: 'bookingId',
        select: 'bookingCode finalPrice name userId',
        populate: { path: 'userId', select: 'fullName' }
      }
    });
    if (!invoice) return res.status(404).json({ message: 'Hóa đơn không tồn tại' });

    const orderId = invoice.orderId?._id || invoice.orderId;
    const orderDetails = await OrderDetail.find({ orderId }).populate('serviceId');

    res.status(200).json({ invoice, orderDetails });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết hóa đơn', error: error.message });
  }
};


// 
exports.deleteInvoice = async (req, res) => {
  try {
    const id = req.params.id;
    const inv = await Invoice.findById(id).populate('orderId');
    if (!inv) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });

    // nếu có booking --- gỡ liên kết để hiện lại trong "chưa lập"
    if (inv.orderId?.bookingId) {
      await Booking.findByIdAndUpdate(inv.orderId.bookingId, { $unset: { invoiceId: "" } });
    }
    await Invoice.findByIdAndDelete(id);
    res.json({ message: 'Đã xóa hóa đơn' });
  } catch (e) {
    res.status(500).json({ message: 'Lỗi xóa hóa đơn', error: e.message });
  }
};
