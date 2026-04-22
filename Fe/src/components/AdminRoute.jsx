import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = ({ user }) => {
  // เช็กว่ามี user และมี role เป็น admin หรือไม่
  if (!user || user.role !== "admin") {
    // ถ้าไม่ใช่ ให้ส่งกลับไปหน้า Home หรือ Login
    return <Navigate to="/" replace />;
  }

  // ถ้าใช่ ให้แสดงเนื้อหาข้างใน (Admin Pages)
  return <Outlet />;
};

export default AdminRoute;
