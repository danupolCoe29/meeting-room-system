import React, { useState, useEffect } from "react";
import {
  X,
  Home,
  Save,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import dayjs from "dayjs";
import CompactDateSelector from "./CompactDateSelector";
import CompactTimeSelector from "./CompactTimeSelector";
import CompactParticipantsSelector from "./CompactParticipantsSelector";
import api from "../services/api";

const AdminBookingEditModal = ({
  isOpen,
  onClose,
  booking,
  allRooms,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    room_id: "",
    date: "",
    start_time: "",
    end_time: "",
    participants: 0,
  });
  const [maxDays, setMaxDays] = useState(30);

  useEffect(() => {
    if (booking && isOpen) {
      setFormData({
        title: booking.title,
        room_id: booking.room_id,
        start_time: dayjs(booking.start_time).format("HH:mm"),
        end_time: dayjs(booking.end_time).format("HH:mm"),
        participants: booking.participants || 0,
        date: dayjs(booking.start_time).format("YYYY-MM-DD"),
      });
    }
  }, [booking, isOpen]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const config = await api.get("/settings");
        if (config.data.max_booking_days)
          setMaxDays(parseInt(config.data.max_booking_days));
      } catch (err) {
        console.error("Initial load error:", err);
      }
    };
    fetchInitialData();
  }, []);

  if (!isOpen || !booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalStartTime = dayjs(
      `${formData.date} ${formData.start_time}`,
    ).toISOString();
    const finalEndTime = dayjs(
      `${formData.date} ${formData.end_time}`,
    ).toISOString();

    if (dayjs(finalStartTime).isAfter(dayjs(finalEndTime))) {
      alert("เวลาเริ่มต้องอยู่ก่อนเวลาสิ้นสุด");
      return;
    }

    onSave(booking.id, {
      ...formData,
      start_time: finalStartTime,
      end_time: finalEndTime,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-xl overflow-hidden border border-slate-100">
        {/* --- Header: เปลี่ยนเป็นสีขาวคลีน ลดความจ้า --- */}
        <div className="relative p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                แก้ไขข้อมูลการจอง
              </h2>
              <p className="text-slate-400 text-xs font-medium">
                Booking ID: #{booking.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-300 hover:text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 max-h-[70vh] overflow-y-auto"
        >
          {/* 1. เลือกห้องประชุม: ใช้สี Soft Gray-Blue */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl text-slate-400 shadow-sm border border-slate-50">
              <Home size={20} />
            </div>
            <div className="flex-1 relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">
                ห้องประชุม
              </label>
              <select
                value={formData.room_id}
                onChange={(e) =>
                  setFormData({ ...formData, room_id: e.target.value })
                }
                className="w-full bg-transparent font-bold text-slate-700 text-base outline-none cursor-pointer appearance-none"
              >
                {allRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_name} ({r.capacity} ท่าน)
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-0 bottom-1 text-slate-300 pointer-events-none"
              />
            </div>
          </div>

          {/* 2. จำนวนคน และ วันที่: ใช้ iconColor สีเทาอมฟ้า (Slate-400) */}
          <div className="grid grid-cols-2 gap-4">
            <CompactParticipantsSelector
              label="จำนวนคน"
              value={formData.participants}
              onChange={(val) =>
                setFormData({ ...formData, participants: parseInt(val) })
              }
              iconColor="text-slate-400"
            />
            <CompactDateSelector
              label="วันที่จอง"
              value={formData.date}
              onChange={(val) => setFormData({ ...formData, date: val })}
              min={dayjs().format("YYYY-MM-DD")}
              iconColor="text-slate-400"
              maxDays={maxDays}
            />
          </div>

          {/* 3. เวลาเริ่ม และ เวลาจบ */}
          <div className="grid grid-cols-2 gap-4">
            <CompactTimeSelector
              label="เริ่มเวลา"
              value={formData.start_time}
              onChange={(val) => setFormData({ ...formData, start_time: val })}
              iconColor="text-blue-400"
            />
            <CompactTimeSelector
              label="สิ้นสุดเวลา"
              value={formData.end_time}
              onChange={(val) => setFormData({ ...formData, end_time: val })}
              iconColor="text-blue-400"
            />
          </div>

          {/* 4. หัวข้อการประชุม */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <MessageSquare size={12} /> หัวข้อการประชุม
            </label>
            <input
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all font-bold text-slate-700"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* 5. ปุ่มดำเนินการ: ใช้สีฟ้าที่ซอฟต์ลง (Slate/Blue-500) */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-95"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Save size={18} /> บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBookingEditModal;
