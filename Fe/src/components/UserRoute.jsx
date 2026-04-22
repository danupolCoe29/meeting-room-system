import { Navigate, Outlet } from "react-router-dom";

const UserRoute = ({ user }) => {
  // 1. ถ้ายังไม่ได้ Login (ไม่มี user) ให้ไปหน้า Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. ถ้าเป็น Admin (แต่หลงมาหน้า User) ให้ดีดไปหน้า Admin
  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  // 3. ถ้าเป็น User ปกติ ให้เข้าหน้าจอได้
  return <Outlet />;
};
export default UserRoute;
