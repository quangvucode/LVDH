import "../styles/Footer.css";
import { FaFacebookF, FaTiktok, FaInstagram } from "react-icons/fa";
import { SiZalo } from "react-icons/si";

function Footer() {
  return (
    <footer className="footer">
      <p>© 2025 Rabit Homestay. All rights reserved.</p>
      <div className="social-icons">
        <a href="https://www.facebook.com/" className="facebook" target="_blank" rel="noreferrer">
          <FaFacebookF />
        </a>
        <a href="https://www.tiktok.com/" className="tiktok" target="_blank" rel="noreferrer">
          <FaTiktok />
        </a>
        <a href="https://zaloweb.me/" className="zalo" target="_blank" rel="noreferrer">
          <SiZalo />
        </a>
        <a href="https://www.instagram.com/" className="instagram" target="_blank" rel="noreferrer">
          <FaInstagram />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
