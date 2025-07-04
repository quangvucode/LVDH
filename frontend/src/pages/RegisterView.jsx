import "../styles/RegisterView.css";
import { useForm } from "react-hook-form";
import { register as registerApi } from "../services/serviceApi";
import MainLayout from "../layouts/MainLayout";

function RegisterView() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const formatName = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const onSubmit = async (data) => {
    data.name = formatName(data.name);

    try {
      const res = await registerApi(data);
      alert(res.data.message || "Đăng ký thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <MainLayout>
      <div className="register-container">
        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="form-title">Đăng ký</h2>

          <input
            {...register("name", {
              required: "Vui lòng nhập họ tên",
              minLength: { value: 3, message: "Tên quá ngắn" },
            })}
            placeholder="Họ tên"
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
          />
          {errors.email && <p className="error">{errors.email.message}</p>}

          <input
            {...register("password", {
              required: "Vui lòng nhập mật khẩu",
              minLength: {
                value: 8,
                message: "Mật khẩu phải có ít nhất 8 ký tự",
              },
              pattern: {
                value: /^(?=.*[A-Z])(?=.*[^A-Za-z0-9])/,
                message:
                  "Mật khẩu phải có ít nhất 1 chữ in hoa và 1 ký tự đặc biệt",
              },
            })}
            type="password"
            placeholder="Mật khẩu"
          />
          {errors.password && <p className="error">{errors.password.message}</p>}

          <button type="submit">Đăng ký</button>
        </form>
      </div>
    </MainLayout>
  );
}

export default RegisterView;
