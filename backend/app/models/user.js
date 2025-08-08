const mongoose = require('mongoose');

// Tạo schema cho user
const userSchema = new mongoose.Schema({
  name: {
    type: String,        // tên là kiểu chuỗi
    required: true,      // bắt buộc phải có
    trim: true           // loại bỏ khoảng trắng 2 đầu chuỗi
  },
  phone: {
    type: String,        // dùng String vì có thể chứa số 0 đầu
    required: true,      // bắt buộc nhập
    unique: true         // không được trùng số điện thoại
  },
  email: {
    type: String,
    required: true,     // email có thể không cần (nếu khách vãng lai)
    trim: true
  },
  password: {
    type: String,        // lưu password sau khi hash
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'], // chỉ cho phép 2 giá trị này
    default: 'customer'          // mặc định là khách hàng
  },
  createdAt: {
    type: Date,
    default: Date.now     // tự gán thời gian tạo khi insert user
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifyToken: {
    type: String
  },
  verifyTokenExpires: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 1000) // 1 phút
  },
  resetToken: { type: String 
    
  },
  resetTokenExpires: { type: Date },

  isActive: { type: Boolean, 
    default: true }

});

// Export model để dùng trong controller
module.exports = mongoose.model('User', userSchema);
