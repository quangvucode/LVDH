const Booking = require("../models/booking");
const Room = require("../models/room");

// Hàm chuẩn hóa ngày về YYYY-MM-DD
const formatDate = (d) => {
  if (!d) return null;
  try { return new Date(d).toISOString().slice(0, 10); } catch { return null; }
};

module.exports = async function resolveChatData(intent, entities) {
  console.log("[ChatResolver] Resolving intent:", intent, "| entities:", entities);

  if (!intent || !entities) return null;

  switch (intent) {
    // Kiểm tra slot còn trống theo phòng/ngày
    case "check_available_slot": {
      const { roomName, date } = entities;
      if (!roomName || !date) return null;

      const room = await Room.findOne({ roomName: new RegExp(`^${roomName}$`, "i") });
      if (!room) return { roomNotFound: true };

      const bookings = await Booking.find({
        roomId: room._id,
        bookingDate: new Date(formatDate(date)),
        cancelStatus: { $ne: "accepted" }
      });

      const ALL_SLOTS = ["09:30-12:30", "13:00-16:00", "16:30-19:30", "20:00-08:00"];
      const bookedSlots = bookings.flatMap(b => b.timeSlots);
      const availableSlots = ALL_SLOTS.filter(slot => !bookedSlots.includes(slot));

      return {
        roomName: room.roomName,
        date: formatDate(date),
        availableSlots
      };
    }

    // Danh sách phòng còn trống hôm nay/ngày chỉ định
    case "available_rooms_on_date": {
      const { date } = entities;
      if (!date || isNaN(new Date(date))) return null;
      const allRooms = await Room.find({ status: "available" });

      const roomIds = allRooms.map(r => r._id);
      const bookings = await Booking.find({
        roomId: { $in: roomIds },
        bookingDate: new Date(formatDate(date)),
        cancelStatus: { $ne: "accepted" }
      });

      const roomToBookedSlots = {};
      bookings.forEach(b => {
        const key = b.roomId.toString();
        if (!roomToBookedSlots[key]) roomToBookedSlots[key] = new Set();
        b.timeSlots.forEach(slot => roomToBookedSlots[key].add(slot));
      });

      const ALL_SLOTS = ["09:30-12:30", "13:00-16:00", "16:30-19:30", "20:00-08:00"];
      const roomsWithAvailability = allRooms.map(r => {
        const booked = roomToBookedSlots[r._id?.toString()] || new Set();
        const availableSlots = ALL_SLOTS.filter(s => !booked.has(s));
        return {
          roomName: r.roomName,
          availableSlots
        };
      }).filter(r => r.availableSlots.length > 0);

      return {
        date: formatDate(date),
        rooms: roomsWithAvailability
      };
    }

    // Chi tiết phòng
    case "ask_room_detail": {
      const { roomName } = entities;
      if (!roomName) return null;
      const room = await Room.findOne({ roomName: new RegExp(`^${roomName}$`, "i") });
      if (!room) return { roomNotFound: true };

      return {
        roomName: room.roomName,
        description: room.description,
        type: room.roomType,
        amenities: room.amenities,
        status: room.status
      };
    }

    // Giá phòng
    case "ask_room_price": {
      const { roomName } = entities;
      if (!roomName) return null;
      const room = await Room.findOne({ roomName: new RegExp(`^${roomName}$`, "i") });
      if (!room) return { roomNotFound: true };

      return {
        roomName: room.roomName,
        priceDay: room.priceDay,
        priceNight: room.priceNight
      };
    }
    case "booking_request": {
      const { roomName, date } = entities;
      
      if (!roomName) return { error: "Bạn vui lòng cho biết tên phòng muốn đặt." };

      // Tìm room theo tên
      const room = await Room.findOne({ roomName: new RegExp(`^${roomName}$`, "i") });
      if (!room) return { roomNotFound: true, originalName: roomName };

      // Trả về bookingLink theo _id
      const bookingLink = `http://localhost:3000/booking/${room._id}`;
      return { roomName: room.roomName, bookingLink, date };
    }

    case "lookup_booking": {
      const { phone, date } = entities;

      if (!phone) return { error: "Bạn vui lòng cung cấp số điện thoại đã dùng để đặt phòng." };
      if (!date) return { error: "Bạn vui lòng cung cấp ngày đặt phòng." };

      const bookings = await Booking.find({
        phone,
        bookingDate: new Date(formatDate(date))
      }).populate("roomId", "roomName");

      if (!bookings.length) return { notFound: true };

      // Chuẩn hóa dữ liệu trả cho GPT
      const results = bookings.map(b => ({
        bookingCode: b.bookingCode || "Không xác định",
        name: b.name,
        roomName: (b.roomId && b.roomId.roomName) ? b.roomId.roomName : "Không xác định",
        date: formatDate(b.bookingDate),
        timeSlots: Array.isArray(b.timeSlots) ? b.timeSlots : [],
        status: b.status || "unknown",
        isPaid: Boolean(b.isPaid)
      }));

      return { phone, date: formatDate(date), bookings: results };
    }



    case "ask_contact_info":
      return {
        contactLink: "http://localhost:3000/contact"
      };



    // Các intent không cần xử lý logic
    default:
      return null;
  }
}; 