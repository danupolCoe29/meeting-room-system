import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { User, Lock, ArrowRight, UserPlus } from "lucide-react";
import api from "../services/api";
import Swal from "sweetalert2";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      await Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        text: "กำลังนำคุณเข้าสู่ระบบ...",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-[32px]", // ปรับขอบให้มนเข้ากับดีไซน์คุณ
        },
      });

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      window.location.reload(); // เพื่อให้ App.jsx โหลด State ใหม่
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: err.response?.data?.error || "ชื่อผู้ใช้หรือรหัสผ่านผิด",
        confirmButtonColor: "#10b981", // สีเขียว emerald-600
        customClass: {
          popup: "rounded-[32px]",
          confirmButton: "rounded-xl px-6 py-2 font-black",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 border border-gray-100 relative overflow-hidden">
        {/* ตกแต่งมุมขวาบนให้เข้ากับหน้า Register */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

        <header className="text-center mb-10 relative">
          <div className="bg-emerald-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock className="text-emerald-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-400 font-medium mt-1">
            เข้าสู่ระบบเพื่อจัดการห้องประชุม
          </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6 relative">
          <div className="space-y-2">
            <label className="text-xs font-black ml-1 text-gray-500 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={20}
              />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-gray-700"
                placeholder="กรอกชื่อผู้ใช้งาน"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black ml-1 text-gray-500 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={20}
              />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                placeholder="กรอกรหัสผ่าน"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg disabled:bg-gray-300"
          >
            {loading ? "Signing In..." : "Sign In"} <ArrowRight size={20} />
          </button>
        </form>

        {/* --- ส่วนที่เพิ่มใหม่: ลิงก์ไปหน้าสมัครสมาชิก --- */}
        <footer className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-gray-400 font-bold text-sm mb-3">
            ยังไม่มีบัญชีผู้ใช้งานใช่ไหม?
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-emerald-600 font-black hover:text-emerald-700 transition-colors py-2 px-4 rounded-xl hover:bg-emerald-50"
          >
            <UserPlus size={18} />
            สร้างบัญชีใหม่ที่นี่
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
