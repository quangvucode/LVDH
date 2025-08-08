const Service = require('../models/service');

// Lấy danh sách dịch vụ
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách dịch vụ', error: error.message });
  }
};

// Tạo dịch vụ mới
exports.createService = async (req, res) => {
  try {
    const { name, description, price, status } = req.body;

    const service = new Service({
      name,
      description,
      price,
      status: status || 'active'
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo dịch vụ', error: error.message });
  }
};

// Cập nhật dịch vụ
exports.updateService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { name, description, price, status } = req.body;

    const service = await Service.findByIdAndUpdate(
      serviceId,
      { name, description, price, status },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật dịch vụ', error: error.message });
  }
};

// Xóa dịch vụ
exports.deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findByIdAndDelete(serviceId);

    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }

    res.status(200).json({ message: 'Đã xóa dịch vụ' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa dịch vụ', error: error.message });
  }
};
