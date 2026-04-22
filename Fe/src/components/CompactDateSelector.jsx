import React, { useRef } from "react";
import { Calendar } from "lucide-react";
import dayjs from "dayjs"; // ต้องมี dayjs สำหรับคำนวณ

const CompactDateSelector = ({
  label,
  value,
  onChange,
  min,
  maxDays, // 👈 เปลี่ยนจาก max (วันที่) เป็น maxDays (จำนวนวัน)
  iconColor = "text-emerald-500",
}) => {
  const inputRef = useRef(null);

  // คำนวณวันที่สูงสุดจากจำนวนวันที่กำหนด (นับจากวันนี้)
  const calculatedMaxDate = maxDays
    ? dayjs().add(maxDays, "day").format("YYYY-MM-DD")
    : null;

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "เลือกวันที่";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="space-y-2 w-full">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
        <Calendar size={14} className={iconColor} />
        {label || "วันที่ประชุม"}
      </label>

      <div
        className="relative cursor-pointer group"
        onClick={() => inputRef.current.showPicker()}
      >
        <div className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl  focus-within:ring-2 focus-within:ring-blue-500 transition-all font-bold text-gray-700 flex items-center min-h-[56px]">
          {formatDisplayDate(value)}
        </div>

        <input
          ref={inputRef}
          type="date"
          value={value}
          min={min}
          max={calculatedMaxDate} // 👈 ใช้วันที่ที่คำนวณได้
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
        />
      </div>
    </div>
  );
};

export default CompactDateSelector;
