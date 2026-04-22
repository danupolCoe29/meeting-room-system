import React, { useState, useEffect } from "react";
import {
  X,
  User,
  MessageSquare,
  CheckCircle2,
  Home,
  ChevronDown,
} from "lucide-react";
import dayjs from "dayjs";
// --- นำเข้าคอมโพเนนต์ที่เราสร้างไว้ ---
import CompactDateSelector from "../components/CompactDateSelector";
import CompactTimeSelector from "../components/CompactTimeSelector";
import CompactParticipantsSelector from "../components/CompactParticipantsSelector";

const BookingModal = ({
  isOpen,
  onClose,
  room: initialRoom,
  allRooms,
  date: initialDate,
  onChangeDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  onConfirm,
}) => {
  const [currentRoom, setCurrentRoom] = useState(initialRoom);
  const [bookerName, setBookerName] = useState("");
  const [title, setTitle] = useState("");
  const [participantCount, setParticipantCount] = useState(1);

  useEffect(() => {
    if (initialRoom) {
      setCurrentRoom(initialRoom);
    }
  }, [initialRoom, isOpen]);

  if (!isOpen || !currentRoom) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (participantCount > currentRoom.capacity) {
      alert(
        `⚠️ ห้อง ${currentRoom.room_name} รองรับได้สูงสุด ${currentRoom.capacity} ท่าน (คุณระบุมา ${participantCount} ท่าน)`,
      );
      return;
    }

    const isBooking = await onConfirm({
      bookerName,
      title,
      selectedRoom: currentRoom,
      participants: participantCount,
    });

    if (isBooking) {
      setBookerName("");
      setTitle("");
      setParticipantCount(1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="relative p-8 bg-emerald-600 text-white">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={28} />
            <h2 className="text-2xl font-black">รายละเอียดการจอง</h2>
          </div>
          <p className="text-emerald-100 font-medium italic text-sm">
            ตรวจสอบและแก้ไขข้อมูลก่อนยืนยันการจอง
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar"
        >
          {/* 1. เลือกห้อง (Editable) */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Home size={14} className="text-emerald-600" /> ห้องประชุม
            </label>
            <div className="relative group">
              <select
                value={currentRoom.id}
                onChange={(e) =>
                  setCurrentRoom(allRooms.find((r) => r.id === e.target.value))
                }
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl group-hover:bg-gray-100 focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-700 appearance-none cursor-pointer min-h-[56px] outline-none"
              >
                {allRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_name} (สูงสุด {r.capacity} ท่าน)
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* 2. จำนวนผู้เข้าประชุม และ วันที่ */}
          <div className="grid grid-cols-2 gap-4">
            <CompactParticipantsSelector
              label="จำนวนคน"
              value={participantCount}
              onChange={(val) => setParticipantCount(parseInt(val))}
              iconColor="text-emerald-600"
              max={currentRoom.capacity}
            />
            <CompactDateSelector
              label="วันที่จอง"
              value={initialDate}
              onChange={onChangeDate}
              min={dayjs().format("YYYY-MM-DD")} // 🚫 ห้ามจองย้อนหลัง
              maxDays={30} // 📅 จองล่วงหน้าได้ 30 วัน
              iconColor="text-emerald-600"
            />
          </div>

          {/* 3. เวลาเริ่ม และ เวลาสิ้นสุด */}
          <div className="grid grid-cols-2 gap-4">
            <CompactTimeSelector
              label="เริ่มเวลา"
              value={startTime}
              onChange={setStartTime}
              iconColor="text-emerald-600"
            />
            <CompactTimeSelector
              label="สิ้นสุดเวลา"
              value={endTime}
              onChange={setEndTime}
              iconColor="text-emerald-600"
              // กรองเวลาสิ้นสุดให้ต้องมากกว่าเวลาเริ่ม
              startHour={parseInt(startTime.split(":")[0])}
            />
          </div>

          {/* 4. ข้อมูลส่วนบุคคล */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                หัวข้อการประชุม
              </label>
              <div className="relative">
                <MessageSquare
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
                  size={18}
                />
                <input
                  required
                  placeholder="เช่น ประชุมวางแผนรายสัปดาห์"
                  className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-700"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all text-lg mt-4"
          >
            ยืนยันการจองทันที
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
