import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomById, getAllRooms } from "../services/serviceApi";
import MainLayout from "../layouts/MainLayout";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { Sun, Moon } from "lucide-react";

function RoomDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [otherRooms, setOtherRooms] = useState([]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await getRoomById(id);
        setRoom(res.data);
      } catch {
        alert("Không tìm thấy phòng");
        navigate("/");
      }
    };

    const fetchAll = async () => {
      try {
        const res = await getAllRooms();
        setOtherRooms(res.data.filter((r) => r._id !== id));
      } catch {}
    };

    fetchRoom();
    fetchAll();
  }, [id, navigate]);

  if (!room) return null;

  return (
    <MainLayout>
      <div className="bg-[#0f172a] text-white min-h-screen px-4 md:px-10 py-6 max-w-screen-2xl mx-auto">
        {/* IMAGE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-xl overflow-hidden mb-6">
          <img
            src={`http://localhost:5000${room.imageUrls[0]}`}
            alt="main"
            className="col-span-2 w-full h-[400px] object-cover"
          />
          <div className="grid grid-cols-2 gap-2">
            {room.imageUrls.slice(1).map((img, i) => (
              <img
                key={i}
                src={`http://localhost:5000${img}`}
                alt={`thumb-${i}`}
                className="w-full h-[196px] object-cover"
              />
            ))}
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-pink-400 text-transparent bg-clip-text mb-4">
              {room.roomName}
            </h2>
            <p className="mb-6 text-gray-200 leading-relaxed">
              {room.description ||
                "Không gian sang trọng, tinh tế kết hợp ánh sáng ấm áp cùng tiện nghi cao cấp, đem lại trải nghiệm tuyệt vời."}
            </p>

            <h3 className="text-xl font-bold mb-2">Tiện ích trong phòng:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300 mb-6">
              {room.amenities.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>

            <h3 className="text-xl font-bold mb-2">Hỗ trợ 24/7 với bất kỳ yêu cầu nào:</h3>
            <p className="text-gray-300">
              Để có trải nghiệm tốt nhất, vui lòng đọc kỹ nội quy trước khi đặt phòng và cung cấp địa chỉ email chính xác.
              Chúng mình sẽ gửi thông tin check-in qua email mà bạn cung cấp. Mọi thắc mắc hoặc yêu cầu hỗ trợ, bạn vui lòng
              liên hệ hotline để được hỗ trợ ngay lập tức.
            </p>
          </div>

          {/* ROOM INFO CARD */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-fit">
            <h3 className="text-xl font-bold mb-4">{room.roomName}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {room.amenities.map((a, i) => (
                <span
                  key={i}
                  className="bg-purple-200 text-purple-800 px-2 py-1 text-xs rounded-full"
                >
                  {a}
                </span>
              ))}
            </div>
            <div className="mb-4 space-y-1">
              <p className="text-red-400 font-semibold flex items-center gap-1">
                <Sun className="w-4 h-4 text-yellow-400" />
                {room.priceDay.toLocaleString()}đ - <span>ngày 3h</span>
              </p>
              <p className="text-blue-400 font-semibold flex items-center gap-1">
                <Moon className="w-4 h-4 text-blue-300" />
                {room.priceNight.toLocaleString()}đ - <span>đêm 12h</span>
              </p>
            </div>
            <button 
            onClick={() => navigate(`/booking/${room._id}`)}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold">Đặt phòng
            </button>
          </div>
        </div>

        {/* SUGGESTED ROOMS */}
        <h3 className="text-2xl font-bold text-center text-gradient mb-4">
          XEM THỬ CÁC PHÒNG KHÁC
        </h3>
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          loop
          autoplay={{ delay: 4000 }}
          modules={[Autoplay]}
        >
          {otherRooms.map((r) => (
            <SwiperSlide key={r._id}>
              <div
                onClick={() => navigate(`/room/${r._id}`)}
                className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition"
              >
                <img
                  src={`http://localhost:5000${r.imageUrls[0]}`}
                  className="w-full h-48 object-cover"
                  alt={r.roomName}
                />
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2 text-white">
                    {r.roomName}
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {r.amenities.map((a, i) => (
                      <span
                        key={i}
                        className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                  <p className="text-yellow-400 flex items-center gap-1">
                    <Sun className="w-4 h-4" />
                    {r.priceDay.toLocaleString()}đ
                  </p>
                  <p className="text-blue-400 flex items-center gap-1">
                    <Moon className="w-4 h-4" />
                    {r.priceNight.toLocaleString()}đ
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </MainLayout>
  );
}

export default RoomDetailView;
