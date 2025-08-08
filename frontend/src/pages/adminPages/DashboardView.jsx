import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/adminService";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";
import {
  FaClipboardList, FaClock, FaMoneyBillWave, FaChartLine
} from "react-icons/fa";

function DashboardView() {
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalSlotsToday: 0,
    revenueToday: 0,
    revenueMonth: 0,
    revenuePerDay: [],
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 6);

    const defaultFrom = last7Days.toISOString().split("T")[0];
    const defaultTo = today.toISOString().split("T")[0];

    setFromDate(defaultFrom);
    setToDate(defaultTo);

    fetchStats(defaultFrom, defaultTo);
  }, []);

  const fetchStats = async (from, to) => {
    try {
      const token = localStorage.getItem("token");
      const res = await getDashboardStats(token, from, to);
      setStats(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy thống kê:", err);
    }
  };

  const handleFilter = () => {
    if (!fromDate || !toDate) return;
    fetchStats(fromDate, toDate);
  };

  const cardStyle =
    "flex items-center gap-4 p-6 bg-white rounded-2xl shadow-md";

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Thống kê tổng quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className={cardStyle}>
          <FaClipboardList className="text-blue-500 text-3xl" />
          <div>
            <p className="text-gray-600">Đơn đặt hôm nay</p>
            <h2 className="text-2xl font-bold">{stats.todayBookings}</h2>
          </div>
        </div>

        <div className={cardStyle}>
          <FaClock className="text-purple-500 text-3xl" />
          <div>
            <p className="text-gray-600">Khung giờ đã đặt</p>
            <h2 className="text-2xl font-bold">{stats.totalSlotsToday}</h2>
          </div>
        </div>

        <div className={cardStyle}>
          <FaMoneyBillWave className="text-green-600 text-3xl" />
          <div>
            <p className="text-gray-600">Doanh thu hôm nay</p>
            <h2 className="text-2xl font-bold text-green-700">
              {stats.revenueToday.toLocaleString("vi-VN")}₫
            </h2>
            <p className="text-sm text-gray-500">
              Đã thanh toán: <span className="font-semibold text-green-600">
                {stats.paidToday?.toLocaleString("vi-VN")}₫
              </span>
            </p>
            <p className="text-sm text-gray-500">
              Chưa thanh toán: <span className="font-semibold text-red-500">
                {stats.unpaidToday?.toLocaleString("vi-VN")}₫
              </span>
            </p>
          </div>
        </div>


        <div className={cardStyle}>
          <FaChartLine className="text-orange-500 text-3xl" />
          <div>
            <p className="text-gray-600">Doanh thu tháng</p>
            <h2 className="text-2xl font-bold text-orange-600">
              {stats.revenueMonth.toLocaleString("vi-VN")}₫
            </h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600">Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border p-2 rounded ml-2"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Đến ngày</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border p-2 rounded ml-2"
            />
          </div>
          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Lọc dữ liệu
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">Biểu đồ doanh thu</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.revenuePerDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value.toLocaleString("vi-VN");
                  return (
                    <div className="bg-white border rounded shadow px-3 py-2 text-sm">
                      <p><strong>{label}</strong></p>
                      <p>Doanh thu: {value}₫</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="total" fill="#4ade80" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DashboardView;
