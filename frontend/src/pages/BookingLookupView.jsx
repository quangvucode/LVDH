import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { lookupBooking } from "../services/serviceApi";

function BookingLookupView() {
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  const isValidPhone = (sdt) => /^0\d{9}$/.test(sdt);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResults([]);

    if (!isValidPhone(phone)) {
      setError("Số điện thoại không hợp lệ !");
      return;
    }

    if (!date) {
      setError("Vui lòng chọn ngày tra cứu");
      return;
    }

    try {
      const res = await lookupBooking({ phone, bookingDate: date });
      setResults(res.data.bookings);
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
        {/* FORM */}
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
        </div>

       { /* KQ */}
        {results.length > 0 && (
          <div className="w-full max-w-6xl mt-10 px-4">
            <div className="flex flex-wrap gap-6 justify-start">
              {results.map((result) => (
                <div
                  key={result._id}
                  className="w-full sm:w-[48%] lg:w-[23%] border rounded-lg p-4 bg-white shadow-md"
                >
                  <h3 className="text-lg font-semibold text-blue-600 mb-3">Thông tin đơn đặt phòng</h3>
                  <div className="space-y-2 text-gray-800 text-sm">
                    <div><span className="font-medium">Mã đơn:</span> {result.bookingCode}</div>
                    <div><span className="font-medium">Họ tên:</span> {result.name}</div>
                    <div><span className="font-medium">Số điện thoại:</span> {result.phone}</div>
                    <div><span className="font-medium">Ngày đặt:</span> {new Date(result.bookingDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">Khung giờ:</span> {result.isFullDay ? "Cả ngày" : result.timeSlots?.join(", ")}</div>
                    <div><span className="font-medium">Phòng:</span> {result.roomName}</div>
                    <div><span className="font-medium">Hình thức thanh toán:</span> {result.paymentMethod === "online" ? "Online" : "Tại chỗ"}</div>
                    <div><span className="font-medium">Tổng tiền:</span> {result.finalPrice?.toLocaleString()} VND</div>
                    <div>
                      <span className="font-medium">Trạng thái:</span>{" "}
                      <span className={`inline-block px-2 py-1 rounded text-white text-xs font-semibold ${
                        result.isPaid ? "bg-green-600" : "bg-yellow-500"
                      }`}>
                        {result.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                      </span>
                    </div>
                    {result.sendMail && (
                      <div className="text-green-600 text-xs italic">Đã gửi email xác nhận</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default BookingLookupView;
