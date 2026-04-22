import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Users,
  XCircle,
  MessageCircle,
  Hash,
} from "lucide-react";
import moment from "moment";

const BookingCard = ({ booking, onCancel, isHistory }) => {
  const isConflict =
    booking.status === "confirmed" && booking.is_room_ready === false;

  return (
    <div
      className={`relative flex flex-col bg-white rounded-[35px] border-2 transition-all duration-300 ${
        isConflict
          ? "border-red-200 shadow-lg shadow-red-50"
          : isHistory
            ? "border-gray-50 opacity-75"
            : "border-gray-100 hover:shadow-xl hover:shadow-gray-100"
      }`}
    >
      <div className="p-6 flex-1">
        {/* Header: ชื่อห้องและสถานะ */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${isConflict ? "bg-red-100 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
            >
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 leading-tight">
                {booking.room_name}
              </h3>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <Hash size={10} />
                <span>{booking.id}</span>
              </div>
            </div>
          </div>

          <span
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              booking.status === "confirmed"
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {booking.status}
          </span>
        </div>

        {/* Content: หัวข้อการจอง */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50/50 p-4 rounded-[24px] border border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              หัวข้อการประชุม
            </p>
            <p className="text-sm font-bold text-gray-700 leading-snug">
              {booking.title || "ไม่ได้ระบุหัวข้อ"}
            </p>
          </div>

          {/* จำนวนผู้เข้าร่วม (ข้อมูลส่งมาเป็นตัวเลข) */}
          <div className="flex items-center gap-1.5 px-1">
            <Users size={14} className="text-gray-400" />
            <span className="text-[11px] font-bold text-gray-500">
              ผู้เข้าร่วม: {booking.participants} ท่าน
            </span>
          </div>
        </div>

        {/* วันที่และเวลา (ใช้ moment ตามที่คุณใช้อยู่) */}
        <div className="flex gap-4 p-4 bg-gray-50 rounded-[24px] mb-4">
          <div className="flex-1 flex flex-col items-center border-r border-gray-200">
            <span className="text-[9px] font-black text-gray-400 uppercase">
              Date
            </span>
            <span className="text-xs font-bold text-gray-700">
              {moment(booking.start_time).format("DD/MM/YYYY")}
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[9px] font-black text-gray-400 uppercase">
              Time Slot
            </span>
            <span className="text-xs font-bold text-gray-700">
              {moment(booking.start_time).format("HH:mm")} -{" "}
              {moment(booking.end_time).format("HH:mm")}
            </span>
          </div>
        </div>

        {/* ⚠️ Warning: ถ้าห้องปิดปรับปรุง (is_room_ready: false) */}
        {isConflict && (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3 animate-pulse">
            <AlertTriangle className="text-red-600 shrink-0" size={18} />
            <div>
              <p className="text-[10px] font-black text-red-600 uppercase mb-1">
                Room Alert!
              </p>
              <p className="text-[10px] text-red-500 font-bold leading-tight">
                ขออภัย ขณะนี้ห้องอยู่ในสถานะ "{booking.room_current_status}"
                กรุณาติดต่อเจ้าหน้าที่
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {!isHistory && (
        <div className="px-6 pb-6 flex gap-2">
          {isConflict ? (
            <button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-100"
              //onClick={() => window.open("tel:1122")}
            >
              <MessageCircle size={16} />
              ติดต่อเจ้าหน้าที่
            </button>
          ) : (
            booking.status === "confirmed" && (
              <button
                onClick={() => onCancel(booking.id)}
                className="flex-1 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-xs font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all group"
              >
                <XCircle
                  size={16}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
                ยกเลิกการจอง
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCard;
