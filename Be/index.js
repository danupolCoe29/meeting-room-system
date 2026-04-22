require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const authenticateToken = require("./middleware/authMiddleware");

// --- 1. Import Routes ---
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const httpServer = createServer(app);

// --- 2. Socket.io Setup ---
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// --- 3. Socket.io Connection Event ---
io.on("connection", (socket) => {
  console.log("มีคนเข้าใช้งานระบบ:", socket.id);
});

// --- 4. การจัดการ Routes ---

// กลุ่ม API ที่ไม่ต้อง Login (เช่น Login, Register)
app.use("/api/auth", authRoutes);

// กั้นด้วย Middleware (หลังจากบรรทัดนี้ ทุก API ต้องแนบ Token)
app.use(authenticateToken);

// กลุ่ม API เกี่ยวกับการจอง (ส่ง io เข้าไปเพื่อให้ Controller ใช้ยิงสัญญาณได้)
app.use("/api", bookingRoutes(io));

// กลุ่ม API เกี่ยวกับข้อมูลส่วนตัว User
app.use("/api/users", userRoutes);

app.use("/api/admin", adminRoutes(io));

// --- 5. Start Server ---
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 System running at http://localhost:${PORT}`);
});
