import React, { useState, useEffect } from "react";
import { Save, Calendar, Settings, ShieldCheck, Info } from "lucide-react";
import api from "../../services/api";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const AdminSettings = () => {
  const [maxBookingDays, setMaxBookingDays] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get("/admin/settings/max_booking_days");
        if (res.data) setMaxBookingDays(res.data.value);
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/admin/settings/max_booking_days", {
        value: maxBookingDays,
      });

      Swal.fire({
        icon: "success",
        title: "บันทึกเรียบร้อย",
        text: `ขยายเวลาการจองล่วงหน้าเป็น ${maxBookingDays} วัน`,
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "rounded-[32px]" },
      });
    } catch (err) {
      Swal.fire("Error", "ไม่สามารถบันทึกข้อมูลได้", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        {/* --- Header Section --- */}
        <header className="mb-12 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white text-blue-600 rounded-[24px] shadow-sm border border-slate-100">
              <Settings size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
                System <span className="text-blue-600">Config</span>
              </h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">
                การจัดการระเบียบการจองห้องประชุม
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
          {/* --- Main Settings Card --- */}
          <div className="bg-white p-10 md:p-12 rounded-[48px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] border border-white relative overflow-hidden group">
            {/* Background Decoration */}
            <Calendar
              className="absolute -right-16 -bottom-16 text-blue-50 opacity-20 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-1000"
              size={320}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Booking Policy Configuration
                </h3>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Input Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-black text-slate-700 mb-5">
                      ระยะเวลาที่อนุญาตให้จองล่วงหน้า
                    </label>
                    <div className="relative group/input">
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full px-10 py-8 bg-slate-50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all font-black text-5xl text-blue-600 outline-none shadow-inner"
                        value={maxBookingDays}
                        onChange={(e) => setMaxBookingDays(e.target.value)}
                      />
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-end">
                        <span className="font-black text-slate-300 uppercase tracking-tighter text-sm">
                          Days
                        </span>
                        <span className="text-[10px] text-blue-400 font-black tracking-widest uppercase">
                          Limit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Column */}
                <div className="space-y-4">
                  <div className="bg-slate-50/80 backdrop-blur-sm p-6 rounded-[32px] border border-slate-100">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-xl mt-1">
                        <Info size={20} />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">
                          Live Preview
                        </p>
                        <p className="text-slate-700 font-bold leading-relaxed">
                          ปัจจุบันจองล่วงหน้าได้{" "}
                          <span className="text-blue-600 font-black text-lg underline decoration-blue-200 underline-offset-4">
                            {maxBookingDays || 0} วัน
                          </span>
                        </p>
                        <p className="text-slate-500 text-sm mt-1">
                          ผู้ใช้สามารถจองได้ถึง:{" "}
                          <span className="text-slate-800 font-black">
                            {dayjs()
                              .add(parseInt(maxBookingDays || 0), "day")
                              .format("DD MMMM YYYY")}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- Footer / Action Bar --- */}
          <div className="flex flex-col md:flex-row justify-end items-center gap-6 px-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full md:w-auto overflow-hidden px-14 py-6 bg-blue-600 text-white rounded-[32px] font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {loading ? (
                "กำลังบันทึก..."
              ) : (
                <>
                  <Save size={24} /> บันทึกการตั้งค่า
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
