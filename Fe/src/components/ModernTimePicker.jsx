import React, { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react"; // เพิ่มไอคอนสวยๆ

// สร้างตัวเลือกเวลา 00:00 - 23:30 (ทีละ 30 นาที)
const timeOptions = [];
for (let i = 0; i < 24; i++) {
  const hour = String(i).padStart(2, "0");
  timeOptions.push(`${hour}:00`, `${hour}:30`);
}

const ModernTimePicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1 min-w-[140px]" ref={dropdownRef}>
      <label className="block mb-2 text-sm font-bold text-gray-700 ml-1">
        {label}
      </label>

      {/* ส่วนแสดงเวลาที่เลือก (ปุ่มกดเปิด) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-emerald-300 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-emerald-500" />
          <span className="text-lg font-extrabold text-gray-900 tracking-tight">
            {value} <span className="text-xs font-bold text-gray-400">น.</span>
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* ส่วน Dropdown รายการเวลา (Card) */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl p-2 animate-fade-in-down overflow-hidden">
          <div className="max-h-60 overflow-y-auto pr-1 grid grid-cols-2 gap-1.5 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-transparent">
            {timeOptions.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => {
                  onChange(time);
                  setIsOpen(false);
                }}
                className={`p-3 text-center rounded-xl font-bold text-base transition-colors ${
                  value === time
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernTimePicker;
