const { chat } = require("../utils/openai");

async function fallbackResponse(message) {
  try {
    const response = await chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Bạn là trợ lý ảo lễ tân khách sạn, luôn chào hỏi thật thân thiện, tự nhiên, xưng hô linh hoạt (anh/chị, bạn, quý khách), tư vấn chuyên nghiệp, ưu tiên tạo cảm giác gần gũi.
Chỉ cần người dùng gửi câu chào, bạn nên chào lại thật tự nhiên, mời khách trình bày nhu cầu, KHÔNG trả lời khô khan kiểu "em giúp gì".
Nếu không rõ ý, hãy hỏi lại nhẹ nhàng. Đừng để khách thấy mình là bot.
`.trim(),
        },
        { role: "user", content: message },
      ],
      temperature: 0.85,
    });

    return response.choices?.[0]?.message?.content || "Xin chào, mình có thể hỗ trợ bạn đặt phòng, tư vấn giá, xem phòng trống... Bạn muốn tìm hiểu gì trước?";
  } catch (error) {
    console.error("GPT fallback error:", error);
    return "Xin lỗi, mình chưa thể hỗ trợ bạn ngay lúc này.";
  }
}

module.exports = fallbackResponse;
