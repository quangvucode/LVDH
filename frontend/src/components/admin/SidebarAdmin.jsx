import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, BedDouble, Users, CalendarDays } from "lucide-react";

const SidebarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Thống kê",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Đơn đặt phòng",
      path: "/admin/bookings",
      icon: <CalendarDays size={18} />,
    },
    {
      label: "Quản lý phòng",
      path: "/admin/rooms",
      icon: <BedDouble size={18} />,
    },
    {
    label: "Quản lý dịch vụ",
    path: "/admin/services",
    icon: <CalendarDays size={18} />,
    },
    { label: "Quản lý hóa đơn", 
      path: "/admin/invoices", 
      icon: <CalendarDays size={18} /> 
    },
    {
      label: "Tài khoản khách",
      path: "/admin/users",
      icon: <Users size={18} />,
    },
  ];

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen p-4">
      <h2 className="text-xl font-semibold text-blue-700 mb-6 border-b pb-3">
        Quản lý Rabbit Homestay
      </h2>
      <ul className="space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition
                  ${isActive ? "bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-600" : "hover:bg-gray-100"}
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        onClick={handleLogout}
        className="mt-8 flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition text-sm"
      >
        <LogOut size={18} />
        <span>Đăng xuất</span>
      </button>
    </aside>
  );
};

export default SidebarAdmin;
