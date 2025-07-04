const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../utils/sendMail');
const sendResetEmail = require("../utils/sendResetEmail");
const crypto = require('crypto'); // để tạo token

exports.register = async (req, res) => {
  const { name, phone, email, password } = req.body;

  try {
    const existingEmail = await User.findOne({ email });

    // Nếu đã tồn tại email
    if (existingEmail) {
      if (existingEmail.isVerified) {
        return res.status(400).json({ message: "Email đã được sử dụng." });
      } else {
        // Cập nhật lại thông tin mới
        const newToken = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 10);
    
        existingEmail.name = name;
        existingEmail.phone = phone;
        existingEmail.password = hashedPassword;
        existingEmail.verifyToken = newToken;
        existingEmail.verifyTokenExpires = new Date(Date.now() + 60 * 1000); // 1 phút
        await existingEmail.save();
    
        await sendVerificationEmail(email, newToken, name);
        return res.status(200).json({ message: "Tài khoản chưa xác minh. Đã gửi lại email xác minh." });
      }
    }
    

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      verifyToken: token,
      verifyTokenExpires: new Date(Date.now() + 60 * 1000) // 1 phút
    });

    await newUser.save();
    await sendVerificationEmail(email, token, name);

    res.status(201).json({ message: "Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};



exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Tài khoản chưa xác minh email, Đăng ký lại để nhận mail" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verifyToken: token });

    if (!user || user.verifyTokenExpires < Date.now()) {
      return res.status(400).send("Token không hợp lệ hoặc đã hết hạn");
    }

    user.isVerified = true;
    user.verifyToken = null;
    user.verifyTokenExpires = null;
    await user.save();

    res.send("Tài khoản đã được xác minh thành công!");
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản." });

    // Chặn nếu tài khoản chưa xác minh
    if (!user.isVerified) return res.status(403).json({ message: "Tài khoản chưa được xác minh email." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 1000 * 60 * 15; // 15 phút
    await user.save();

    await sendResetEmail(email, token, user.name);
    res.status(200).json({ message: "Đã gửi email đặt lại mật khẩu." });
  } catch (err) {
    console.error("Lỗi gửi mail đặt lại mật khẩu:", err);

    res.status(500).json({ message: "Lỗi server." });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Liên kết không hợp lệ hoặc đã hết hạn." });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Đặt lại mật khẩu thành công." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server." });
  }
};



