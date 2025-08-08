import { useState } from "react";
import { toast } from "react-toastify";
import { updateUserName, updateUserStatus } from "../../services/adminService";

function UserDetailModal({ user, onClose, onUserUpdated }) {
  const [name, setName] = useState(user.name || "");
  const [editingName, setEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(user.isActive);
  const [role, setRole] = useState(user.role);

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Cập nhật tên nếu đang chỉnh sửa
      if (editingName && name.trim() && name.trim() !== user.name) {
        await updateUserName(user._id, { name: name.trim() }, token);
        toast.success("Cập nhật tên thành công");
      }

      // Cập nhật trạng thái hoặc role nếu có thay đổi
      if (isActive !== user.isActive || role !== user.role) {
        await updateUserStatus(user._id, { isActive, role }, token);
        toast.success("Cập nhật trạng thái / vai trò thành công");
      }

      onUserUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelName = () => {
    setName(user.name || "");
    setEditingName(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Chi tiết người dùng</h2>

        {/* Họ tên */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">Họ tên</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              className={`border px-3 py-2 rounded w-full ${editingName ? "" : "bg-gray-100"}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editingName || loading}
            />
            {!editingName ? (
              <button
                onClick={() => setEditingName(true)}
                className="text-sm px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancelName}
                  className="text-sm px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Huỷ
                </button>
              </>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input
            type="text"
            className="border w-full px-3 py-2 rounded bg-gray-100"
            value={user.email}
            disabled
          />
        </div>

        {/* Số điện thoại */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">Số điện thoại</label>
          <input
            type="text"
            className="border w-full px-3 py-2 rounded bg-gray-100"
            value={user.phone || ""}
            disabled
          />
        </div>

        {/* Trạng thái */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">Trạng thái</label>
          <select
            value={isActive ? "true" : "false"}
            onChange={(e) => setIsActive(e.target.value === "true")}
            className="border px-3 py-2 rounded w-full"
            disabled={loading}
          >
            <option value="true">Đang hoạt động</option>
            <option value="false">Đã bị khoá</option>
          </select>
        </div>

        {/* Vai trò */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">Vai trò</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            disabled={loading}
          >
            <option value="admin">Admin</option>
            <option value="customer">Khách hàng</option>
          </select>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end mt-4 gap-3">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
            disabled={loading}
          >
            Đóng
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSaveAll}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDetailModal;
