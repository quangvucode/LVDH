const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token, name = '') => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false  // Bắt buộc khi Gmail từ chối SSL do self-signed
    }
  });

  const link = `http://localhost:5000/api/auth/verify-email/${token}`;

  await transporter.sendMail({
    from: `"RabbitHomestay" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Xác minh tài khoản - RabbitHomestay',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #2c3e50;">Xác minh tài khoản của bạn</h2>
        <p>Chào ${name || 'quý khách'},</p>
        <p>Cảm ơn bạn đã đăng ký sử dụng dịch vụ của <strong>RabbitHomestay</strong>.</p>
        <p>Vui lòng nhấn vào liên kết bên dưới để xác minh tài khoản của bạn:</p>
        <p><a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px;">Xác minh ngay</a></p>
        <p>Nếu bạn không tiếp tục thực hiện đăng ký, hãy bỏ qua email này.</p>
        <p>Trân trọng,<br>Đội ngũ RabbitHomestay</p>
      </div>
    `
  });
};

module.exports = sendVerificationEmail;
