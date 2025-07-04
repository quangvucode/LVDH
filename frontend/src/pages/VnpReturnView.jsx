import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import axios from "axios";
import "../styles/VnpReturnView.css";

function VnpReturnView() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/payment/vnpay-return${search}`);
        if (res.data.booking) {
          setBooking(res.data.booking);
        }
        setStatus("success");
        setMessage(res.data.message || "Thanh toán thành công");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Thanh toán thất bại hoặc bị từ chối");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [search]);

  return (
    <MainLayout>
      <div className="vnp-container">
        {loading ? (
          <p className="vnp-loading">Đang xác minh kết quả thanh toán...</p>
        ) : (
          <div className={`vnp-box ${status === "success" ? "success" : "error"}`}>
            <h2 className="vnp-title">
              {status === "success" ? "Thanh toán thành công" : "Thanh toán thất bại"}
            </h2>
            <p className="vnp-message">{message}</p>

            {status === "success" && booking && (
              <div className="vnp-info">
                <p><strong>Mã đơn:</strong> {booking._id}</p>
                <p><strong>Ngày:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                <p><strong>Khung giờ:</strong> {booking.timeSlots.join(", ")}</p>
                <p><strong>Số điện thoại:</strong> {booking.phone}</p>
                <p><strong>Họ tên:</strong> {booking.name || "Không xác định"}</p>
                <p><strong>Email:</strong> {booking.email || "Không xác định"}</p>
                <p><strong>Hình thức thanh toán:</strong> {booking.paymentMethod === "online" ? "Online" : "Trực tiếp tại quầy"}</p>
                <p><strong>Tổng tiền:</strong> {booking.finalPrice.toLocaleString()}đ</p>
              </div>
            )}

            <button onClick={() => navigate("/")} className="vnp-btn">Về trang chủ</button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default VnpReturnView;
