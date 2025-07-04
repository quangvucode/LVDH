import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestResetPassword } from "../services/serviceApi";
import { FaArrowLeft } from "react-icons/fa";

function ForgotPasswordView() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ.");
      return;
    }

    setLoading(true);

    requestResetPassword({ email })
      .then((res) => {
        alert(res.data.message || "Đã gửi liên kết khôi phục mật khẩu.");
        navigate("/login");
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message || "Không thể gửi yêu cầu, thử lại sau.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 relative">
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 flex items-center text-base font-medium text-gray-700 hover:text-blue-600"
      >
        <FaArrowLeft className="mr-2 text-lg" />
        Quay lại
      </button>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Quên mật khẩu
        </h2>

        <input
          type="email"
          placeholder="Nhập email đăng ký"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
        >
          {loading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
        </button>
      </form>
    </div>
  );
}

export default ForgotPasswordView;
