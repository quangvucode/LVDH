function RoomRowAdmin({ room, onEdit, onDelete }) {
  const {
    _id,
    roomName,
    roomType,
    status,
    priceDay,
    priceNight,
    imageUrls = [],
  } = room;

  return (
    <tr className="border-b text-sm">
      <td className="px-4 py-2">
        <img
          src={`http://localhost:5000${imageUrls[0]}`}
          alt="Ảnh phòng"
          className="w-32 h-24 object-cover rounded-xl shadow"
        />
      </td>
      <td className="px-4 py-2 font-medium">{roomName}</td>
      <td className="px-4 py-2 capitalize">{roomType}</td>
      <td className="px-4 py-2 text-green-600">{priceDay.toLocaleString()}₫</td>
      <td className="px-4 py-2 text-yellow-600">{priceNight.toLocaleString()}₫</td>
      <td className="px-4 py-2">
        {status === "available" ? (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
            Sẵn sàng
          </span>
        ) : (
          <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
            Ngừng đặt
          </span>
        )}
      </td>
      <td className="px-4 py-2"> 
        <div className="flex gap-3"> 
          <button 
          onClick={() => onEdit(room)} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition" 
          > Sửa 
          </button> 
          <button 
          onClick={() => onDelete(_id)} 
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition" 
          > Xoá 
          </button> 
        </div> 
      </td>
    </tr>
  );
}

export default RoomRowAdmin;