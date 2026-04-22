import axios from "axios";

// สร้าง instance ของ axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ดักจับทุกครั้งที่ส่ง Request (เพื่อแนบ Token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ดักจับทุกครั้งที่ได้รับ Response (เพื่อเช็ก 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // เช็กว่าเป็น 401 และปัจจุบัน "ไม่ได้" อยู่ที่หน้า /login
    if (error.response && error.response.status === 401) {
      const isLoginPage = window.location.pathname === "/login";

      if (!isLoginPage) {
        // กรณีเป็น 401 จากหน้าอื่นๆ (Token หมดอายุ/ปลอม)
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // ดีดไปหน้า Login
        window.location.href = "/login";
      }

      // ถ้าเป็นหน้า Login อยู่แล้ว ไม่ต้องทำอะไร
      // ปล่อยให้ catch ในหน้า LoginPage.jsx จัดการแสดง Alert เอง
    }
    return Promise.reject(error);
  },
);

export default api;
