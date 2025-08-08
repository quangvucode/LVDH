import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatbotWidget from "../components/ChatbotWidget"; //Chatbot

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
       <ChatbotWidget />
    </div>
  );
}

export default MainLayout;
