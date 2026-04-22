import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Home,
  Activity,
} from "lucide-react";
import api from "../../services/api";
import dayjs from "dayjs";
import socket from "../../services/socket";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const todayStr = dayjs().format("YYYY-MM-DD");
      const res = await api.get(`/admin/dashboard-stats?today=${todayStr}`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // 1. โหลดข้อมูลครั้งแรก
    fetchStats();

    // 2. 🔥 ดักรับเหตุการณ์ Real-time
    socket.on("booking_updated", () => {
      console.log("⚡ Data updated from server, refreshing stats...");
      fetchStats();
    });

    // 3. Cleanup เมื่อปิดหน้าจอ
    return () => {
      socket.off("booking_updated");
    };
  }, []); // รันครั้งเดียวเพื่อ Setup listener

  if (!stats)
    return (
      <div className="p-10 text-center font-bold text-gray-400 animate-pulse">
        กำลังโหลดข้อมูล Dashboard...
      </div>
    );

  const roomData = stats.room_usage.map((r) => ({
    name: r.room_name,
    value: parseInt(r.usage_count),
  }));

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
            System <span className="text-blue-600">Dashboard</span>
          </h1>
          <p className="text-gray-400 font-bold mt-2">
            ข้อมูลอัปเดตล่าสุดเมื่อ {dayjs().format("HH:mm")} น.
          </p>
        </header>

        {/* 📋 SECTION 1: TODAY'S TASKS (งานวันนี้) */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6 ml-1">
            <Activity size={20} className="text-blue-600" />
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
              Today's <span className="text-gray-900">Focus</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="จองวันนี้ (รวม)"
              value={stats.today?.total}
              icon={<Calendar />}
              color="bg-blue-600"
              subtitle="รายการจองใหม่ของวันนี้"
            />
            <StatCard
              title="Confirmed วันนี้"
              value={stats.today?.confirmed || 0}
              icon={<CheckCircle />}
              color="bg-emerald-500"
              subtitle="เตรียมพร้อมสำหรับการใช้งาน"
            />
            <StatCard
              title="Cancelled วันนี้"
              value={stats.today?.cancelled || 0}
              icon={<XCircle />}
              color="bg-red-400"
              subtitle="รายการที่ถูกยกเลิกวันนี้"
            />
          </div>
        </div>

        {/* 📈 SECTION 2: OVERALL STATS (ภาพรวมสะสม) */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6 ml-1">
            <Activity size={20} className="text-slate-400" />
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
              Overall <span className="text-gray-900">Performance</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Confirmed ทั้งหมด"
              value={stats.overall?.confirmed || 0}
              icon={<Users />}
              color="bg-slate-800"
              subtitle="ความสำเร็จรวมตั้งแต่เปิดระบบ"
            />
            <StatCard
              title="Cancelled ทั้งหมด"
              value={stats.overall?.cancelled || 0}
              icon={<XCircle />}
              color="bg-slate-400"
              subtitle="สถิติการยกเลิกสะสม"
            />

            <StatCard
              title="ห้องประชุมทั้งหมด"
              value={stats.room_status?.total || 0}
              icon={<Home />}
              color="bg-blue-100"
              iconColor="text-blue-600"
              textColor="text-blue-900"
              subtitle={`${stats.room_status?.available} พร้อมให้บริการ | ${stats.room_status?.maintenance} ไม่พร้อมให้บริการ`}
            />
          </div>
        </div>

        {/* 📊 Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 h-[450px]">
            <h3 className="text-xl font-black mb-6 text-gray-800">
              สัดส่วนการใช้งานห้อง
            </h3>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={roomData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {roomData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 h-[450px]">
            <h3 className="text-xl font-black mb-6 text-gray-800">
              ยอดการจองสะสมรายห้อง
            </h3>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={roomData} margin={{ bottom: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <RechartsTooltip cursor={{ fill: "#f9fafb" }} />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[10, 10, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🕒 Recent Activities */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8 px-2">
            <h3 className="text-2xl font-black text-gray-800">
              Recent <span className="text-blue-600">Activities</span>
            </h3>
            <button
              onClick={() => (window.location.href = "/admin/bookings")}
              className="text-sm font-black text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4">Meeting Title</th>
                  <th className="pb-4">Room</th>
                  <th className="pb-4">Booker</th>
                  <th className="pb-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recent_bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="group hover:bg-gray-50/50 transition-all"
                  >
                    <td className="py-5 font-bold text-gray-700">{b.title}</td>
                    <td className="py-5">
                      <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-black">
                        {b.room_name}
                      </span>
                    </td>
                    <td className="py-5 text-sm text-gray-500 font-medium">
                      {b.booker_name}
                    </td>
                    <td className="py-5 text-right font-bold text-gray-400 text-xs">
                      {dayjs(b.start_time).format("DD MMM, HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white p-7 rounded-[35px] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
    {/* ไอคอนแบบจางๆ เป็นพื้นหลังด้านขวา (เพิ่มความสวยงาม) */}
    <div className="absolute -right-4 -top-4 text-gray-50 opacity-20 group-hover:scale-110 transition-transform duration-500">
      {React.cloneElement(icon, { size: 100 })}
    </div>

    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-100`}
        >
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          {title}
        </p>
      </div>

      <div>
        <p className="text-5xl text-center font-black text-gray-900 tracking-tighter leading-none mb-3">
          {value}
        </p>
        <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          {subtitle}
        </p>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
