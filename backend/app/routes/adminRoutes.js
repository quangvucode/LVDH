const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/adminController");
const verifyToken = require("../middlewares/verifyToken");

// API thống kê dashboard admin
router.get("/dashboard-stats", verifyToken, getDashboardStats);

module.exports = router;
