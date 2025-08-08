function UserCardAdmin({ user, onViewDetail, onDelete }) {
  const statusClass = user.isActive
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";

  const roleClass =
    user.role === "admin"
      ? "text-blue-700 font-semibold"
      : "text-gray-800 font-medium";

  return (
    <div
      onClick={() => onViewDetail(user)}
      className="bg-white shadow rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-blue-600 font-semibold">
          {user.name || "Không xác định"}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
          {user.isActive ? "Đang hoạt động" : "Đã bị khoá"}
        </span>
      </div>

      <p className="text-sm text-gray-600">Email: {user.email}</p>
      <p className="text-sm text-gray-600">Số điện thoại: {user.phone || "Chưa có số"}</p>
      <p className="text-sm">
        Vai trò: <span className={roleClass}>{user.role === "admin" ? "Admin" : "Khách hàng"}</span>
      </p>
      <p className="text-sm text-gray-500 italic">
        Ngày tạo: {new Date(user.createdAt).toLocaleDateString()}
      </p>

      <div
        onClick={(e) => e.stopPropagation()} // ngăn click lan ra ngoài
        className="flex justify-end mt-3"
      >
        <button
          onClick={() => onDelete(user)}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Xoá
        </button>
      </div>
    </div>
  );
}

export default UserCardAdmin;
