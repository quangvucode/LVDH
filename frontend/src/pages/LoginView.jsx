import "../styles/LoginView.css";
import { useForm } from "react-hook-form";
import { login } from "../services/serviceApi";
import MainLayout from "../layouts/MainLayout";
import { useNavigate, Link } from "react-router-dom";

function LoginView() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await login(data);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      alert("Đăng nhập thành công");

      if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  } catch (err) {
    alert(err.response?.data?.message || "Đăng nhập thất bại");
  }
};

  return (
    <MainLayout>
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <h2>Đăng nhập</h2>

          <input
            {...register("email")}
            type="email"
            placeholder="Email"
            required
          />
          <input
            {...register("password")}
            type="password"
            placeholder="Mật khẩu"
            required
          />

          <div className="forgot-password-wrapper">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button type="submit">Đăng nhập</button>
        </form>
      </div>
    </MainLayout>
  );
}

export default LoginView;
