// components/AdminSidebar.jsx
import { LayoutDashboard, DoorOpen, ListChecks, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const location = useLocation();

  const menus = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "จัดการห้องประชุม", path: "/admin/rooms", icon: DoorOpen },
    { name: "ตรวจสอบการจอง", path: "/admin/bookings", icon: ListChecks },
    { name: "รายงานการใช้งาน", path: "/admin/reports", icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-100 p-6 flex flex-col gap-2">
      <div className="mb-8 px-4">
        <h2 className="text-2xl font-black text-emerald-600">Admin Panel</h2>
      </div>

      {menus.map((menu) => (
        <Link
          key={menu.path}
          to={menu.path}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
            location.pathname === menu.path
              ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          }`}
        >
          <menu.icon size={20} />
          {menu.name}
        </Link>
      ))}
    </div>
  );
};
