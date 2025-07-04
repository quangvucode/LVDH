import { useEffect, useState } from "react";
import axios from "axios";

function DashboardView() {
  const [stats, setStats] = useState({
    todayBookings: 0,
    emptyRooms: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/admin/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy thống kê:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Thống kê hôm nay</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded shadow">
          <p className="text-gray-600">Đơn đặt hôm nay</p>
          <h2 className="text-3xl font-bold">{stats.todayBookings}</h2>
        </div>
        <div className="p-6 bg-white rounded shadow">
          <p className="text-gray-600">Phòng còn trống</p>
          <h2 className="text-3xl font-bold">{stats.emptyRooms}</h2>
        </div>
        <div className="p-6 bg-white rounded shadow">
          <p className="text-gray-600">Doanh thu</p>
          <h2 className="text-3xl font-bold text-green-600">{stats.revenue.toLocaleString()}₫</h2>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
