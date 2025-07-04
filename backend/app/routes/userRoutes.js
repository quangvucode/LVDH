const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/me", verifyToken, userController.getCurrentUser);
router.put("/me", verifyToken, userController.updateUserInfo);
router.put("/change-password", verifyToken, userController.changePassword);


module.exports = router;
