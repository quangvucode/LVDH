import { useEffect, useRef, useState } from "react";
import { getInvoiceById } from "../../services/adminService";
import { toast } from "react-toastify";

function InvoiceDetailModal({ invoice, onClose }) {
  const printRef = useRef();
  const [detailData, setDetailData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getInvoiceById(token, invoice.invoice._id);
        setDetailData(res.data); // { invoice, orderDetails }
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải chi tiết hóa đơn!");
      }
    };
    fetchDetails();
  }, [invoice, token]);

  const handlePrint = () => {
    try {
      const html = printRef.current.innerHTML;
      const win = window.open("", "_blank");
      win.document.write(`
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Hóa đơn</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; font-size: 14px; }
              h1 { text-align: center; margin: 0 0 16px; font-size: 20px; }
              .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 12px; }
              .meta div { font-size: 13px; }
              table { width: 100%; border-collapse: collapse; margin-top: 12px; }
              th, td { border: 1px solid #ddd; padding: 8px; }
              th { background: #f3f4f6; text-align: left; }
              tfoot td { font-weight: bold; }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `);
      win.document.close();
      win.print();
    } catch {
      toast.error("Không thể in hóa đơn!");
    }
  };

  if (!detailData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg w-[760px] max-h-[85vh] overflow-y-auto p-6 text-center">
          <p className="text-gray-500">Đang tải chi tiết hóa đơn...</p>
        </div>
      </div>
    );
  }

  const { invoice: inv, orderDetails } = detailData;
  const booking = inv.orderId?.bookingId;

  // Build rows
  const rows = [];
  if (booking) {
    const roomPrice = Number(booking.finalPrice) || 0;
    rows.push({
      key: "room",
      name: `Tiền phòng${booking.bookingCode ? ` (${booking.bookingCode})` : ""}`,
      quantity: 1,
      price: roomPrice,
      total: roomPrice,
    });
  }

  for (const d of orderDetails) {
    const price = Number(d.price) || 0;
    const qty = Number(d.quantity) || 0;
    rows.push({
      key: d._id,
      name: d.serviceId?.name || "—",
      quantity: qty,
      price,
      total: price * qty,
    });
  }

  const subTotal = rows.reduce((s, r) => s + r.total, 0);
  const discount = Number(inv.discount) || 0;
  const grandTotal = Math.max(0, subTotal - discount);
  const paidAmount = Number(inv.paidAmount) || 0;
  const remainingAmount = Number(inv.remainingAmount) || 0;

  const customerName = booking
    ? (booking.userId?.fullName || booking.name || "—")
    : (inv.customerName || "—");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[760px] max-h-[85vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-semibold text-blue-700 text-center mb-4">Chi tiết hóa đơn</h2>

        <div ref={printRef}>
          <h1>HÓA ĐƠN</h1>
          <div className="meta">
            <div><strong>Mã hóa đơn:</strong> {inv._id}</div>
            <div><strong>Ngày tạo:</strong> {new Date(inv.createdAt).toLocaleString("vi-VN")}</div>
            <div><strong>Khách hàng:</strong> {customerName}</div>
            <div><strong>Booking:</strong> {booking?.bookingCode || "Dịch vụ lẻ"}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Tên hạng mục</th>
                <th style={{ width: 90 }}>Số lượng</th>
                <th style={{ width: 140 }}>Đơn giá</th>
                <th style={{ width: 160 }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td>{r.name}</td>
                  <td className="text-center">{r.quantity}</td>
                  <td className="text-right">{r.price.toLocaleString("vi-VN")}₫</td>
                  <td className="text-right">{r.total.toLocaleString("vi-VN")}₫</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {discount > 0 && (
                <tr>
                  <td colSpan={3}>Giảm giá</td>
                  <td className="text-right">- {discount.toLocaleString("vi-VN")}₫</td>
                </tr>
              )}
              <tr>
                <td colSpan={3}>Tổng cộng</td>
                <td className="text-right">{grandTotal.toLocaleString("vi-VN")}₫</td>
              </tr>
              <tr>
                <td colSpan={3}>Đã thanh toán</td>
                <td className="text-right">- {paidAmount.toLocaleString("vi-VN")}₫</td>
              </tr>
              <tr>
                <td colSpan={3}>
                  {remainingAmount > 0 ? "Còn lại phải thanh toán" : "Đã thanh toán đủ"}
                </td>
                <td className="text-right">
                  {(remainingAmount > 0 ? remainingAmount : 0).toLocaleString("vi-VN")}₫
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg">
            Đóng
          </button>
          <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            In hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetailModal;
