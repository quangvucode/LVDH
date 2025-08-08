import { useEffect, useState, useCallback, useMemo } from "react";
import { getAllInvoices, getAllBookings, deleteInvoice } from "../../services/adminService";
import InvoiceFormModal from "../../components/admin/InvoiceFormModal";
import InvoiceDetailModal from "../../components/admin/InvoiceDetailModal";
import { toast } from "react-toastify";

function ManageInvoiceView() {
  const [tab, setTab] = useState("invoices"); // "invoices" | "bookings"
  const [invoices, setInvoices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // search - client pagination 
  const [searchTerm, setSearchTerm] = useState("");
  const [invPage, setInvPage] = useState(1);
  const [bookPage, setBookPage] = useState(1);
  const PAGE_SIZE = 10;

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const token = localStorage.getItem("token");

  // ===== Fetchers =====
  const fetchInvoices = useCallback(async () => {
    try {
      const res = await getAllInvoices(token);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.items)
        ? res.data.items
        : [];
      // sort mới nhất trước
      setInvoices([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách hóa đơn!");
    }
  }, [token]);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await getAllBookings(token);
      const all = Array.isArray(res.data?.bookings)
        ? res.data.bookings
        : Array.isArray(res.data)
        ? res.data
        : [];
      // sort mới nhất trước
      setBookings([...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách booking!");
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    (tab === "invoices" ? fetchInvoices() : fetchBookings()).finally(() => setLoading(false));
  }, [tab, fetchInvoices, fetchBookings]);

  // ===== Helpers =====
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "-");

  // Tập các bookingId đã có trong hóa đơn (để ẩn ở tab "chưa lập" dù DB cũ chưa có invoiceId)
  const invoicedBookingIdSet = useMemo(() => {
    const set = new Set();
    for (const inv of invoices) {
      const id = inv?.orderId?.bookingId?._id;
      if (id) set.add(String(id));
    }
    return set;
  }, [invoices]);

  // Lọc bookings cần hiển thị: chưa có invoiceId và cũng không nằm trong invoicedBookingIdSet
  const rawUnbilled = useMemo(
    () => bookings.filter((b) => !b.invoiceId && !invoicedBookingIdSet.has(String(b._id))),
    [bookings, invoicedBookingIdSet]
  );

  // Search bookings
  const filteredBookings = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    if (!q) return rawUnbilled;
    return rawUnbilled.filter((b) => {
      const code = (b.bookingCode || "").toLowerCase();
      const name = (b.name || b.userId?.fullName || "").toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }, [rawUnbilled, searchTerm]);

  // Client pagination
  const invPages = Math.max(1, Math.ceil(invoices.length / PAGE_SIZE));
  const bookPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const invSlice = invoices.slice((invPage - 1) * PAGE_SIZE, invPage * PAGE_SIZE);
  const bookSlice = filteredBookings.slice((bookPage - 1) * PAGE_SIZE, bookPage * PAGE_SIZE);

  // Actions
  const handleViewDetail = (invoice) => {
    setSelectedInvoice({ invoice });
    setShowDetailModal(true);
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Xóa hóa đơn này?")) return;
    try {
      await deleteInvoice(token, id);
      toast.success("Đã xóa hóa đơn");
      fetchInvoices();
      fetchBookings();
    } catch (e) {
      console.error(e);
      toast.error("Xóa hóa đơn thất bại!");
    }
  };

  return (
    
    <div className="bg-white rounded-lg shadow p-6">
    <h1 className="text-2xl font-bold text-blue-700 mb-6">Quản lý hóa đơn</h1>
      {/* Tabs + actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setTab("invoices")}
            className={`px-4 py-2 rounded-lg ${tab === "invoices" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Hóa đơn
          </button>
          <button
            onClick={() => setTab("bookings")}
            className={`px-4 py-2 rounded-lg ${tab === "bookings" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Booking chưa lập hóa đơn
          </button>
        </div>

        {tab === "bookings" && (
          <input
            type="text"
            placeholder="Tìm mã booking hoặc tên khách..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setBookPage(1); }}
            className="border rounded-lg p-2 w-64"
          />
        )}

        {tab === "invoices" && (
          <button
            onClick={() => { setSelectedBookingId(null); setShowFormModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            + Tạo hóa đơn (dịch vụ lẻ)
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-center text-gray-500">Đang tải...</p>
      ) : tab === "invoices" ? (
        invSlice.length > 0 ? (
          <>
            <table className="w-full border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 text-left">Khách / Dịch vụ</th>
                  <th className="p-3 text-left">Booking Code</th>
                  <th className="p-3 text-right">Tổng tiền</th>
                  <th className="p-3 text-center">Ngày tạo</th>
                  <th className="p-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {invSlice.map((inv) => {
                  const booking = inv?.orderId?.bookingId;
                  const displayName = booking
                    ? (booking.userId?.fullName || booking.name || "—")
                    : (inv?.customerName || "Dịch vụ lẻ"); // dịch vụ lẻ: tên khách hoặc 'Dịch vụ lẻ'
                  const bookingCode = booking?.bookingCode || "Dịch vụ lẻ"; // yêu cầu của bạn
                  const total = typeof inv?.totalAmount === "number"
                    ? inv.totalAmount
                    : (Number(booking?.finalPrice) || 0) + (Number(inv?.orderId?.totalPrice) || 0);

                  return (
                    <tr key={inv._id} className="hover:bg-gray-50 border-b last:border-none">
                      <td className="p-3">{displayName}</td>
                      <td className="p-3">{bookingCode}</td>
                      <td className="p-3 text-right">{(total || 0).toLocaleString("vi-VN")}₫</td>
                      <td className="p-3 text-center">{fmtDate(inv.createdAt)}</td>
                      <td className="p-3 text-center flex gap-2 justify-center">
                        <button
                          onClick={() => handleViewDetail(inv)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* pager */}
            <div className="flex items-center justify-end gap-2 mt-4">
              <button disabled={invPage <= 1} onClick={() => setInvPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
              <span className="text-sm text-gray-600">Trang {invPage}/{invPages}</span>
              <button disabled={invPage >= invPages} onClick={() => setInvPage((p) => Math.min(invPages, p + 1))}
                className="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">Chưa có hóa đơn nào</p>
        )
      ) : bookSlice.length > 0 ? (
        <>
          <table className="w-full border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 text-left">Booking Code</th>
                <th className="p-3 text-left">Khách hàng</th>
                <th className="p-3 text-left">Ngày</th>
                <th className="p-3 text-center">Tổng tiền</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bookSlice.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 border-b last:border-none">
                  <td className="p-3">{b.bookingCode}</td>
                  <td className="p-3">{b.name || b.userId?.fullName}</td>
                  <td className="p-3">{fmtDate(b.bookingDate)}</td>
                  <td className="p-3 text-center">{(b.finalPrice || 0).toLocaleString("vi-VN")}₫</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => { setSelectedBookingId(b._id); setShowFormModal(true); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      Tạo hóa đơn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* pager */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button disabled={bookPage <= 1} onClick={() => setBookPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
            <span className="text-sm text-gray-600">Trang {bookPage}/{bookPages}</span>
            <button disabled={bookPage >= bookPages} onClick={() => setBookPage((p) => Math.min(bookPages, p + 1))}
              className="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">Không có booking nào cần lập hóa đơn</p>
      )}

      {/* Modals */}
      {showFormModal && (
        <InvoiceFormModal
          bookingId={selectedBookingId}
          onClose={() => setShowFormModal(false)}
          onSaved={() => { fetchInvoices(); fetchBookings(); }}
        />
      )}
      {showDetailModal && selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
}

export default ManageInvoiceView;
