const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -verifyToken -verifyTokenExpires");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateUserInfo = async (req, res) => {
    try {
      const { name, phone } = req.body;
  
      if (!name || !phone) {
        return res.status(400).json({ message: "Thiếu tên hoặc số điện thoại" });
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { name, phone },
        { new: true, runValidators: true }
      ).select("-password -verifyToken -verifyTokenExpires");
  
      res.status(200).json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi server khi cập nhật thông tin" });
    }
  };

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu cũ không đúng" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Mật khẩu mới phải ít nhất 8 ký tự" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi đổi mật khẩu" });
  }
};
