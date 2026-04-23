import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  ClipboardList,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from "lucide-react";

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-[60] px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* ฝั่งซ้าย: Logo & Menu */}
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="text-xl font-black text-emerald-600 tracking-tighter"
          >
            MEETING<span className="text-gray-900">APP</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 font-bold text-sm ${location.pathname === "/" ? "text-emerald-600" : "text-gray-400"}`}
            >
              <Calendar size={18} /> จองห้องประชุม
            </Link>
            <Link
              to="/my-bookings"
              className={`flex items-center gap-2 font-bold text-sm ${location.pathname === "/my-bookings" ? "text-emerald-600" : "text-gray-400"}`}
            >
              <ClipboardList size={18} /> การจองของฉัน
            </Link>
          </div>
        </div>

        {/* ฝั่งขวา: User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100"
          >
            <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <User size={20} />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black text-gray-900">
                {user?.fullName}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                {user?.role}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 py-3 z-20 animate-in fade-in zoom-in duration-150">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                  <Settings size={18} /> ตั้งค่าโปรไฟล์
                </Link>
                <div className="h-px bg-gray-50 my-2 mx-5"></div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} /> ออกจากระบบ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
