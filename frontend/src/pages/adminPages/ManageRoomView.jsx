import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import {
  getAllRoomsAdmin,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../../services/adminService";
import RoomFormModal from "../../components/admin/RoomFormModal";
import RoomRowAdmin from "../../components/admin/RoomRowAdmin";

function ManageRoomView() {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await getAllRoomsAdmin(token);
      setRooms(res.data.rooms);
    } catch (err) {
      toast.error("Không thể tải danh sách phòng");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleDelete = async (roomId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn xoá phòng này?",
      text: "Thao tác này không thể hoàn tác.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await deleteRoom(roomId, token);
        await fetchRooms();
        toast.success("Đã xoá phòng thành công");
      } catch (err) {
        toast.error("Xoá phòng thất bại");
      }
    }
  };

  const handleSubmit = async (formData) => {
    const token = localStorage.getItem("token");

    try {
      if (editingRoom) {
        await updateRoom(editingRoom._id, formData, token);
        toast.success("Cập nhật phòng thành công");
      } else {
        await createRoom(formData, token);
        toast.success("Thêm phòng thành công");
      }

      await fetchRooms();
      setShowModal(false);
      setEditingRoom(null);
    } catch (err) {
      toast.error("Lỗi khi lưu phòng");
      console.error("SUBMIT ROOM ERROR:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Quản lý phòng</h1>
        <button
          onClick={() => {
            setEditingRoom(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thêm phòng
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <th className="px-4 py-2">Ảnh</th>
              <th className="px-4 py-2">Tên phòng</th>
              <th className="px-4 py-2">Loại</th>
              <th className="px-4 py-2">Giá Ngày</th>
              <th className="px-4 py-2">Giá Đêm</th>
              <th className="px-4 py-2">Trạng thái</th>
              <th className="px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <RoomRowAdmin
                key={room._id}
                room={room}
                onEdit={(r) => {
                  setEditingRoom(r);
                  setShowModal(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <RoomFormModal
          onClose={() => {
            setShowModal(false);
            setEditingRoom(null);
          }}
          onSubmit={handleSubmit}
          initialData={editingRoom}
        />
      )}
    </div>
  );
}

export default ManageRoomView;
