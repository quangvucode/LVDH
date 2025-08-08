const Order = require('../models/order');
const OrderDetail = require('../models/orderDetail');
const Service = require('../models/service'); // dùng để lấy giá dịch vụ nếu cần

// === Tạo Order mới ===
exports.createOrder = async (req, res) => {
  try {
    const { bookingId, services = [] } = req.body;

    // Tạm tính tổng giá: chỉ cộng giá dịch vụ
    let totalPrice = 0;

    if (services.length > 0) {
      // Lấy giá từng dịch vụ
      for (let s of services) {
        const service = await Service.findById(s.serviceId);
        if (!service) {
          return res.status(404).json({ message: `Dịch vụ không tồn tại: ${s.serviceId}` });
        }
        totalPrice += service.price * s.quantity;
      }
    }

    // Tạo Order
    const order = await Order.create({
      bookingId: bookingId || null,
      totalPrice,
      status: "pending",
    });

    // Tạo chi tiết dịch vụ (nếu có)
    if (services.length) {
      await Promise.all(
        services.map(async (s) => {
          const service = await Service.findById(s.serviceId);
          return OrderDetail.create({
            orderId: order._id,
            serviceId: s.serviceId,
            quantity: s.quantity,
            price: service.price,
          });
        })
      );
    }

    // Trả về order + orderId
    return res.status(201).json({
      message: "Tạo Order thành công",
      order,
      orderId: order._id,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Lỗi tạo Order",
      error: err.message,
    });
  }
};



// === Thêm OrderDetail vào Order ===
exports.addOrderDetail = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { serviceId, quantity } = req.body;

    // Lấy giá dịch vụ
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }

    const price = service.price; // lấy giá hiện tại

    // Tạo dòng chi tiết
    const detail = new OrderDetail({
      orderId,
      serviceId,
      quantity,
      price
    });
    await detail.save();

    // Cập nhật tổng tiền của Order
    const totalDetailPrice = price * quantity;
    await Order.findByIdAndUpdate(orderId, {
      $inc: { totalPrice: totalDetailPrice }
    });

    res.status(201).json(detail);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm dịch vụ', error: error.message });
  }
};

// === Lấy chi tiết Order (kèm OrderDetail) ===
exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate('bookingId');
    if (!order) {
      return res.status(404).json({ message: 'Order không tồn tại' });
    }

    const details = await OrderDetail.find({ orderId }).populate('serviceId');

    res.status(200).json({
      order,
      details
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết Order', error: error.message });
  }
};
