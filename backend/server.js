const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./app/routes/authRoutes');
const adminRoutes = require("./app/routes/adminRoutes");
const bookingRoutes = require('./app/routes/bookingRoutes');
const roomRoutes = require('./app/routes/roomRoutes')
const paymentRoutes = require('./app/routes/paymentRoutes');
const userRoutes = require("./app/routes/userRoutes");

const app = express();

// 
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/uploads", express.static(path.join(__dirname, "app", "uploads")));
app.use("/api/users", userRoutes);

// ADMIN
app.use("/api/admin", adminRoutes); 

// Kết nối MongoDB
connectDB();

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
