import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { lookupBooking } from "../services/serviceApi";

function BookingLookupView() {
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const isValidPhone = (sdt) => /^0\d{9}$/.test(sdt);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!isValidPhone(phone)) {
      setError("Số điện thoại không hợp lệ (bắt đầu bằng 0 và đủ 10 số)");
      return;
    }

    if (!date) {
      setError("Vui lòng chọn ngày tra cứu");
      return;
    }

    try {
      const res = await lookupBooking({ phone, bookingDate: date });
      setResult(res.data.booking);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Không tìm thấy đơn đặt phòng phù hợp");
      } else {
        setError("Đã xảy ra lỗi khi tra cứu");
      }
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 py-10 px-4">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Tra cứu đơn đặt phòng</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="p-3 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            />

            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="p-3 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
            >
              Tra cứu
            </button>
          </form>

          {result && (
            <div className="mt-6 bg-blue-50 p-4 rounded shadow text-sm text-gray-700">
              <h3 className="font-bold text-blue-700 mb-2">Kết quả:</h3>
              <p><strong>Họ tên:</strong> {result.fullName || "(không có)"}</p>
              <p><strong>SĐT:</strong> {result.phone}</p>
              <p><strong>Ngày đặt:</strong> {new Date(result.bookingDate).toLocaleDateString()}</p>
              <p><strong>Phòng:</strong> {result.roomName || result.room?.roomName || "(không có)"}</p>
              <p><strong>Trạng thái:</strong> {result.status}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default BookingLookupView;
