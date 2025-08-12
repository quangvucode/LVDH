import "../styles/RegisterView.css";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Swal from "sweetalert2";
import { register as registerApi } from "../services/serviceApi";
import MainLayout from "../layouts/MainLayout";

function RegisterView() {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const formatName = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const onSubmit = async (data) => {
    if (loading) return; // chặn bấm liên tiếp
    setLoading(true);

    try {
      data.name = formatName(data.name);
      const { confirmPassword, ...payload } = data;

      const res = await registerApi(payload);

      await Swal.fire({
        icon: "success",
        title: "Đăng ký thành công",
        text: res?.data?.message || "Vui lòng kiểm tra email để xác minh tài khoản.",
        confirmButtonText: "Đã hiểu"
      });

      reset(); // dọn form sau khi hiện thông báo
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Đăng ký thất bại",
        text: err?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        confirmButtonText: "Đóng"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="register-container">
        {/* overlay loading toàn form */}
        {loading && <div className="form-overlay" aria-hidden="true">
          <div className="spinner" />
          <div className="loading-text">Đang xử lý...</div>
        </div>}

        <form
          className={`register-form ${loading ? "is-loading" : ""}`}
          onSubmit={handleSubmit(onSubmit)}
          aria-busy={loading}
        >
          <h2 className="form-title">Đăng ký</h2>

          <input
            {...register("name", {
              required: "Vui lòng nhập họ tên",
              minLength: { value: 3, message: "Tên quá ngắn" },
              maxLength: { value: 50, message: "Tên quá dài (tối đa 50 ký tự)" },
              pattern: {
                value: /^[A-Za-zÀ-ỹ\s]+$/,
                message: "Họ tên chỉ được chứa chữ cái và khoảng trắng",
              },
            })}
            placeholder="Họ tên"
            disabled={loading}
          />
          {errors.name && <p className="error">{errors.name.message}</p>}

          <input
            {...register("phone", {
              required: "Vui lòng nhập số điện thoại",
              pattern: {
                value: /^0\d{9}$/,
                message: "Số điện thoại không hợp lệ",
              },
            })}
            placeholder="Số điện thoại"
            disabled={loading}
          />
          {errors.phone && <p className="error">{errors.phone.message}</p>}

          <input
            {...register("email", {
              required: "Vui lòng nhập email",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email không hợp lệ",
              },
            })}
            type="email"
            placeholder="Email"
            disabled={loading}
          />
          {errors.email && <p className="error">{errors.email.message}</p>}

          <input
            {...register("password", {
              required: "Vui lòng nhập mật khẩu",
              minLength: { value: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
              maxLength: { value: 50, message: "Mật khẩu tối đa 50 ký tự" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
                message: "Phải có chữ thường, chữ hoa, số và ký tự đặc biệt",
              },
              validate: {
                noEdgeSpaces: (v) => v.trim() === v || "Không có khoảng trắng ở đầu/cuối",
              },
            })}
            type="password"
            placeholder="Mật khẩu"
            disabled={loading}
          />
          {errors.password && <p className="error">{errors.password.message}</p>}

          <input
            {...register("confirmPassword", {
              required: "Vui lòng nhập lại mật khẩu",
              validate: (v) => v === watch("password") || "Mật khẩu nhập lại không khớp",
            })}
            type="password"
            placeholder="Nhập lại mật khẩu"
            disabled={loading}
          />
          {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner spinner--btn" /> Đang đăng ký...
              </span>
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>
      </div>
    </MainLayout>
  );
}

export default RegisterView;
