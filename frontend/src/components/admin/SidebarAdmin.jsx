import { Link, useNavigate } from "react-router-dom";

const SidebarAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen p-4">
      <h2 className="text-xl font-semibold mb-6">Admin Panel</h2>
      <ul className="space-y-2">
        <li><Link to="/admin/dashboard" className="block hover:text-blue-600">Thống kê</Link></li>
        <li><Link to="/admin/bookings" className="block hover:text-blue-600">Đơn đặt phòng</Link></li>
        <li><Link to="/admin/rooms" className="block hover:text-blue-600">Quản lý phòng</Link></li>
        <li><Link to="/admin/users" className="block hover:text-blue-600">Tài khoản khách</Link></li>
      </ul>
      <button onClick={handleLogout} className="mt-6 text-red-500 hover:underline">Đăng xuất</button>
    </aside>
  );
};

export default SidebarAdmin;
