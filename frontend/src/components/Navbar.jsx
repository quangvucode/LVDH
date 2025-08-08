import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../styles/Navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      icon: "success",
      title: "Đăng xuất thành công",
      showConfirmButton: false,
      timer: 1500,
    });
  
    setTimeout(() => {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      navigate("/");
    }, 1500);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src="/rabbitlogo1.png" alt="Logo" className="logo-image" />
        <span className="logo-text gradient-text">Rabbit Homestay</span>
      </Link>

      <div className="navbar-center">
        <Link to="/lookup" className="nav-item nav-link">
          <i className="fas fa-search"></i> Tra cứu đặt phòng
        </Link>
        <Link to="/contact" className="nav-item nav-link">
          <i className="fas fa-heart"></i> Liên hệ
        </Link>
      </div>

      <div className="navbar-right">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="nav-item nav-link">Đăng nhập</Link>
            <Link to="/register" className="nav-item nav-link">Đăng ký</Link>
          </>
        ) : (
          <>
            <Link to="/account" className="nav-item nav-link">Tài khoản</Link>
            <button onClick={handleLogout} className="nav-item nav-link">Đăng xuất</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
