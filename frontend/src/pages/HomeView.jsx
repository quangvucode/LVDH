import { useState, useEffect } from "react";
import { filterRooms, getAllRooms } from "../services/serviceApi";
import MainLayout from "../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import "../styles/swiper-custom.css";


function HomeView() {
  const [roomName, setRoomName] = useState("");
  const [utilities, setUtilities] = useState([]);
  const [results, setResults] = useState([]);
  const [allRooms, setAllRooms] = useState([]);

  const navigate = useNavigate();

  const allUtilities = ["Netflix", "Máy chiếu", "Máy nước nóng", "Bồn tắm", "Ban công rộng", "Máy lạnh"];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getAllRooms();
        setAllRooms(res.data || []);
      } catch (err) {
        alert("Không thể tải danh sách phòng");
      }
    };
    fetchRooms();
  }, []);

  const toggleUtility = (ut) => {
    setUtilities((prev) =>
      prev.includes(ut) ? prev.filter((u) => u !== ut) : [...prev, ut]
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await filterRooms({
        name: roomName.trim(),
        amenities: utilities
      });
      setResults(res.data.rooms || []);
    } catch (err) {
      alert("Lỗi tìm kiếm phòng");
    }
  };

  const RoomCard = ({ room }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/room/${room._id}`)}
      className="cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl hover:scale-[1.02] transition duration-300"
    >
      <img
        src={`http://localhost:5000${room.imageUrls?.[1] || room.imageUrls?.[0] || ""}`}
        alt={room.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-800">{room.roomName}</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {room.amenities?.map((ut, i) => (
            <span
              key={i}
              className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
            >
              {ut}
            </span>
          ))}
        </div>
        <div className="mb-2 flex items-center gap-3">
          <span className="text-yellow-600 font-semibold flex items-center gap-1">
            <Sun className="w-4 h-4" /> {room.priceDay?.toLocaleString()}đ
          </span>
          <span className="text-blue-600 font-semibold flex items-center gap-1">
            <Moon className="w-4 h-4" /> {room.priceNight?.toLocaleString()}đ
          </span>
        </div>
        <div className="text-right">
          <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-1 rounded">
            Xem chi tiết
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <MainLayout>
      <div className="p-6 bg-gradient-to-br from-purple-100 via-white to-indigo-100 min-h-screen">
        <h1 className="text-4xl font-extrabold text-center text-purple-800 mb-10 drop-shadow">
          Tìm phòng theo nhu cầu
        </h1>

        <form className="flex flex-col items-center mb-12" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Nhập tên phòng..."
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full max-w-md p-3 border border-gray-300 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {allUtilities.map((ut) => (
              <label key={ut} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={utilities.includes(ut)}
                  onChange={() => toggleUtility(ut)}
                  className="accent-purple-600"
                />
                <span>{ut}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:brightness-110 shadow-md"
          >
            Tìm kiếm
          </button>
        </form>

        {/* PHẦN SLIDER PHÒNG NỔI BẬT */}
        <h2 className="text-2xl text-purple-800 font-bold mb-6 text-center">
          Các phòng nổi bật
        </h2>

        <div className="flex justify-center mb-16">
          <div className="w-full max-w-[1024px] rounded-2xl overflow-hidden shadow-xl">
            <Swiper
              slidesPerView={1}
              spaceBetween={30}
              pagination={{ clickable: true }}
              navigation
              modules={[Pagination, Navigation]}
              className="w-full"
            >
              {allRooms.map((room) => (
                <SwiperSlide key={room._id}>
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    src={`http://localhost:5000${room.imageUrls?.[0] || ""}`}
                    alt={room.name}
                    className="w-full h-[576px] object-cover rounded-2xl cursor-pointer"
                    onClick={() => navigate(`/room/${room._id}`)}
                  />
                </SwiperSlide>
                
              ))}
            </Swiper>
          </div>
        </div>

        {/* DANH SÁCH KẾT QUẢ HOẶC TẤT CẢ PHÒNG */}
        <h2 className="text-2xl text-purple-800 font-bold mb-6 text-center">
          {results.length > 0 ? "Kết quả tìm kiếm" : "Tất cả các phòng"}
        </h2>

        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {(results.length > 0 ? results : allRooms).map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

export default HomeView;
