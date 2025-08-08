import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { confirmCancelBooking, updateBookingStatus } from "../../services/adminService";

function BookingRowAdmin({ booking, onChange }) {
  const {
    _id,
    name,
    email,
    phone,
    roomName,
    bookingDate,
    timeSlots,
    finalPrice,
    isPaid,
    cancelStatus,
    paymentMethod,
    userId,
    status,
  } = booking;

  const handleAction = async (action) => {
    const result = await Swal.fire({
      title: action === "accept" ? "Chấp nhận yêu cầu hủy?" : "Từ chối yêu cầu hủy?",
      text:
        action === "accept"
          ? "Bạn có chắc chắn muốn chấp nhận yêu cầu hủy đơn đặt này?"
          : "Bạn có chắc chắn muốn từ chối yêu cầu hủy đơn đặt này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: action === "accept" ? "Chấp nhận" : "Từ chối",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await confirmCancelBooking(_id, action, token);
        toast.success(`Đã ${action === "accept" ? "chấp nhận" : "từ chối"} yêu cầu hủy`);
        onChange((prev) =>
          prev.map((b) =>
            b._id === _id
              ? { ...b, cancelStatus: action === "accept" ? "accepted" : "rejected" }
              : b
          )
        );
      } catch (err) {
        console.error("Lỗi:", err);
        toast.error(`${action === "accept" ? "Chấp nhận" : "Từ chối"} thất bại`);
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await updateBookingStatus(_id, newStatus, token);
      toast.success(`Đã cập nhật trạng thái: ${newStatus === "confirmed" ? "Đã xác nhận" : "Hoàn tất"}`);
      onChange((prev) =>
        prev.map((b) => (b._id === _id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const isCancelPending = cancelStatus === "pending";

  return (
    <tr className="border-b text-sm hover:bg-gray-50 transition">
      <td className="px-4 py-2">
        <div className="font-semibold text-blue-800">{name || "Vãng lai"}</div>
        <div className="text-xs text-gray-600">{phone}</div>
        {email && <div className="text-xs text-gray-600">{email}</div>}
        <div className="text-xs text-gray-500 italic">
          {userId ? "Tài khoản" : "Khách vãng lai"}
        </div>
      </td>

      <td className="px-4 py-2">{roomName}</td>

      <td className="px-4 py-2">
        {new Date(bookingDate).toLocaleDateString("vi-VN")}
      </td>

      <td className="px-4 py-2">{timeSlots.join(", ")}</td>

      <td className="px-4 py-2 text-right font-medium text-blue-900">
        {(finalPrice ?? 0).toLocaleString()}₫
      </td>

      <td className="px-4 py-2">
        {isPaid ? (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full inline-block">
            Đã thanh toán
          </span>
        ) : (
          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full inline-block">
            Chưa thanh toán
          </span>
        )}
        <div className="text-xs text-gray-500 mt-1 italic">
          ({paymentMethod === "online" ? "Online" : "Trực tiếp"})
        </div>
      </td>

      <td className="px-4 py-2">
        {isCancelPending ? (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full inline-block">
            Yêu cầu huỷ
          </span>
        ) : cancelStatus === "accepted" ? (
          <span className="text-green-700 text-xs">Đã hủy</span>
        ) : cancelStatus === "rejected" ? (
          <span className="text-gray-500 text-xs italic">Từ chối hủy</span>
        ) : (
          <span className="text-sm text-gray-500 italic">Không có</span>
        )}
      </td>

      <td className="px-4 py-2 space-y-1">
        {/* Xử lý hủy */}
        {isCancelPending && (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction("accept")}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition"
            >
              Chấp nhận
            </button>
            <button
              onClick={() => handleAction("reject")}
              className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded transition"
            >
              Từ chối
            </button>
          </div>
        )}

        {/* Cập nhật trạng thái check-in */}
        {!isCancelPending && cancelStatus !== "accepted" && status !== "completed" && (
          <>
            {status === "pending" && (
              <button
                onClick={() => handleStatusChange("confirmed")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition w-full"
              >
                Xác nhận Check-in
              </button>
            )}

            {status === "confirmed" && (
              <button
                onClick={() => handleStatusChange("completed")}
                className="bg-black hover:bg-gray-900 text-white text-sm px-3 py-1 rounded transition w-full"
              >
                Hoàn tất
              </button>
            )}
          </>
        )}
      </td>
    </tr>
  );
}

export default BookingRowAdmin;
