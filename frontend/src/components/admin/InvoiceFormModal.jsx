import { useEffect, useState } from "react";
import {
  createInvoice,
  getServices,
  createOrder,
  getBookingDetails,
} from "../../services/adminService";
import { toast } from "react-toastify";

function InvoiceFormModal({ bookingId = null, onClose, onSaved }) {
  const [services, setServices] = useState([]);
  const [booking, setBooking] = useState(null);
  const [serviceSelections, setServiceSelections] = useState([]);
  const [customerName, setCustomerName] = useState(""); // NEW
  const [loading, setLoading] = useState(false);

  // Booking info
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await getBookingDetails(bookingId, token);
        setBooking(res.data.booking);
      } catch {
        toast.error("Không thể tải thông tin booking!");
      }
    };
    fetchBooking();
  }, [bookingId]);

  // Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await getServices(token);
        setServices(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error("Không thể tải dịch vụ!");
      }
    };
    fetchServices();
  }, []);

  const addServiceSelection = () => {
    setServiceSelections((prev) => [...prev, { serviceId: "", quantity: 1 }]);
  };
  const removeServiceSelection = (index) => {
    setServiceSelections((prev) => prev.filter((_, i) => i !== index));
  };
  const updateServiceSelection = (index, field, value) => {
    setServiceSelections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  // Create
  const handleCreateInvoice = async () => {
    const cleanedServices = serviceSelections
      .filter((s) => s.serviceId && Number(s.quantity) > 0)
      .map((s) => ({ serviceId: s.serviceId, quantity: Number(s.quantity) }));

    if (!bookingId && cleanedServices.length === 0) {
      toast.warning("Vui lòng thêm ít nhất 1 dịch vụ (dịch vụ lẻ)!");
      return;
    }
    if (!bookingId && !customerName.trim()) {
      toast.warning("Nhập tên khách cho hóa đơn dịch vụ lẻ!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const orderPayload = { bookingId: bookingId || null, services: cleanedServices };
      const resOrder = await createOrder(token, orderPayload);

      const orderId =
        resOrder?.data?.orderId ||
        resOrder?.data?.order?._id ||
        resOrder?.data?._id ||
        resOrder?.order?._id || null;
      if (!orderId) throw new Error("Tạo Order thất bại: thiếu orderId");

      await createInvoice(token, {
        orderId,
        customerName: bookingId ? undefined : customerName.trim(),
      });

      toast.success("Tạo hóa đơn thành công!");
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Không thể tạo hóa đơn!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center">
          {bookingId ? "Tạo hóa đơn cho Booking" : "Tạo hóa đơn dịch vụ lẻ"}
        </h2>

        {bookingId && booking && (
          <div className="mb-4 border rounded-lg p-3 bg-gray-50">
            <p><strong>Mã booking:</strong> {booking.bookingCode}</p>
            <p><strong>Khách hàng:</strong> {booking.userId?.fullName || booking.name}</p>
            <p><strong>Ngày đặt:</strong> {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString("vi-VN") : "-"}</p>
            <p><strong>Tổng tiền phòng:</strong> {(booking.finalPrice || 0).toLocaleString("vi-VN")}₫</p>
          </div>
        )}

        {!bookingId && (
          <div className="mb-3">
            <label className="block text-gray-600 mb-1">Tên khách hàng</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border rounded-lg p-2 w-full"
              placeholder="Nhập tên khách"
            />
          </div>
        )}

        {/* Dịch vụ */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-600">Dịch vụ sử dụng:</label>
            <button onClick={addServiceSelection} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
              + Thêm dịch vụ
            </button>
          </div>

          {serviceSelections.length > 0 ? (
            serviceSelections.map((s, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <select
                  value={s.serviceId}
                  onChange={(e) => updateServiceSelection(idx, "serviceId", e.target.value)}
                  className="border rounded-lg p-2 flex-1"
                >
                  <option value="">Chọn dịch vụ</option>
                  {services.map((sv) => (
                    <option key={sv._id} value={sv._id}>{sv.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={s.quantity}
                  onChange={(e) => updateServiceSelection(idx, "quantity", e.target.value)}
                  className="border rounded-lg p-2 w-20"
                />
                <button onClick={() => removeServiceSelection(idx)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
                  Xóa
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm italic">Chưa có dịch vụ nào được thêm</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg">Hủy</button>
          <button onClick={handleCreateInvoice} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            {loading ? "Đang tạo..." : "Tạo hóa đơn"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceFormModal;
