import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  getAllUsers,
  deleteUser,
} from "../../services/adminService";

import UserCardAdmin from "../../components/admin/UserCardAdmin";
import UserDetailModal from "../../components/admin/UserDetailModal";

function ManageUserView() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await getAllUsers(token);
      setUsers(res.data.users);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách người dùng");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.phone?.includes(q)
    );
  });

  const adminUsers = filteredUsers.filter((u) => u.role === "admin");
  const customerUsers = filteredUsers.filter((u) => u.role === "customer");

  const totalPages = Math.ceil(customerUsers.length / usersPerPage);
  const paginatedCustomers = customerUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: "Xác nhận xoá tài khoản?",
      text: `${user.name} (${user.email})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await deleteUser(user._id, token);
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        toast.success("Đã xoá người dùng");
      } catch (err) {
        console.error(err);
        toast.error("Xoá người dùng thất bại");
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Quản lý người dùng</h1> 

      {/* Tìm kiếm */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên, email, số điện thoại..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded-md w-80 shadow-sm"
        />
      </div>

      {/* Admin | Khách hàng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Tài khoản Admin</h2>
          <div className="flex flex-col gap-4">
            {adminUsers.map((user) => (
              <UserCardAdmin
                key={user._id}
                user={user}
                onViewDetail={setSelectedUser}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        {/* Khách hàng */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Tài khoản Khách hàng</h2>
          <div className="flex flex-col gap-4">
            {paginatedCustomers.map((user) => (
              <UserCardAdmin
                key={user._id}
                user={user}
                onViewDetail={setSelectedUser}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination chỉ cho khách hàng */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${
                  page === currentPage ? "bg-blue-600 text-white" : "bg-white"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal chi tiết */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUserUpdated={fetchUsers}
        />
      )}
    </div>
  );
}

export default ManageUserView;
