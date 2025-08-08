import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { createBooking, createPayment, getCurrentUser } from "../services/serviceApi";
import "../styles/PaymentView.css";

function PaymentView() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: "", phone: "", email: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  const { room, selectedSlots, paymentMethod } = state || {};
  const groupedByDate = {};
  selectedSlots.forEach((key) => {
    const [date, slot] = key.split("_");
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date].push(slot);
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      getCurrentUser(token)
        .then((res) => setUserInfo(res.data))
        .catch(() => setIsLoggedIn(false));
    }
  }, []);

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    const nameRegex = /^[\p{L} ]+$/u;
    const phoneRegex = /^0\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!userInfo.name.trim() || !nameRegex.test(userInfo.name)) {
      return "Họ tên không hợp lệ";
    }
    if (!phoneRegex.test(userInfo.phone)) {
      return "Số điện thoại không hợp lệ";
    }
    if (userInfo.email && !emailRegex.test(userInfo.email)) {
      return "Email không hợp lệ";
    }
    return "";
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    const validationMsg = validateInputs();
    if (validationMsg) {
      setError(validationMsg);
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        phone: userInfo.phone,
        name: userInfo.name,
        email: userInfo.email,
        roomId: room._id,
        bookingDate: Object.keys(groupedByDate)[0],
        timeSlots: groupedByDate[Object.keys(groupedByDate)[0]],
        paymentMethod,
        sendMail: sendEmail,
      };

      const token = localStorage.getItem("token");
      const res = await createBooking(bookingData, token);
      const booking = res.data.booking;

      if (paymentMethod === "online") {
        const payRes = await createPayment({ bookingId: booking._id, amount: booking.finalPrice });
        window.location.href = payRes.data.paymentUrl;
      } else {
        navigate("/booking-success", { state: { booking, userInfo, sendEmail } });
      }
    } catch (err) {
      setError("Đặt phòng thất bại: " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="payment-container">
        <h2 className="payment-title">Xác nhận thanh toán</h2>

        <div className="payment-details">
          <p><strong>Tên phòng:</strong> {room?.roomName}</p>
          <p><strong>Khung giờ:</strong> {selectedSlots.map(s => s.split("_")[1]).join(", ")}</p>
          <p><strong>Ngày:</strong> {Object.keys(groupedByDate)[0]}</p>
          <p><strong>Hình thức thanh toán:</strong> {paymentMethod === "online" ? "Online" : "Trực tiếp"}</p>
        </div>

        <div className="payment-form">
          {!isLoggedIn && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Họ và tên"
                value={userInfo.name}
                onChange={handleChange}
                className="payment-input"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Số điện thoại"
                value={userInfo.phone}
                onChange={handleChange}
                className="payment-input"
              />
            {sendEmail && (
              <input
                type="email"
                name="email"
                placeholder="Email (tuỳ chọn)"
                value={userInfo.email}
                onChange={handleChange}
                className="payment-input"
              />
            )}
            </>
          )}
          <label className="email-checkbox">
            <input type="checkbox" checked={sendEmail} onChange={() => setSendEmail(!sendEmail)} />
            Bạn có muốn nhận mail
          </label>
        </div>

        {error && <p className="payment-error">{error}</p>}

        <button
          disabled={loading}
          onClick={handleConfirm}
          className="payment-button"
        >
          {loading ? "Đang xử lý..." : "Xác nhận và thanh toán"}
        </button>
      </div>
    </MainLayout>
  );
}

export default PaymentView;
