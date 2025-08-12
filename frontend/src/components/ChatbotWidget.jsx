import { useEffect, useState, useRef } from "react";
import { sendChatMessage } from "../services/serviceApi";
import { v4 as uuidv4 } from "uuid";
import { Bot, X } from "lucide-react";
import "../styles/ChatbotWidget.css";

function ChatbotWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [hideBot, setHideBot] = useState(false);
  const widgetRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Khởi tạo session ID và khôi phục đoạn chat
  useEffect(() => {
    const savedId = sessionStorage.getItem("chat_session_id");
    const savedMessages = sessionStorage.getItem("chat_messages");
    if (savedId) setSessionId(savedId);
    else {
      const newId = uuidv4();
      sessionStorage.setItem("chat_session_id", newId);
      setSessionId(newId);
    }
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);

  // Gửi tin nhắn chào khi mở lần đầu
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = {
        text: "Xin chào! Tôi là Trợ lý ảo AI. Bạn cần hỗ trợ gì hôm nay?",
        sender: "bot",
        botName: "Trợ lý",
      };
      setMessages([welcome]);
      sessionStorage.setItem("chat_messages", JSON.stringify([welcome]));
    }
  }, [isOpen, messages.length]);

  // Cập nhật lại tin nhắn vào sessionStorage mỗi khi thay đổi
  useEffect(() => {
    sessionStorage.setItem("chat_messages", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // Tự động ẩn khung nếu click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        widgetRef.current &&
        !widgetRef.current.contains(event.target) &&
        !event.target.closest(".chatbot-toggle")
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Nếu đụng footer thì chatbot sẽ tự đẩy lên
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setHideBot(entry.isIntersecting),
      { threshold: 0.1 }
    );
    const footerEl = document.querySelector("footer");
    if (footerEl) observer.observe(footerEl);
    return () => {
      if (footerEl) observer.unobserve(footerEl);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage = { text, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await sendChatMessage(text, sessionId);
      const botMessage = {
        text: res.data.reply,
        sender: "bot",
        botName: "Trợ lý",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage = {
        text: "Lỗi khi kết nối máy chủ.",
        sender: "bot",
        botName: "Trợ lý",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className={`chatbot-fixed-wrapper ${hideBot ? "chatbot-shift-up" : ""}`}>
      <div className="chatbot-toggle-wrapper">
        {!isOpen && <div className="chatbot-label-above">Trợ lý ảo AI</div>}
        <div className="chatbot-toggle" onClick={() => setIsOpen((prev) => !prev)}>
          <Bot size={28} strokeWidth={2.2} />
        </div>
      </div>

      {isOpen && (
        <div className="chatbot-container" ref={widgetRef}>
          <div className="chatbot-header">
            <span>Trợ lý ảo AI</span>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-message ${msg.sender}`}>
                <div className="chatbot-label">
                  {msg.sender === "user" ? "Bạn" : msg.botName || "Trợ lý"}:
                </div>
                <div dangerouslySetInnerHTML={{ __html: msg.text }}></div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatbotWidget;
