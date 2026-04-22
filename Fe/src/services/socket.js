import { io } from "socket.io-client";

// URL ของ Backend ของคุณ (ปรับ Port ให้ตรงกับที่เซตไว้)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const socket = io(SOCKET_URL, {
  autoConnect: true, // ให้เชื่อมต่อทันทีที่โหลดแอป
  reconnection: true, // ถ้าหลุดให้พยายามต่อใหม่เอง
});

export default socket;
