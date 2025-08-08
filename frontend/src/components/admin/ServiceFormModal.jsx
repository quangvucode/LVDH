import { useState } from "react";
import { createService, updateService } from "../../services/adminService";
import { toast } from "react-toastify";

function ServiceFormModal({ initialData, onClose, onSaved }) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price || 0);
  const [status, setStatus] = useState(initialData?.status || "active");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || price <= 0) {
      toast.warning("Vui lòng nhập tên dịch vụ và giá hợp lệ!");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (initialData) {
        await updateService(token, initialData._id, {
          name,
          description,
          price,
          status,
        });
        toast.success("Cập nhật dịch vụ thành công!");
      } else {
        await createService(token, { name, description, price, status });
        toast.success("Thêm dịch vụ thành công!");
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu dịch vụ:", error);
      toast.error("Không thể lưu dịch vụ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[420px]">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center">
          {initialData ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-600">Tên dịch vụ:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Mô tả:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-300"
              rows={2}
            ></textarea>
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Giá (₫):</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-300"
              min={0}
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Trạng thái:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-300"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngưng</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 transition text-white px-4 py-2 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServiceFormModal;
