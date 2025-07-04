import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import "../styles/BookingSuccessView.css";

function BookingSuccessView() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { booking, userInfo } = state || {};

  if (!booking) {
    return (
      <MainLayout>
        <div className="success-container">
          <p className="error-message">Không tìm thấy thông tin đơn đặt phòng.</p>
        </div>
      </MainLayout>
    );
  }

  const { bookingDate, timeSlots, _id, phone, finalPrice, paymentMethod } = booking;

  return (
    <MainLayout>
      <div className="success-container">
        <h2 className="success-title">Đặt phòng thành công!</h2>
        <p className="success-sub">Vui lòng lưu lại thông tin sau để xác nhận khi đến nhận phòng:</p>

        <div className="success-box">
          <p><strong>Mã đơn:</strong> {_id}</p>
          <p><strong>Ngày:</strong> {new Date(bookingDate).toLocaleDateString()}</p>
          <p><strong>Khung giờ:</strong> {timeSlots.join(", ")}</p>
          <p><strong>Số điện thoại:</strong> {phone}</p>
          <p><strong>Họ tên:</strong> {userInfo?.name || "Không xác định"}</p>
          <p><strong>Email:</strong> {userInfo?.email || "Không xác định"}</p>
          <p><strong>Hình thức thanh toán:</strong> {paymentMethod === "online" ? "Online" : "Trực tiếp"}</p>
          <p><strong>Tổng tiền:</strong> {finalPrice.toLocaleString()}đ</p>
        </div>

        <button className="back-home-btn" onClick={() => navigate("/")}>Về trang chủ</button>
      </div>
    </MainLayout>
  );
}

export default BookingSuccessView;
