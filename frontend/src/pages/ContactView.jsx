import MainLayout from "../layouts/MainLayout";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

function ContactView() {
  return (
    <MainLayout>
      <div className="p-6 bg-gradient-to-br from-white via-purple-50 to-indigo-50 min-h-screen">
        <h1 className="text-4xl font-bold text-center text-purple-800 mb-12 drop-shadow">
          Liên hệ với chúng tôi
        </h1>

        {/* THÔNG TIN LIÊN HỆ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 max-w-6xl mx-auto">
          <div className="space-y-6 text-gray-800">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold">Địa chỉ:</h3>
                <p>Khu II, Đ. 3 Tháng 2, Xuân Khánh, Ninh Kiều, Cần Thơ</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold">Số điện thoại:</h3>
                <p>0397 393 983</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold">Email:</h3>
                <p>hqvu168@gmail.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold">Giờ hoạt động:</h3>
                <p>24/7 tất cả các ngày trong tuần</p>
              </div>
            </div>
          </div>

          {/* BẢN ĐỒ */}
          <div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.841454377085!2d105.76804037450881!3d10.029938972519918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0895a51d60719%3A0x9d76b0035f6d53d0!2zxJDhuqFpIGjhu41jIEPhuqduIFRoxqE!5e0!3m2!1svi!2s!4v1752923575390!5m2!1svi!2s"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-2xl shadow-lg"
              title="Vị trí khách sạn"
            ></iframe>
          </div>
        </div>

        {/* MẠNG XÃ HỘI */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">Kết nối với chúng tôi</h2>
          <div className="flex justify-center items-center gap-8">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              className="transition duration-300 text-blue-600 hover:text-blue-800"
            >
              <FaFacebook className="w-8 h-8" />
            </a>
            <a
              href="https://zalo.me/0397393983"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 hover:opacity-80 transition duration-300"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/1024px-Icon_of_Zalo.svg.png"
                alt="Zalo"
                className="w-full h-full object-contain"
              />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="transition duration-300 text-pink-500 hover:text-pink-700"
            >
              <FaInstagram className="w-8 h-8" />
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ContactView;
