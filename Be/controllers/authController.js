const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, password, fullName } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role) 
       VALUES ($1, $2, $3, 'user') RETURNING id, username, full_name`,
      [username, hashedPassword, fullName],
    );
    res.json({ message: "สมัครสมาชิกสำเร็จ", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Username นี้ถูกใช้งานไปแล้ว" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = LOWER($1)",
      [username],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "ไม่พบชื่อผู้ใช้งานนี้" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
    }

    // สร้าง Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};
