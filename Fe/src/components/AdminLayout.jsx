import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  DoorOpen,
  ListChecks,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Settings,
} from "lucide-react";
const AdminLayout = ({ onLogout, user }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", name: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/rooms", name: "จัดการห้องประชุม", icon: DoorOpen },
    { path: "/admin/bookings", name: "ตรวจสอบการจอง", icon: ListChecks },
    { path: "/admin/reports", name: "รายงานการใช้งาน", icon: BarChart3 },
    { path: "/admin/settings", name: "System Config", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* --- Sidebar --- */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="bg-gray-900 p-2 rounded-xl text-white">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tighter">
              ADMIN PORTAL
            </span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-5 py-4 rounded-[20px] transition-all duration-300 group ${
                    isActive
                      ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={20}
                      className={
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-600"
                      }
                    />
                    <span className="font-bold text-sm">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto p-8 space-y-4">
          {/* ข้อมูลผู้ใช้งานปัจจุบัน */}
          <div className="px-5 py-4 bg-gray-50 rounded-3xl flex items-center gap-3 border border-gray-100">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-black text-[10px]">
              AD
            </div>
            <div className="truncate">
              <p className="text-xs font-black text-gray-800 truncate">
                {user?.full_name || "Admin"}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                Administrator
              </p>
            </div>
          </div>

          {/* ปุ่ม Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-[20px] text-red-500 hover:bg-red-50 font-bold transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto">
        {/* ตรงนี้จะเปลี่ยนไปตาม Route ที่เราเลือก */}
        <div className="p-4 md:p-8 animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
