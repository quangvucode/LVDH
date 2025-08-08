import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getRoomById, getBookedSlotsByRoom } from "../services/serviceApi";
import { CalendarIcon } from "lucide-react";
import Swal from 'sweetalert2';

function BookingView() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [searchDate, setSearchDate] = useState("");

  const timeSlotOrder = [
    "09:30-12:30",
    "13:00-16:00",
    "16:30-19:30",
    "20:00-08:00"
  ];

  const next10Days = useMemo(() => {
    return [...Array(10)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, []);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await getRoomById(roomId);
        setRoom(res.data);
      } catch (err) {
        console.error("Không lấy được phòng:", err);
      }
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    const fetchAllBooked = async () => {
      const all = {};
      for (let i = 0; i < next10Days.length; i++) {
        const date = next10Days[i];
        try {
          const res = await getBookedSlotsByRoom(roomId, date);
          all[date] = res.data.bookedSlots;
        } catch {
          all[date] = [];
        }
        await new Promise(res => setTimeout(res, 150));
      }
      setBookedSlots(all);
    };
    if (roomId) fetchAllBooked();
  }, [roomId, next10Days]);

  const toggleSlot = (date, slot) => {
    const key = `${date}_${slot}`;
    const firstDate = selectedSlots[0]?.split("_")[0];

    // Đang có slot ở ngày khác
    if (selectedSlots.length && firstDate !== date) {
      Swal.fire({
        title: 'Đã chuyển sang ngày khác',
        icon: 'info',
        confirmButtonText: 'OK'
      }).then(() => {
        setSelectedSlots([key]);
      });
      return;
    }

    // Cùng một ngày
    setSelectedSlots(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };



  const isFullDay = (day) => timeSlotOrder.every(slot => selectedSlots.includes(`${day}_${slot}`));

  const areConsecutive = (day) => {
    const picked = timeSlotOrder.map((slot, i) => selectedSlots.includes(`${day}_${slot}`) ? i : -1).filter(i => i !== -1);
    if (picked.length < 2) return false;
    for (let i = 1; i < picked.length; i++) {
      if (picked[i] !== picked[i - 1] + 1) return false;
    }
    return true;
  };

  const calculateTotal = () => {
  if (!room) return 0;

  let total = 0;
  const grouped = {};

  selectedSlots.forEach(key => {
    const [date, slot] = key.split("_");
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(slot);
    total += slot === "20:00-08:00" ? room.priceNight : room.priceDay;
  });

  let discount = 0;

  if (paymentMethod === "online") {
    discount += 10;
    Object.keys(grouped).forEach(day => {
      if (isFullDay(day)) {
        discount += 20;
      } else if (areConsecutive(day)) {
        discount += 10;
      }
    });
  }

  return Math.round(total * (1 - discount / 100));
};



  return (
    <MainLayout>
      <div className="bg-[#0f172a] text-white min-h-screen p-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {room?.imageUrls?.[2] && (
            <img
              src={`http://localhost:5000${encodeURI(room.imageUrls[2])}`}
              alt="room-thumbnail"
              className="w-full max-w-[1024px] h-auto object-cover rounded-xl shadow-lg"
            />
          )}
        </div>

        <div className="overflow-auto">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-pink-400 text-transparent bg-clip-text mb-4">
            {room?.roomName?.toUpperCase()}
          </h2>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Tìm ngày cụ thể:</label>
            <div className="relative w-fit">
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="pl-10 pr-4 py-1.5 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <CalendarIcon className="absolute left-2 top-2 w-4 h-4 text-gray-500" />
            </div>
          </div>

          <div className="overflow-auto max-h-[300px] max-w-full border rounded shadow-inner">
            <div className="min-w-[560px]">
              <table className="w-full table-fixed text-center text-sm">
                <thead className="sticky top-0 bg-[#1e293b]">
                  <tr>
                    <th className="p-2 text-left">Ngày</th>
                    {timeSlotOrder.map(slot => (
                      <th key={slot} className="p-2 whitespace-nowrap">{slot}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {next10Days.filter(date => !searchDate || date === searchDate).map(date => (
                    <tr key={date}>
                      <td className="p-2 font-medium whitespace-nowrap text-left">{date}</td>
                      {timeSlotOrder.map(slot => {
                        const key = `${date}_${slot}`;
                        const isBooked = bookedSlots[date]?.includes(slot);
                        const isSelected = selectedSlots.includes(key);
                        return (
                          <td key={key} className="p-1">
                            <button
                              title={slot}
                              disabled={isBooked}
                              onClick={() => toggleSlot(date, slot)}
                              className={`w-5 h-5 md:w-6 md:h-6 rounded-full transition
                                ${isBooked ? "bg-gray-600 cursor-not-allowed" :
                                isSelected ? "bg-red-500" : "bg-white hover:bg-gray-300"}`}
                            ></button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Hình thức thanh toán:</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Online (-10%)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="payment" value="offline" checked={paymentMethod === 'offline'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Trực tiếp
              </label>
            </div>
          </div>

          <div className="text-lg font-semibold mt-4">Tổng cộng: <span className="text-green-400">{calculateTotal().toLocaleString()}đ</span></div>

          <button
            onClick={() => navigate("/payment", { state: { room, selectedSlots, paymentMethod } })}
            disabled={selectedSlots.length === 0}
            className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded text-white font-bold disabled:opacity-50"
          >
            Tiếp tục đến thanh toán
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

export default BookingView;
