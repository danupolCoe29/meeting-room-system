import React, { useRef } from "react";
import { Calendar } from "lucide-react";

const DateSelector = ({ label, value, onChange, min, max }) => {
  const inputRef = useRef(null);

  // ฟังก์ชันจัด Format yyyy-mm-dd -> dd/mm/yyyy
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "เลือกวันที่";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="flex-1 min-w-[220px]">
      <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">
        {label}
      </label>

      <div
        className="relative cursor-pointer group"
        onClick={() => inputRef.current.showPicker()} // คลิกตรงไหนก็ได้ในกล่องเพื่อเปิดปฏิทิน
      >
        {/* ไอคอนปฏิทิน */}
        <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none z-10">
          <Calendar className="w-5 h-5 text-emerald-500" />
        </div>

        {/* ส่วนที่โชว์ให้ User เห็น (dd/mm/yyyy ถาวร) */}
        <div className="block w-full ps-12 p-3.5 bg-white border border-gray-200 text-gray-800 text-lg font-extrabold rounded-2xl shadow-sm group-hover:border-emerald-400 transition-all min-h-[54px] flex items-center">
          {formatDisplayDate(value)}
        </div>

        {/* Input จริงที่ถูกซ่อนไว้ (แต่ยังทำงานอยู่) */}
        <input
          ref={inputRef}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          required
          className="absolute inset-0 opacity-0 cursor-pointer" // ทำให้โปร่งใสแต่ทับเต็มพื้นที่
        />
      </div>
    </div>
  );
};

export default DateSelector;
