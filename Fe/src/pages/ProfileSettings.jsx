import React, { useState } from "react";

import { User, Key, Save } from "lucide-react";
import api from "../services/api";

const ProfileSettings = ({ user, setUser }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [newPassword, setNewPassword] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/users/update-profile", {
        fullName,
        newPassword,
      });
      // อัปเดต State และ LocalStorage
      const updatedUser = { ...user, fullName: res.data.fullName };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("อัปเดตข้อมูลสำเร็จ!");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัปเดต");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-3xl font-black mb-8">ตั้งค่าโปรไฟล์</h2>
      <form
        onSubmit={handleUpdate}
        className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 space-y-6"
      >
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400 ml-1">
            ชื่อ-นามสกุล
          </label>
          <div className="relative">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              size={20}
            />
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400 ml-1">
            เปลี่ยนรหัสผ่านใหม่ (ปล่อยว่างถ้าไม่เปลี่ยน)
          </label>
          <div className="relative">
            <Key
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              size={20}
            />
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
        >
          <Save size={20} /> บันทึกการเปลี่ยนแปลง
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
