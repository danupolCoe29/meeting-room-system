import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  User,
  Lock,
  Mail,
  ArrowLeft,
  UserPlus,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";
import Swal from "sweetalert2";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation เบื้องต้น
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณาตรวจสอบรหัสผ่านและยืนยันรหัสผ่านอีกครั้ง",
        confirmButtonColor: "#10b981",
        customClass: { popup: "rounded-[32px]" },
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
      });

      await Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ!",
        text: "ยินดีต้อนรับ! คุณสามารถเข้าสู่ระบบได้ทันที",
        confirmButtonColor: "#10b981",
        customClass: { popup: "rounded-[32px]" },
      });
      navigate("/login"); // สมัครเสร็จพาไปหน้า Login
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "สมัครสมาชิกไม่สำเร็จ",
        text: err.response?.data?.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก",
        confirmButtonColor: "#10b981",
        customClass: { popup: "rounded-[32px]" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 border border-gray-100 relative overflow-hidden">
        {/* ตกแต่งพื้นหลังเล็กน้อย */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

        <header className="text-center mb-8 relative">
          <div className="bg-emerald-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-gray-400 font-medium mt-1">
            เริ่มต้นใช้งานระบบจองห้องประชุม
          </p>
        </header>

        <form onSubmit={handleRegister} className="space-y-5 relative">
          {/* ชื่อ-นามสกุล */}
          <div className="space-y-1.5">
            <label className="text-xs font-black ml-1 text-gray-500 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <CheckCircle
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={18}
              />
              <input
                name="fullName"
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-gray-700"
                placeholder="ชื่อ-นามสกุล ของคุณ"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-black ml-1 text-gray-500 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={18}
              />
              <input
                name="username"
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-gray-700"
                placeholder="ตั้งชื่อผู้ใช้งาน"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black ml-1 text-gray-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={18}
                />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                  placeholder="รหัสผ่าน"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black ml-1 text-gray-500 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={18}
                />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                  placeholder="ยืนยันรหัสผ่าน"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg disabled:bg-gray-300 disabled:shadow-none"
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <p className="text-gray-400 font-bold text-sm">
            มีบัญชีผู้ใช้อยู่แล้ว?{" "}
            <Link to="/login" className="text-emerald-600 hover:underline">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 mt-4 text-xs font-bold transition-colors"
          >
            <ArrowLeft size={14} /> กลับหน้าหลัก
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default RegisterPage;
