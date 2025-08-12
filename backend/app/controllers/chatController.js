const detectIntent = require("../chatbot/detectIntent");
const resolveChatData = require("../chatbot/chatDataResolver");
const gptReplyFromData = require("../chatbot/gptReplyFromData");
const fallbackResponse = require("../chatbot/fallbackResponse");
const { getContext, setContext } = require("../chatbot/contextStore");

exports.handleChat = async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({ reply: "Thiếu nội dung hoặc session." });
  }

  const intentData = detectIntent(message);
  let { intent, entities = {} } = intentData;

  console.log("[Chatbot] Message:", message);
  console.log("[Chatbot] Intent detected:", intent);
  if (entities) console.log("[Chatbot] Entities:", entities);

  try {
    // ==== Bổ sung context nếu thiếu ====
    const context = getContext(sessionId);

    if (!entities.roomName && context.roomName) {
      entities.roomName = context.roomName;
      console.log("→ Dùng lại roomName từ context:", context.roomName);
    }

    if (!entities.date && context.date) {
      entities.date = context.date;
      console.log("→ Dùng lại date từ context:", context.date);
    }

    // ==== Các intent có xử lý logic ====
    const logicIntents = [
      "check_available_slot",
      "available_rooms_on_date",
      "ask_room_detail",
      "ask_room_price",
      "booking_request",
      "ask_contact_info",
      "lookup_booking",
    ];

    if (logicIntents.includes(intent)) {
      const data = await resolveChatData(intent, entities);
      console.log("[Chatbot] Data từ resolver:", data);

      // Nếu có data.roomName hoặc entities.roomName thì lưu lại
      const updatedContext = {
        roomName: data?.roomName || entities.roomName || context.roomName,
        date: entities.date || context.date,
        lastIntent: intent
      };
      setContext(sessionId, updatedContext);
      console.log("→ Context cập nhật:", updatedContext);

      const reply = await gptReplyFromData({ intent, data });
      return res.status(200).json({ reply });
    }

    // ==== Nếu không thuộc logic GPT fallback ====
    const reply = await fallbackResponse(message);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("[ChatController] Lỗi xử lý chatbot:", error);
    return res.status(500).json({ reply: "Xin lỗi, hệ thống đang gặp lỗi. Vui lòng thử lại sau." });
  }
};
