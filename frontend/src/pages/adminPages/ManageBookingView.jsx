import { useEffect, useState } from "react";
import BookingRowAdmin from "../../components/admin/BookingRowAdmin";
import { getAllBookings, getBookingByCode } from "../../services/adminService";

function ManageBookingView() {
  const [bookings, setBookings] = useState([]);
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterCancel, setFilterCancel] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await getAllBookings(token);
        setBookings(res.data.bookings);
      } catch (err) {
        console.error("Lỗi khi tải booking:", err);
      }
    };
    fetchBookings();
  }, []);

  const handleSearchBooking = async () => {
    setSearchError("");
    setSearchResult(null);
    if (!searchCode) return;

    try {
      const token = localStorage.getItem("token");
      const res = await getBookingByCode(searchCode, token);
      setSearchResult(res.data.booking);
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchError("Không tìm thấy mã đơn.");
      } else {
        setSearchError("Lỗi khi tìm kiếm.");
      }
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterPayment === "paid" && !b.isPaid) return false;
    if (filterPayment === "unpaid" && b.isPaid) return false;
    if (filterCancel === "requested" && b.cancelStatus !== "pending") return false;
    if (filterCancel === "none" && b.cancelStatus === "pending") return false;
    if (filterDate && new Date(b.bookingDate).toISOString().split("T")[0] !== filterDate)
      return false;
    return true;
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const currentItems = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Quản lý đơn đặt phòng</h1>

      {/* Tìm mã đơn */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Tra cứu mã đơn</label>
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value.trim())}
            placeholder="Nhập mã đơn booking (VD: HDAB1421)"
            className="border px-3 py-2 rounded-md shadow-sm w-64"
          />
        </div>
        <button
          onClick={handleSearchBooking}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tìm
        </button>
        {searchError && (
          <p className="text-sm text-red-600 mt-2">{searchError}</p>
        )}
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Lọc theo thanh toán</label>
          <select
            value={filterPayment}
            onChange={(e) => {
              setFilterPayment(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded-md shadow-sm"
          >
            <option value="all">Tất cả</option>
            <option value="paid">Đã thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Lọc theo yêu cầu hủy</label>
          <select
            value={filterCancel}
            onChange={(e) => {
              setFilterCancel(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded-md shadow-sm"
          >
            <option value="all">Tất cả</option>
            <option value="requested">Có yêu cầu hủy</option>
            <option value="none">Không có yêu cầu</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tìm theo ngày</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded-md shadow-sm"
          />
        </div>

        <button
          className="ml-auto px-4 py-2 bg-gray-100 text-gray-800 border rounded hover:bg-gray-200"
          onClick={() => {
            setFilterPayment("all");
            setFilterCancel("all");
            setFilterDate("");
            setCurrentPage(1);
          }}
        >
          Đặt lại bộ lọc
        </button>
      </div>

      {/* Bảng đơn */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <th className="px-4 py-2">Khách</th>
              <th className="px-4 py-2">Phòng</th>
              <th className="px-4 py-2">Ngày</th>
              <th className="px-4 py-2">Khung giờ</th>
              <th className="px-4 py-2 text-right">Tổng tiền</th>
              <th className="px-4 py-2">Thanh toán</th>
              <th className="px-4 py-2">Hủy</th>
              <th className="px-4 py-2">Duyệt hủy</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((b) => (
              <BookingRowAdmin key={b._id} booking={b} onChange={setBookings} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Sau
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Trước
          </button>
        </div>
      )}

      {/* Popup kết quả tìm mã đơn */}
      {searchResult && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4">Chi tiết mã đơn</h3>
            <div className="text-sm space-y-2">
              <p><strong>Mã đơn:</strong> {searchResult.bookingCode}</p>
              <p><strong>Khách:</strong> {searchResult.name || "Vãng lai"} - {searchResult.phone}</p>
              <p><strong>Phòng:</strong> {searchResult.roomName}</p>
              <p><strong>Ngày:</strong> {new Date(searchResult.bookingDate).toLocaleDateString()}</p>
              <p><strong>Khung giờ:</strong> {searchResult.timeSlots.join(", ")}</p>
              <p><strong>Thanh toán:</strong> {searchResult.isPaid ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"} ({searchResult.paymentMethod?.toUpperCase()})</p>
              <p><strong>Tổng tiền:</strong> {searchResult.finalPrice.toLocaleString()}₫</p>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setSearchResult(null)}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBookingView;
