import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import MyBookings from "./pages/MyBookings";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookingPage from "./pages/BookingPage";
import ProfileSettings from "./pages/ProfileSettings";
import UserRoute from "./components/UserRoute";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoomManagement from "./pages/admin/AdminRoomManagement";
import AdminBookingMonitor from "./pages/admin/AdminBookingMonitor";
import AdminReport from "./pages/admin/AdminReport";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import AdminSettings from "./pages/admin/AdminSettings";
function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const navigate = useNavigate();

  // เช็กสถานะการ Login (เผื่อมีการเปลี่ยนแปลงจาก Tab อื่น)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar แสดงเฉพาะตอน Login และจะปรับตาม Role อัตโนมัติ */}
      {user && user.role !== "admin" && (
        <Navbar user={user} onLogout={handleLogout} />
      )}

      <Routes>
        {/* -------------------------------------------------------
            1. PUBLIC ROUTES (คนนอกเข้าได้)
        ------------------------------------------------------- */}
        <Route
          path="/login"
          element={
            !user ? (
              <LoginPage />
            ) : (
              <Navigate to={user.role === "admin" ? "/admin" : "/"} />
            )
          }
        />
        <Route path="/register" element={<RegisterPage />} />

        {/* -------------------------------------------------------
            2. USER ROUTES (เฉพาะ User, ถ้า Admin เข้าจะโดนดีดไป /admin)
        ------------------------------------------------------- */}
        <Route element={<UserRoute user={user} />}>
          <Route path="/" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route
            path="/profile"
            element={<ProfileSettings user={user} setUser={setUser} />}
          />
        </Route>

        {/* -------------------------------------------------------
            3. ADMIN ROUTES (เฉพาะ Admin, ถ้า User เข้าจะโดนดีดไป /)
        ------------------------------------------------------- */}
        <Route element={<AdminRoute user={user} />}>
          <Route element={<AdminLayout user={user} onLogout={handleLogout} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/rooms" element={<AdminRoomManagement />} />
            <Route path="/admin/bookings" element={<AdminBookingMonitor />} />
            <Route path="/admin/reports" element={<AdminReport />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
