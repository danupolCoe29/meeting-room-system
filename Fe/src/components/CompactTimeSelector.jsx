import React from "react";
import { Clock, ChevronDown } from "lucide-react";

const CompactTimeSelector = ({
  label,
  value,
  onChange,
  iconColor = "text-blue-500",
  startHour = 8,
  endHour = 19,
}) => {
  // เจนรายการเวลาทุกๆ 30 นาที
  const allTimeSlots = [];
  for (let h = startHour; h <= endHour; h++) {
    const hour = String(h).padStart(2, "0");
    allTimeSlots.push(`${hour}:00`, `${hour}:30`);
  }

  return (
    <div className="space-y-2 w-full">
      {/* Label พร้อม Icon ตามสไตล์ที่คุณกำหนด */}
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
        <Clock size={14} className={iconColor} />
        {label || "เวลา"}
      </label>

      <div className="relative group">
        {/* Dropdown Select ที่ปรับแต่งให้ดูเหมือน Input ปกติ */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl group-hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700 appearance-none cursor-pointer min-h-[56px] outline-none"
        >
          {allTimeSlots.map((t) => (
            <option key={t} value={t}>
              {t} น.
            </option>
          ))}
        </select>

        {/* ไอคอนลูกศรชี้ลงเพื่อให้ User รู้ว่าเป็น Dropdown */}
        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-gray-400">
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );
};

export default CompactTimeSelector;
