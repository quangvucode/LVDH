const { chat } = require("../utils/openai");

function formatDisplayDate(d) {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

async function gptReplyFromData({ intent, data }) {
  if (!intent || !data) return "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn.";

  // Xử lý trường hợp phòng không tồn tại hoặc không có data hợp lệ
  if (data.roomNotFound) { return `Xin lỗi, tôi không tìm thấy phòng "${data.originalName}". Bạn vui lòng kiểm tra lại tên phòng hoặc chọn phòng khác.`;}


  let info = "";

  switch (intent) {
    case "check_available_slot":
      info = ` thông báo cho khách
      Phòng: ${data.roomName}
      Ngày: ${data.date}
      Các khung giờ còn trống: ${data.availableSlots.length > 0 ? data.availableSlots.join(", ") : "Không còn khung giờ nào trống"}
      nếu không còn giờ trống thái độ vui vẻ kêu khách chọn ngày khác phòng khác
      `;
      break;

    case "available_rooms_on_date":
    const formattedDate = data.date ? formatDisplayDate(data.date) : "không xác định";
    const roomInfo = data.rooms.map(r =>
      `Phòng ${r.roomName}: ${r.availableSlots.join(", ")}`
    ).join("\n") || "Không còn phòng nào trống.";
    info = `Ngày: ${formattedDate}\n${roomInfo}`;
    break;


    case "ask_room_detail":
      info = `
      Phòng: ${data.roomName}
      Loại: ${data.type}
      Tiện ích: ${data.amenities.join(", ") || "Không có"}
      Trạng thái: ${data.status === "available" ? "Đang mở đặt" : "Tạm ngưng"}
      Mô tả: ${data.description}
      `;
      break;

    case "ask_room_price":
      info = `
      Phòng: ${data.roomName}
      Giá ban ngày: ${data.priceDay.toLocaleString()} VND cho một slot
      Giá qua đêm: ${data.priceNight.toLocaleString()} VND
      `;
      break;
    
    case "booking_request":
      if (data.bookingLink) {
        info = `
        Khách muốn đặt phòng tên ${data.roomName}${data.date ? ` vào ngày ${formatDisplayDate(data.date)}` : ""}.
        Hãy viết câu trả lời thân thiện, mời khách đặt phòng, và CHÈN LINK HTML dưới dạng:
        <a href="${data.bookingLink}" target="_blank">Đặt phòng tại đây</a>
        `.trim();
      } else {
        info = `
        Hỏi lại khách hàng tên phòng mà khách hàng muốn đặt 
        `.trim();
      }
      break;

    case "ask_contact_info":
        info = `
        Khách hỏi thông tin liên hệ hoặc địa chỉ khách sạn.
        Hãy chèn HTML link dạng: <a href="${data.contactLink}" target="_blank">${data.contactLink}</a>
        Mời khách truy cập link và không trả lời gì thêm.
        `.trim();
        break;

    case "lookup_booking":
      if (data.error) {
          return "Bạn vui lòng cung cấp số điện thoại và ngày đặt phòng để tôi tra cứu.";
        }
        if (data.notFound) {
          return "Không tìm thấy đơn đặt phòng nào khớp với thông tin bạn cung cấp.";
        }

        const bookingList = data.bookings.map(b =>
          `Tên khách hàng: ${b.name}
          Mã đơn: ${b.bookingCode}
          Tên phòng: ${b.roomName}
          Ngày: ${formatDisplayDate(b.date)}
          Khung giờ: ${b.timeSlots.join(", ")}
          Thanh toán: ${b.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}`
        ).join("\n\n");

        info = `
        Kết quả tra cứu đặt phòng:
        ${bookingList}
        `.trim();
      break;

        

    default:
      return "Xin lỗi, hệ thống chưa hỗ trợ câu hỏi này.";
    }

  // Log dữ liệu gửi GPT
  console.log("[GPTPrompt]", { intent, data, info });

  try {
    const response = await chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Bạn là nhân viên lễ tân khách sạn, thân thiện, lịch sự, và trả lời ngắn gọn dễ hiểu, chuyên nghiệp. Dưới đây là dữ liệu phòng hoặc yêu cầu của khách. Hãy dùng data để trả lời tự nhiên và đúng nội dung, có thể giải thích, tư vấn hoặc chủ động đề xuất theo nghiệp vụ khách sạn.`
        },
        { role: "user", content: info.trim() }
      ],
      temperature: 0.7,
    });

    return response.choices?.[0]?.message?.content || "Xin lỗi, tôi chưa thể trả lời câu hỏi này.";
  } catch (error) {
    console.error("[GPTReplyError]", error);
    return "Có lỗi xảy ra khi tạo phản hồi từ hệ thống. Vui lòng thử lại sau.";
  }
}

module.exports = gptReplyFromData;
