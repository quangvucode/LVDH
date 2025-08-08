import { useEffect, useState } from "react";
import { getServices, deleteService } from "../../services/adminService";
import ServiceFormModal from "../../components/admin/ServiceFormModal";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function ManageServiceView() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Lấy danh sách dịch vụ
  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await getServices(token);
      setServices(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dịch vụ:", error);
      toast.error("Không thể tải danh sách dịch vụ!");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAdd = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: "Xác nhận xóa?",
        text: "Bạn có chắc chắn muốn xóa dịch vụ này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
        try {
        const token = localStorage.getItem("token");
        await deleteService(token, id);

        Swal.fire({
            icon: "success",
            title: "Đã xóa!",
            text: "Dịch vụ đã được xóa thành công.",
            timer: 2000,
            showConfirmButton: false,
        });

        fetchServices();
        } catch (error) {
        console.error("Lỗi khi xóa dịch vụ:", error);
        Swal.fire({
            icon: "error",
            title: "Lỗi!",
            text: "Không thể xóa dịch vụ.",
        });
        }
    }
};

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Quản lý dịch vụ</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg shadow-sm"
        >
          + Thêm dịch vụ
        </button>
      </div>

      <table className="w-full border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-3 text-left">Tên dịch vụ</th>
            <th className="p-3 text-right">Giá</th>
            <th className="p-3 text-center">Trạng thái</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {services.length > 0 ? (
            services.map((s) => (
              <tr
                key={s._id}
                className="hover:bg-gray-50 transition border-b last:border-none"
              >
                <td className="p-3">{s.name}</td>
                <td className="p-3 text-right">
                  {s.price.toLocaleString("vi-VN")}₫
                </td>
                <td className="p-3 text-center">
                  {s.status === "active" ? (
                    <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-600">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-500">
                      Ngưng
                    </span>
                  )}
                </td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="bg-yellow-400 hover:bg-yellow-500 transition text-white px-3 py-1 rounded"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="bg-red-600 hover:bg-red-700 transition text-white px-3 py-1 rounded"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                className="p-6 text-center text-gray-500 italic"
              >
                Chưa có dịch vụ nào
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <ServiceFormModal
          initialData={editingService}
          onClose={() => setShowModal(false)}
          onSaved={fetchServices}
        />
      )}
    </div>
  );
}

export default ManageServiceView;
