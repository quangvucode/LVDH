const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/adminController");
const { getAllUsers, deleteUser, updateUserStatus, updateUserName   } = require("../controllers/adminController");
const { getAllRoomsAdmin, createRoom, updateRoom, deleteRoom } = require("../controllers/adminRoomController");
const { getBookingByCode, getAllBookings, confirmCancelBooking, updateBookingStatus, getBookingDetails } = require("../controllers/adminBookingController");



const verifyToken = require("../middlewares/verifyToken");
// API QUẢN LÝ NGƯỜI DÙNG
router.get("/users", verifyToken, getAllUsers);
router.delete("/users/:id", verifyToken, deleteUser);
router.patch("/users/:id/status", verifyToken, updateUserStatus);
router.patch("/users/:id/info", updateUserName);



// API thống kê dashboard admin
router.get("/dashboard-stats", verifyToken, getDashboardStats);
// API QUẢN LÝ BOOKING
router.get("/bookings/code/:code", verifyToken, getBookingByCode);
router.get("/bookings", verifyToken, getAllBookings);
router.patch("/bookings/:id/confirm-cancel", verifyToken, confirmCancelBooking);
router.patch("/bookings/:id/status", verifyToken, updateBookingStatus);
router.get('/bookings/:id/details', verifyToken, getBookingDetails);



// API QUẢN LÝ PHÒNG 
router.put("/rooms/:id", verifyToken, updateRoom);
router.delete("/rooms/:id", verifyToken, deleteRoom);
router.post("/rooms", verifyToken, createRoom);
router.get("/rooms", verifyToken, getAllRoomsAdmin);

module.exports = router;
