import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPasswordView() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("Mật khẩu phải có ít nhất 8 ký tự, 1 chữ in hoa và 1 ký tự đặc biệt.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        newPassword,
      });

      // ⏱ delay nhỏ 800ms trước khi hiện alert
      setTimeout(() => {
        alert(res.data.message || "Đặt lại mật khẩu thành công.");
        navigate("/login");
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Liên kết không hợp lệ hoặc đã hết hạn.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Đặt lại mật khẩu</h2>

        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-medium py-2 px-4 rounded transition duration-200 ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordView;
