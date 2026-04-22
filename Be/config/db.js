// db.js (เวอร์ชันปรับปรุงเพื่อความปลอดภัยบน Cloud)
const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // เพิ่มส่วนนี้เข้าไปครับ
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
