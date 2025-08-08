import "../styles/RegisterView.css";
import { useForm } from "react-hook-form";
import { register as registerApi } from "../services/serviceApi";
import MainLayout from "../layouts/MainLayout";

function RegisterView() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

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
    const { confirmPassword, ...payload } = data;

    try {
      const res = await registerApi(payload);
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
              maxLength: { value: 50, message: "Tên quá dài (tối đa 50 ký tự)" },
              pattern: {
                value: /^[A-Za-zÀ-ỹ\s]+$/,
                message: "Họ tên chỉ được chứa chữ cái và khoảng trắng",
              },
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
          />
          {errors.password && <p className="error">{errors.password.message}</p>}
          <input
            {...register("confirmPassword", {
              required: "Vui lòng nhập lại mật khẩu",
              validate: (v) => v === watch("password") || "Mật khẩu nhập lại không khớp",
            })}
            type="password"
            placeholder="Nhập lại mật khẩu"
          />
          {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
          <button type="submit">Đăng ký</button>
        </form>
      </div>
    </MainLayout>
  );
}

export default RegisterView;
