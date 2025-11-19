import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

export default function VerifyFailedView() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const reason = params.get("reason");

  useEffect(() => {
    let message = "Xác minh tài khoản thất bại.";
    if (reason === "invalid") message = "Liên kết xác minh không hợp lệ.";
    if (reason === "expired") message = "Liên kết xác minh đã hết hạn.";
    if (reason === "server") message = "Có lỗi xảy ra khi xác minh. Vui lòng thử lại.";

    Swal.fire({
      icon: "error",
      title: "Xác minh thất bại",
      text: message,
      confirmButtonText: "OK",
      confirmButtonColor: "#ef4444", // đỏ Tailwind
      customClass: {
        popup: "rounded-lg shadow-lg",
      },
    }).then(() => {
      navigate("/login");
    });
  }, [reason, navigate]);

  return <div className="flex justify-center items-center min-h-screen bg-gray-50"></div>;
}
