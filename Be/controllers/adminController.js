const pool = require("../config/db");

const adminController = {
  // ดึงห้องทั้งหมด (รวมที่ซ่อนอยู่ด้วย)
  getAllRooms: async (req, res) => {
    try {
      const query = `
        SELECT r.*, rs.status_name_th, rs.is_bookable,rs.color_code AS status_color
        FROM rooms r
        JOIN room_status_master rs ON r.status_id = rs.id
        ORDER BY r.room_name ASC
      `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error("DB Error Detail:", err.message);
      res.status(500).json({ error: "ดึงข้อมูลห้องไม่สำเร็จ" });
    }
  },

  // 2.2: เพิ่มห้องใหม่
  createRoom: async (req, res) => {
    const { room_name, capacity, color_code, status_id } = req.body;

    if (!room_name || !capacity) {
      return res
        .status(400)
        .json({ error: "กรุณากรอกชื่อห้องและจำนวนที่นั่ง" });
    }
    const checkDuplicate = await pool.query(
      "SELECT id FROM rooms WHERE room_name = $1",
      [room_name],
    );

    if (checkDuplicate.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "ชื่อห้องนี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น" });
    }
    try {
      const query = `
        INSERT INTO rooms (room_name, capacity, color_code, status_id)
        VALUES ($1, $2, $3, $4) RETURNING *
      `;
      const result = await pool.query(query, [
        room_name,
        capacity,
        color_code,
        status_id || 1,
      ]);

      // แจ้งเตือนทุกเครื่องให้รีเฟรช Timeline
      const io = req.io || req.app.get("io");
      if (io) {
        io.emit("booking_updated");
        console.log("⚡ Socket: Room data updated");
      }
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Create Room Error Detail:", err.message);
      res.status(500).json({ error: "เพิ่มห้องไม่สำเร็จ" });
    }
  },

  // 2.3: แก้ไขข้อมูลห้อง
  updateRoom: async (req, res) => {
    const { id } = req.params;
    const { room_name, capacity, color_code, status_id } = req.body;

    try {
      // 1. ตรวจสอบ SQL: ต้องมีคอลัมน์ status_id และ color_code ตามที่เรา ALTER TABLE ไว้
      const query = `
      UPDATE rooms 
      SET 
        room_name = $1, 
        capacity = $2, 
        color_code = $3, 
        status_id = $4 
      WHERE id = $5 
      RETURNING *
    `;

      const result = await pool.query(query, [
        room_name,
        parseInt(capacity),
        color_code,
        parseInt(status_id),
        id,
      ]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "ไม่พบห้องที่ต้องการแก้ไข" });
      }

      // 2. ส่งสัญญาณ Socket: ใช้ req.io (ถ้าส่งผ่าน router) หรือ req.app.get("io")
      const io = req.io || req.app.get("io");
      if (io) {
        io.emit("booking_updated");
        console.log("⚡ Socket: Room data updated");
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Update Room Error Detail:", err.message);
      res
        .status(500)
        .json({ error: "แก้ไขข้อมูลห้องไม่สำเร็จ: " + err.message });
    }
  },

  // 2.4: อัปเดตสถานะ (Quick Update)
  updateRoomStatus: async (req, res) => {
    const { id } = req.params;
    const { status_id } = req.body;
    try {
      await pool.query("UPDATE rooms SET status_id = $1 WHERE id = $2", [
        status_id,
        id,
      ]);

      // เรียกใช้ req.io ที่เราฝากไว้ใน middleware ของ route
      if (req.io) {
        req.io.emit("booking_updated");
      }

      res.json({ message: "อัปเดตสถานะสำเร็จ" });
    } catch (err) {
      res.status(500).json({ error: "อัปเดตสถานะไม่สำเร็จ" });
    }
  },
  getAllBookings: async (req, res) => {
    try {
      const { date, room_id } = req.query;
      let query = `
      SELECT 
        b.*, 
        r.room_name, r.color_code,
        u.username as booker_name,
        b.participants
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
      const params = [];

      // ถ้ามีการกรองวันที่
      if (date) {
        params.push(date);
        query += ` AND DATE(b.start_time) = $${params.length}`;
      }

      // ถ้ามีการกรองห้อง
      if (room_id) {
        params.push(room_id);
        query += ` AND b.room_id = $${params.length}`;
      }

      query += ` ORDER BY b.start_time DESC`;

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "ดึงข้อมูลการจองไม่สำเร็จ" });
    }
  },
  updateBooking: async (req, res) => {
    const { id } = req.params;
    const { title, room_id, start_time, end_time, participants } = req.body;

    try {
      // 🔍 1. ดึงข้อมูลปัจจุบันมาตรวจสอบ
      const bookingResult = await pool.query(
        "SELECT start_time, end_time, status FROM bookings WHERE id = $1",
        [id],
      );

      if (bookingResult.rows.length === 0) {
        return res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });
      }

      const current = bookingResult.rows[0];
      const now = new Date();

      // 🛑 2. ล็อครายการที่จบไปแล้ว หรือ ถูกยกเลิกไปแล้ว (ห้ามแตะของเก่า)
      if (new Date(current.end_time) < now || current.status === "cancelled") {
        return res.status(400).json({
          error: "ไม่สามารถแก้ไขรายการที่สิ้นสุดไปแล้วหรือถูกยกเลิกได้",
        });
      }

      // 🚩 3. ตรวจสอบเวลาใหม่ที่ส่งมา (ห้ามย้ายไปอดีต)
      if (new Date(start_time) < now) {
        return res
          .status(400)
          .json({ error: "ไม่สามารถแก้ไขเวลาเริ่มให้เป็นอดีตได้" });
      }

      // ⚔️ 4. ตรวจสอบการจองซ้ำ (Collision Check)
      // เพิ่ม AND status != 'cancelled' เพื่อไม่ให้ชนกับรายการที่ยกเลิกไปแล้ว
      const conflictCheck = await pool.query(
        `SELECT id FROM bookings 
       WHERE room_id = $1 AND id != $2 
       AND status != 'cancelled'
       AND (start_time, end_time) OVERLAPS ($3, $4)`,
        [room_id, id, start_time, end_time],
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(400).json({
          error: "ไม่สามารถย้ายได้ เนื่องจากมีการจองอื่นในช่วงเวลาดังกล่าว",
        });
      }

      // 📝 5. ทำการอัปเดต
      const query = `
      UPDATE bookings 
      SET title = $1, room_id = $2, start_time = $3, end_time = $4, participants = $5,updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 RETURNING *
    `;
      const result = await pool.query(query, [
        title,
        room_id,
        start_time,
        end_time,
        participants,
        id,
      ]);

      // 📣 6. แจ้งเตือน Real-time
      const io = req.io || req.app.get("io");
      if (io) io.emit("booking_updated");

      res.json({ message: "แก้ไขข้อมูลการจองสำเร็จ", data: result.rows[0] });
    } catch (err) {
      console.error("Update Booking Error:", err);
      res
        .status(500)
        .json({ error: "ไม่สามารถแก้ไขข้อมูลการจองได้เนื่องจากระบบขัดข้อง" });
    }
  },
  cancelBooking: async (req, res) => {
    const { id } = req.params;
    const { today } = req.query;
    try {
      const query = `
      UPDATE bookings 
      SET status = 'cancelled' 
      WHERE id = $1 
      RETURNING *
    `;
      const result = await pool.query(query, [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });
      }

      // ⚡ ส่ง Socket บอกทุกคนให้ Timeline อัปเดตช่องว่าง
      const io = req.io || req.app.get("io");
      if (io) io.emit("booking_updated");

      res.json({ message: "ยกเลิกการจองแล้ว" });
    } catch (err) {
      res.status(500).json({ error: "ไม่สามารถยกเลิกได้" });
    }
  },
  getDashboardStats: async (req, res) => {
    try {
      const { today } = req.query;

      // 1. สถิติวันนี้
      const todayStatsQuery = `
      SELECT status, COUNT(*) as count 
      FROM bookings 
      WHERE (start_time AT TIME ZONE 'Asia/Bangkok')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date
      GROUP BY status
    `;

      // 2. สถิติรวม
      const overallStatusQuery = `
      SELECT status, COUNT(*) as count 
      FROM bookings 
      GROUP BY status
    `;

      // 3. การใช้งานห้อง
      const roomUsageQuery = `
      SELECT r.room_name, COUNT(b.id) as usage_count
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id AND b.status != 'cancelled'
      GROUP BY r.room_name
    `;

      const roomStatusCountQuery = `
  SELECT 
    COUNT(*) FILTER (WHERE s.is_bookable = true) as available,
    COUNT(*) FILTER (WHERE s.is_bookable = false) as maintenance
  FROM rooms r
  JOIN room_status_master s ON r.status_id = s.id
`;

      // 4. 🔥 เพิ่ม/แก้ไขตัวแปรนี้: รายการจองล่าสุด (เอาทุกสถานะเพื่อให้ Admin เห็นความเคลื่อนไหว)
      const recentBookingsQuery = `
      SELECT 
        b.id, 
        b.title, 
        b.start_time, 
        b.status,
        r.room_name, 
        r.color_code, 
        u.username as booker_name
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `;

      const [todayRes, overallRes, rooms, recent, roomStatus] =
        await Promise.all([
          pool.query(todayStatsQuery),
          pool.query(overallStatusQuery),
          pool.query(roomUsageQuery),
          pool.query(recentBookingsQuery),
          pool.query(roomStatusCountQuery),
        ]);

      res.json({
        today: {
          confirmed: parseInt(
            todayRes.rows.find((r) => r.status === "confirmed")?.count || 0,
          ),
          cancelled: parseInt(
            todayRes.rows.find((r) => r.status === "cancelled")?.count || 0,
          ),
          total: parseInt(
            todayRes.rows.reduce((acc, curr) => acc + parseInt(curr.count), 0),
          ), // ยอดรวมวันนี้จริง ๆ
        },
        overall: {
          confirmed: parseInt(
            overallRes.rows.find((r) => r.status === "confirmed")?.count || 0,
          ),
          cancelled: parseInt(
            overallRes.rows.find((r) => r.status === "cancelled")?.count || 0,
          ),
        },
        room_usage: rooms.rows,
        room_status: {
          available: parseInt(roomStatus.rows[0].available),
          maintenance: parseInt(roomStatus.rows[0].maintenance),
          total:
            parseInt(roomStatus.rows[0].available) +
            parseInt(roomStatus.rows[0].maintenance),
        },
        recent_bookings: recent.rows,
      });
    } catch (err) {
      console.error("Dashboard Error:", err);
      res.status(500).json({ error: "ดึงข้อมูล Dashboard ไม่สำเร็จ" });
    }
  },
  getBookingReport: async (req, res) => {
    const { startDate, endDate, room_id } = req.query;

    try {
      let query = `
      SELECT 
        b.id, b.title, b.start_time, b.end_time, b.participants, b.status,
        r.room_name, u.username as booker_name,
        -- คำนวณระยะเวลาเป็นชั่วโมง
        EXTRACT(EPOCH FROM (b.end_time - b.start_time))/3600 as duration_hours
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
      const params = [];

      if (startDate && endDate) {
        params.push(startDate, endDate);
        query += ` AND DATE(b.start_time) BETWEEN $1 AND $2`;
      }

      if (room_id) {
        params.push(room_id);
        query += ` AND b.room_id = $${params.length}`;
      }

      query += ` ORDER BY b.start_time DESC`;

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "ดึงรายงานไม่สำเร็จ" });
    }
  },
  getSettingByKey: async (req, res) => {
    try {
      const { key } = req.params;
      const result = await pool.query(
        "SELECT value FROM system_settings WHERE key = $1",
        [key],
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).send("Server Error");
    }
  },
  updateSettingByKey: async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      await pool.query("UPDATE system_settings SET value = $1 WHERE key = $2", [
        value,
        key,
      ]);
      res.json({ message: `Updated ${key} successfully` });
    } catch (err) {
      res.status(500).send("Update Error");
    }
  },
};

module.exports = adminController;
