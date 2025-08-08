const express = require('express');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const connectDB = require('./config/db');

// ROUTES
const authRoutes = require('./app/routes/authRoutes');
const adminRoutes = require("./app/routes/adminRoutes");
const bookingRoutes = require('./app/routes/bookingRoutes');
const roomRoutes = require('./app/routes/roomRoutes')
const paymentRoutes = require('./app/routes/paymentRoutes');
const userRoutes = require("./app/routes/userRoutes");
const chatRoute = require("./app/routes/chatRoute");
const orderRoutes = require('./app/routes/orderRoutes');
const invoiceRoutes = require('./app/routes/invoiceRoutes');
const serviceRoutes = require('./app/routes/serviceRoutes');
const session = require("express-session");



const app = express();

// Middleware cơ bản
app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use(
  session({
    secret: process.env.SESSION_SECRET, // 
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 60 * 1000, // session tồn tại 30 phút
      httpOnly: true,
    },
  })
);

// Middleware hỗ trợ upload file (dùng nếu bạn up file ảnh thay vì base64)
app.use(fileUpload());

// ROUTES chính
app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/uploads", express.static(path.join(__dirname, "app", "uploads")));
app.use("/api/users", userRoutes);

/// CHATBOT
app.use("/api/chat", chatRoute);


// ADMIN
app.use("/api/admin", adminRoutes);
app.use('/api/admin/orders', orderRoutes);
app.use('/api/admin/invoices', invoiceRoutes);
app.use('/api/admin/services', serviceRoutes);




// Kết nối MongoDB
connectDB();

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
