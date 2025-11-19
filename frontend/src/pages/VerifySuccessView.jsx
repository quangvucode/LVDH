import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

export default function VerifySuccessView() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const status = params.get("status");

  useEffect(() => {
    let message = "Tài khoản đã được xác minh thành công!";
    if (status === "already") {
      message = "Email của bạn đã được xác minh trước đó.";
    }

    Swal.fire({
      icon: "success",
      title: "Xác minh thành công",
      text: message,
      confirmButtonText: "OK",
      confirmButtonColor: "#10b981", // màu xanh Tailwind
      customClass: {
        popup: "rounded-lg shadow-lg",
      },
    }).then(() => {
      navigate("/login");
    });
  }, [status, navigate]);

  // Trả về rỗng vì chỉ dùng alert
  return <div className="flex justify-center items-center min-h-screen bg-gray-50"></div>;
}
