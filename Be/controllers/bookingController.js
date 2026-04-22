const pool = require("../config/db");

const bookingController = (io) => {
  return {
    // 1. ดึงข้อมูลห้องทั้งหมด (พร้อมสถานะจาก Master และข้อมูลคนจองปัจจุบัน)
    getRooms: async (req, res) => {
      try {
        const query = `
          SELECT 
            r.*, 
            s.status_key, 
            s.status_name_th, 
            s.color_code AS color_code_status, 
            r.color_code AS color_code_room, 
            s.is_bookable,
            b.id AS current_booking_id, 
            b.start_time, 
            b.end_time
          FROM rooms r
          JOIN room_status_master s ON r.status_id = s.id
          LEFT JOIN bookings b ON r.id = b.room_id 
            AND b.status = 'confirmed'
            AND NOW() BETWEEN b.start_time AND b.end_time
          ORDER BY r.room_name ASC`;
        const result = await pool.query(query);
        res.json(result.rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database Error" });
      }
    },

    // 2. จองห้องประชุม (เพิ่มการเช็ก is_bookable)
    createBooking: async (req, res) => {
      const { roomId, startTime, endTime, title, participants } = req.body;
      const userId = req.user.id;
      const now = new Date();
      if (new Date(startTime) < now) {
        return res
          .status(400)
          .json({ error: "ไม่สามารถจองห้องประชุมย้อนหลังได้" });
      }
      try {
        // --- ขั้นตอนที่ 1: เช็กสถานะห้องจาก Master ---
        const roomStatus = await pool.query(
          `SELECT s.is_bookable, r.room_name 
           FROM rooms r 
           JOIN room_status_master s ON r.status_id = s.id 
           WHERE r.id = $1`,
          [roomId],
        );

        if (roomStatus.rows.length === 0) {
          return res.status(404).json({ error: "ไม่พบห้องประชุมนี้" });
        }

        if (!roomStatus.rows[0].is_bookable) {
          return res.status(400).json({
            error: `ขออภัย ห้อง "${roomStatus.rows[0].room_name}" อยู่ระหว่างปิดปรับปรุงหรือระงับการใช้งาน`,
          });
        }

        // --- ขั้นตอนที่ 2: เช็กการจองทับซ้อน (เฉพาะ confirmed) ---
        const checkOverlap = await pool.query(
          `SELECT * FROM bookings 
           WHERE room_id = $1 
           AND status = 'confirmed' 
           AND NOT (start_time >= $3 OR end_time <= $2)`,
          [roomId, startTime, endTime],
        );

        if (checkOverlap.rows.length > 0) {
          return res.status(400).json({ error: "ช่วงเวลานี้ถูกจองไปแล้ว" });
        }

        // --- ขั้นตอนที่ 3: บันทึกข้อมูล ---
        const newBooking = await pool.query(
          `INSERT INTO bookings (room_id, user_id, start_time, end_time, title, participants) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [roomId, userId, startTime, endTime, title, participants],
        );

        io.emit("booking_updated");
        res.json({ success: true, booking: newBooking.rows[0] });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Booking Error" });
      }
    },

    // 3. ค้นหาเฉพาะห้องที่ "ว่าง" และ "จองได้"
    searchRooms: async (req, res) => {
      const { startTime, endTime } = req.query;
      try {
        const query = `
          SELECT r.*, s.status_name_th, s.color_code 
          FROM rooms r
          JOIN room_status_master s ON r.status_id = s.id
          WHERE s.is_bookable = true  -- 🚀 กรองเฉพาะห้องที่อนุญาตให้จอง
          AND NOT EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.room_id = r.id
            AND b.status = 'confirmed' 
            AND (b.start_time < $1 AND b.end_time > $2)
          )
          ORDER BY r.room_name ASC
        `;
        const result = await pool.query(query, [endTime, startTime]);
        res.json(result.rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Search Error" });
      }
    },

    // 4. ดึงข้อมูลการจองรายวัน (สำหรับแสดงใน Timeline)
    // controllers/bookingController.js

    getBookingsByDate: async (req, res) => {
      const { date } = req.query;
      if (!date) return res.status(400).json({ error: "กรุณาระบุวันที่" });

      try {
        const query = `
      SELECT 
        r.id AS room_id, 
        r.room_name, 
        s.status_key, 
        s.status_name_th, 
        s.color_code,
        s.is_bookable,
        b.id AS booking_id,
        b.title,
        b.start_time,
        b.end_time,
        u.full_name AS booker_name -- 🚩 ตรงนี้เรียกใช้ u
      FROM rooms r
      JOIN room_status_master s ON r.status_id = s.id
      LEFT JOIN bookings b ON r.id = b.room_id 
        AND b.start_time::date = $1 
        AND b.status = 'confirmed'
      LEFT JOIN users u ON b.user_id = u.id -- ✅ เพิ่มบรรทัดนี้เพื่อนิยามว่า u คือตาราง users
      WHERE s.status_key != 'hidden'
      ORDER BY r.room_name ASC, b.start_time ASC
    `;
        const result = await pool.query(query, [date]);
        res.json(result.rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Timeline Error" });
      }
    },

    // 5. ดึงสถานะห้องทั้งหมด (สำหรับหน้า Admin/Dropdown)
    getStatusMaster: async (req, res) => {
      try {
        const result = await pool.query(
          "SELECT * FROM room_status_master ORDER BY id ASC",
        );
        res.json(result.rows);
      } catch (err) {
        res.status(500).json({ error: "Database Error" });
      }
    },
    // เพิ่มต่อจาก getStatusMaster ใน bookingController.js
    deleteBooking: async (req, res) => {
      const { bookingId } = req.params;
      const userId = req.user.id;
      try {
        const check = await pool.query(
          "SELECT * FROM bookings WHERE id = $1 AND user_id = $2",
          [bookingId, userId],
        );
        if (check.rows.length === 0) {
          return res
            .status(403)
            .json({ error: "ไม่พบรายการจองหรือคุณไม่มีสิทธิ์" });
        }
        await pool.query(
          "UPDATE bookings SET status = 'cancelled' WHERE id = $1",
          [bookingId],
        );
        io.emit("booking_updated");
        res.json({ success: true, message: "ยกเลิกการจองเรียบร้อยแล้ว" });
      } catch (err) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการยกเลิก" });
      }
    },

    getSettings: async (req, res) => {
      try {
        const result = await pool.query(
          "SELECT key, value FROM system_settings",
        );
        const settings = result.rows.reduce((acc, row) => {
          acc[row.key] = row.value;
          return acc;
        }, {});
        res.json(settings);
      } catch (err) {
        res.status(500).json({ error: "Database Error" });
      }
    },
  };
};

module.exports = bookingController;
