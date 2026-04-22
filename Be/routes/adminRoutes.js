const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const authAdmin = require("../middleware/authAdmin");

// เปลี่ยนจาก module.exports = router เป็น function
module.exports = (io) => {
  router.use(authMiddleware);
  router.use(authAdmin);

  // ส่ง io ต่อไปให้ controller (ส่งผ่าน req หรือวิธีอื่นๆ)
  // แต่เพื่อให้ง่าย เราจะฝากไว้ใน req.io สำหรับทุก request ในไฟล์นี้
  router.use((req, res, next) => {
    req.io = io;
    next();
  });

  router.get("/rooms", adminController.getAllRooms);
  router.post("/rooms", adminController.createRoom);
  router.put("/rooms/:id", adminController.updateRoom);
  router.patch("/rooms/:id/status", adminController.updateRoomStatus);

  router.get("/bookings", adminController.getAllBookings);
  router.put("/bookings/:id", adminController.updateBooking);
  router.patch("/bookings/:id/cancel", adminController.cancelBooking);

  router.get("/dashboard-stats", adminController.getDashboardStats);
  router.get("/report", adminController.getBookingReport);

  router.get("/settings/:key", adminController.getSettingByKey);
  router.put("/settings/:key", adminController.updateSettingByKey);

  return router; // คืนค่า router กลับไปให้ index.js
};
