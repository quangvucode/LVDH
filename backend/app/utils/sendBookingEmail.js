const nodemailer = require("nodemailer");

const sendBookingEmail = async (booking, roomName) => {
  if (!booking.email) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #333;">Xác nhận đặt phòng thành công</h2>
      <p><strong>Xin chào ${booking.name || "Quý khách"},</strong></p>
      <p>Cảm ơn bạn đã đặt phòng tại <strong>RabbitHomestay</strong>.</p>
      <hr/>
      <p><strong>Mã đơn:</strong> ${booking.bookingCode}</p>
      <p> ${roomName}</p>
      <p><strong>Ngày:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
      <p><strong>Khung giờ:</strong> ${booking.timeSlots.join(", ")}</p>
      <p><strong>Hình thức thanh toán:</strong> ${booking.paymentMethod === "online" ? "Online" : "Trực tiếp tại quầy"}</p>
      <p><strong>Tổng tiền:</strong> ${booking.finalPrice?.toLocaleString()}đ</p>
      <hr/>
      <p>Vui lòng cung cấp mã đơn này tại quầy lễ tân khi check-in.</p>
      <p>Trân trọng,<br><strong>RabbitHomestay</strong></p>
    </div>
  `;

  await transporter.sendMail({
    from: `"RabbitHomestay" <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: "Xác nhận đặt phòng thành công",
    html: htmlContent
  });
};

module.exports = sendBookingEmail;
