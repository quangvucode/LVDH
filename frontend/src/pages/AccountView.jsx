import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  getCurrentUser,
  updateUserInfo,
  changePassword,
  getBookingHistory,
} from "../services/serviceApi";
import "../styles/AccountView.css";

function AccountView() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [showModal, setShowModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [bookings, setBookings] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    getCurrentUser(token).then((res) => {
      setUser(res.data);
      setFormData({ name: res.data.name, phone: res.data.phone });
    });

    getBookingHistory(token).then((res) => setBookings(res.data));
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = () => {
    const phoneRegex = /^0\d{9}$/;
    const nameRegex = /^[a-zA-Z\sÀ-ỹ]+$/u;

    if (!nameRegex.test(formData.name.trim())) {
      alert("Họ tên không hợp lệ. Không chứa số hoặc ký tự đặc biệt.");
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      alert("Số điện thoại không hợp lệ.");
      return;
    }

    updateUserInfo(formData, token)
      .then(() => {
        alert("Cập nhật thành công!");
        setUser({ ...user, ...formData });
        setEditing(false);
      })
      .catch(() => alert("Cập nhật thất bại"));
  };

  const handlePasswordChange = () => {
    const { oldPassword, newPassword, confirmPassword } = passwordData;
    const errors = {};

    if (!oldPassword) errors.oldPassword = "Vui lòng nhập mật khẩu cũ.";
    if (!newPassword) errors.newPassword = "Vui lòng nhập mật khẩu mới.";
    if (!confirmPassword) errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu mới và xác nhận không khớp.";
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
    if (newPassword && !passwordRegex.test(newPassword)) {
      errors.newPassword = "Mật khẩu phải ít nhất 8 ký tự, 1 chữ in hoa và 1 ký tự đặc biệt.";
    }

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    changePassword(passwordData, token)
      .then(() => {
        alert("Đổi mật khẩu thành công!");
        setShowModal(false);
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordErrors({});
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Đổi mật khẩu thất bại";
        if (msg.toLowerCase().includes("mật khẩu cũ")) {
          setPasswordErrors({ oldPassword: msg });
        } else {
          setPasswordErrors({ newPassword: msg });
        }
      });
  };

  return (
    <MainLayout>
      <div className="account-container">
        <div className="account-wrapper">
          <h2 className="account-title">Thông tin cá nhân</h2>
          <div className="account-grid">
            <div className="account-form">
              <label>Họ tên:</label>
              <input
                name="name"
                value={formData.name}
                disabled={!editing}
                onChange={handleChange}
                className={!editing ? "disabled" : ""}
              />
              <label>Số điện thoại:</label>
              <input
                name="phone"
                value={formData.phone}
                disabled={!editing}
                onChange={handleChange}
                className={!editing ? "disabled" : ""}
              />
              <label>Email:</label>
              <input value={user?.email || ""} disabled className="disabled" />
            </div>
            <div className="account-buttons">
              {!editing ? (
                <button onClick={() => setEditing(true)}>Chỉnh sửa</button>
              ) : (
                <button onClick={handleUpdate}>Lưu thay đổi</button>
              )}
              <button className="outline-btn" onClick={() => setShowModal(true)}>Đổi mật khẩu</button>
              <button className="outline-btn" onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? "Ẩn lịch sử" : "Xem lịch sử đặt phòng"}
              </button>
            </div>
          </div>

          {showHistory && (
            <div className="booking-history">
              <h3>Lịch sử đặt phòng</h3>
              {bookings.length > 0 ? (
                <ul>
                  {bookings.map((b) => (
                    <li key={b._id} className="booking-card">
                      <p><strong>Phòng:</strong> {b.roomName}</p>
                      <p><strong>Ngày nhận:</strong> {b.checkIn}</p>
                      <p><strong>Ngày trả:</strong> {b.checkOut}</p>
                      <p><strong>Trạng thái:</strong> {b.status}</p>
                    </li>
                  ))}
                </ul>
              ) : <p>Chưa có đơn đặt phòng nào.</p>}
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Đổi mật khẩu</h3>
              <input
                type="password"
                placeholder="Mật khẩu cũ"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              />
              {passwordErrors.oldPassword && <p className="error-text">{passwordErrors.oldPassword}</p>}

              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              {passwordErrors.newPassword && <p className="error-text">{passwordErrors.newPassword}</p>}

              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
              {passwordErrors.confirmPassword && <p className="error-text">{passwordErrors.confirmPassword}</p>}

              <div className="modal-buttons">
                <button onClick={handlePasswordChange}>Xác nhận</button>
                <button className="outline-btn" onClick={() => setShowModal(false)}>Hủy</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default AccountView;
