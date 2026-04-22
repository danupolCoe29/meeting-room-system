const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// เส้นทางสำหรับดึงรายการจองของตัวเอง: GET /api/users/my-bookings
router.get("/my-bookings", userController.getMyBookings);

// เส้นทางสำหรับอัปเดตโปรไฟล์: PUT /api/users/update-profile
router.put("/update-profile", userController.updateProfile);

module.exports = router;
