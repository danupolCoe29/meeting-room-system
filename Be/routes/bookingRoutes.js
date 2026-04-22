const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authenticateToken = require("../middleware/authMiddleware");

module.exports = (io) => {
  const controller = bookingController(io);

  // ทุกเส้นทางในการจองต้องผ่านด่านตรวจ (Middleware)
  router.get("/rooms", authenticateToken, controller.getRooms);
  router.post("/book", authenticateToken, controller.createBooking);
  router.delete(
    "/book/:bookingId",
    authenticateToken,
    controller.deleteBooking,
  );
  router.get(
    "/bookings-by-date",
    authenticateToken,
    controller.getBookingsByDate,
  );
  router.get("/settings", authenticateToken, controller.getSettings);
  router.get("/search-rooms", authenticateToken, controller.searchRooms);

  return router;
};
