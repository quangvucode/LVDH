const { chat } = require("../utils/openai");

async function gptReplyFromData({ intent, data }) {
  if (!intent || !data) return "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn.";

  // Xử lý trường hợp phòng không tồn tại hoặc không có data hợp lệ
  if (data.roomNotFound) return "Xin lỗi, tôi không tìm thấy phòng bạn hỏi. Bạn vui lòng kiểm tra lại tên phòng.";

  let info = "";

  switch (intent) {
    case "check_available_slot":
      info = `
      Phòng: ${data.roomName}
      Ngày: ${data.date}
      Các khung giờ còn trống: ${data.availableSlots.length > 0 ? data.availableSlots.join(", ") : "Không còn khung giờ nào trống"}
      `;
      break;

    case "available_rooms_on_date":
      info = data.rooms.map(r =>
        `Phòng ${r.roomName}: ${r.availableSlots.join(", ")}`
      ).join("\n") || "Không còn phòng nào trống.";
      info = `Ngày: ${data.date}\n${info}`;
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
        info = `Bạn có thể đặt phòng ${data.roomName} bằng cách nhấn vào link sau: ${data.bookingLink}
    Nếu bạn cần hỗ trợ thêm về thủ tục đặt phòng, hãy cho tôi biết nhé.`;
      } else {
        info = "Xin lỗi, tôi chưa thể lấy được link đặt phòng. Bạn kiểm tra lại tên phòng hoặc liên hệ hỗ trợ.";
      }
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
