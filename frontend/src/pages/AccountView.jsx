import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {
  getCurrentUser,
  updateUserInfo,
  changePassword,
  getBookingHistory,
  requestCancelBooking,
} from "../services/serviceApi";
import "../styles/AccountView.css";
import Swal from "sweetalert2";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (!token) return;

    getCurrentUser(token).then((res) => {
      setUser(res.data);
      setFormData({ name: res.data.name, phone: res.data.phone });
    });

    getBookingHistory(token).then((res) => {
      const data = res.data.bookings || res.data;
      setBookings(data);
    });
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = () => {
    const phoneRegex = /^0\d{9}$/;
    const nameRegex = /^[a-zA-Z\sÀ-ỹ]+$/u;

    if (!nameRegex.test(formData.name.trim())) {
      Swal.fire("Lỗi", "Họ tên không hợp lệ. Không chứa số hoặc ký tự đặc biệt.", "error");
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      Swal.fire("Lỗi", "Số điện thoại không hợp lệ.", "error");
      return;
    }

    updateUserInfo(formData, token)
      .then(() => {
        Swal.fire("Thành công", "Cập nhật thành công!", "success");
        setUser({ ...user, ...formData });
        setEditing(false);
      })
      .catch(() => Swal.fire("Lỗi", "Cập nhật thất bại", "error"));
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
        Swal.fire("Thành công", "Đổi mật khẩu thành công!", "success");
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

  const handleCancelRequest = (id, status) => {
  if (status !== "pending") {
    Swal.fire("Không thể hủy", "Đơn đã được xác nhận hoặc hoàn tất, không thể gửi yêu cầu hủy.", "warning");
    return;
  }
  Swal.fire({
    title: "Xác nhận",
    text: "Bạn có chắc muốn gửi yêu cầu hủy đơn này?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Gửi",
  }).then((result) => {
    if (result.isConfirmed) {
      requestCancelBooking(id, token)
        .then(() => {
          Swal.fire("Đã gửi", "Yêu cầu hủy đã được gửi.", "success");
          setBookings((prev) =>
            prev.map((b) =>
              b._id === id ? { ...b, cancelStatus: "pending" } : b
            )
          );
        })
        .catch((err) => {
          const msg = err.response?.data?.message || "Gửi yêu cầu hủy thất bại";
          Swal.fire("Lỗi", msg, "error");
        });
    }
  });
};


  const paginatedBookings = bookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
                  <>
                    <div className="booking-grid">
                      {paginatedBookings.map((b) => (
                        <div key={b._id} className="booking-card">
                          <p><strong>Mã đơn:</strong> {b.bookingCode}</p>
                          <p><strong>Phòng:</strong> {b.roomName}</p>
                          <p><strong>Ngày:</strong> {new Date(b.bookingDate).toLocaleDateString()}</p>
                          <p><strong>Khung giờ:</strong> {b.timeSlots.join(", ")}</p>
                          <p><strong>Thanh toán:</strong> {b.paymentMethod === "online" ? "Online" : "Tại quầy"}</p>
                          <p><strong>Trạng thái:</strong> {
                            b.status === 'completed' ? "Hoàn thành" :
                            b.status === 'confirmed' ? "Đã xác nhận" : "Chưa xác nhận"
                          }</p>
                          {
                            b.cancelStatus === 'accepted' ? (
                              <p><strong>Hủy:</strong> Đã hủy</p>
                            ) : b.cancelStatus === 'pending' ? (
                              <button className="disabled-btn" disabled>Đang chờ</button>
                            ) : (
                              <button onClick={() => handleCancelRequest(b._id, b.status)}>
                                Gửi yêu cầu hủy
                                </button>
                            )
                          }
                        </div>
                      ))}
                    </div>
                  {bookings.length > itemsPerPage && (
                    <div className="pagination">
                      {Array.from({ length: Math.ceil(bookings.length / itemsPerPage) }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={currentPage === i + 1 ? "active" : ""}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : <p>Chưa có đơn đặt phòng nào.</p>}
            </div>
          )}

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
      </div>
    </MainLayout>
  );
}

export default AccountView;
