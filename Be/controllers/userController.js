const pool = require("../config/db");
const bcrypt = require("bcrypt");

// 1. ดึงข้อมูลการจองของตัวเอง (สำหรับหน้า My Bookings)
exports.getMyBookings = async (req, res) => {
  const userId = req.user.id; // ดึงมาจาก Token ใน Middleware

  try {
    const query = `
      SELECT 
    b.*, 
    r.room_name, 
    s.status_name_th AS room_current_status,
    s.status_key AS room_status_key,
    s.is_bookable AS is_room_ready
FROM bookings b
JOIN rooms r ON b.room_id = r.id
JOIN room_status_master s ON r.status_id = s.id
WHERE b.user_id = $1
ORDER BY b.start_time DESC;
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการจองของคุณได้" });
  }
};

// 2. อัปเดตข้อมูลส่วนตัว (สำหรับหน้า Profile Settings)
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { fullName, newPassword } = req.body;

  try {
    let query = "UPDATE users SET full_name = $1";
    let params = [fullName, userId];

    // ถ้ามีการกรอกรหัสผ่านใหม่เข้ามา
    if (newPassword && newPassword.trim() !== "") {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      query += ", password_hash = $3 WHERE id = $2";
      params.push(hashedPassword);
    } else {
      query += " WHERE id = $2";
    }

    const result = await pool.query(
      query + " RETURNING id, username, full_name, role",
      params,
    );

    res.json({
      success: true,
      user: result.rows[0],
      message: "อัปเดตข้อมูลสำเร็จ",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
  }
};
