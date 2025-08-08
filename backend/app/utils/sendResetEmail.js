const nodemailer = require("nodemailer");

const sendResetEmail = async (email, token, name = "") => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false  // Bắt buộc khi Gmail từ chối SSL do self-signed
      }
    });

  const resetLink = `http://localhost:3000/reset-password/${token}`; // frontend URL

  await transporter.sendMail({
    from: `"RabbitHomestay" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Đặt lại mật khẩu - RabitHomestay",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Yêu cầu đặt lại mật khẩu</h2>
        <p>Chào ${name || "bạn"},</p>
        <p>Bạn hoặc ai đó đã yêu cầu đặt lại mật khẩu cho tài khoản RabbitHomestay.</p>
        <p>Nhấn vào nút bên dưới để đặt lại mật khẩu. Liên kết sẽ hết hạn sau 15 phút.</p>
        <p style="margin: 16px 0;">
          <a href="${resetLink}" style="padding: 10px 20px; background: #2563eb; color: white; border-radius: 6px; text-decoration: none;">Đặt lại mật khẩu</a>
        </p>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        <p>Trân trọng,<br/>RabbitHomestay</p>
      </div>
    `,
  });
};

module.exports = sendResetEmail;
