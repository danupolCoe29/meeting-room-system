import React from "react";
import { Users } from "lucide-react";

const CompactParticipantsSelector = ({
  label,
  value,
  onChange,
  iconColor = "text-blue-500",
  min = 1,
  max = 100,
}) => {
  return (
    <div className="space-y-2 w-full">
      {/* Label สไตล์เดียวกับตัวเลือกวันที่และเวลา */}
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
        <Users size={14} className={iconColor} />
        {label || "จำนวนผู้เข้าประชุม"}
      </label>

      <div className="relative group">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl group-hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700 min-h-[56px] outline-none"
          placeholder="ระบุจำนวนคน"
        />

        {/* หน่วยนับด้านท้าย (Option: เพิ่มความชัดเจน) */}
        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
          คน
        </div>
      </div>
    </div>
  );
};

export default CompactParticipantsSelector;
