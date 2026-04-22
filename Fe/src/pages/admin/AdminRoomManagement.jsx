import React, { useState, useEffect } from "react";
import {
  Plus,
  Settings2,
  Users,
  Hash,
  X,
  ChevronDown,
  EyeOff,
  AlertCircle,
  LayoutGrid,
} from "lucide-react";
import api from "../../services/api";
import Swal from "sweetalert2";

const AdminRoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const statusOptions = [
    {
      id: 1,
      name: "พร้อมใช้งาน",
      color: "bg-emerald-50 text-emerald-600",
      dot: "bg-emerald-500",
    },
    {
      id: 2,
      name: "ปิดปรับปรุง",
      color: "bg-red-50 text-red-600",
      dot: "bg-red-500",
    },
    {
      id: 3,
      name: "ระงับการใช้งาน",
      color: "bg-amber-50 text-amber-600",
      dot: "bg-amber-500",
    },
    {
      id: 4,
      name: "ซ่อนการแสดงผล",
      color: "bg-slate-100 text-slate-500",
      dot: "bg-slate-400",
    },
  ];

  const [formData, setFormData] = useState({
    room_name: "",
    capacity: "",
    color_code: "#3b82f6", // Default Blue
    status_id: 1,
  });

  const fetchRooms = async () => {
    try {
      const res = await api.get("/admin/rooms");
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        room_name: room.room_name,
        capacity: room.capacity,
        color_code: room.color_code,
        status_id: room.status_id,
      });
    } else {
      setEditingRoom(null);
      setFormData({
        room_name: "",
        capacity: "",
        color_code: "#3b82f6",
        status_id: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/admin/rooms/${editingRoom.id}`, formData);
      } else {
        await api.post("/admin/rooms", formData);
      }
      setIsModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "บันทึกข้อมูลเรียบร้อย",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-[32px]" },
      });
      fetchRooms();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err.response?.data?.error || "ไม่สามารถบันทึกข้อมูลได้",
        customClass: { popup: "rounded-[32px]" },
      });
    }
  };

  const handleQuickStatusUpdate = async (roomId, newStatusId) => {
    try {
      await api.patch(`/admin/rooms/${roomId}/status`, {
        status_id: parseInt(newStatusId),
      });
      fetchRooms();
      const statusName = statusOptions.find(
        (s) => s.id === parseInt(newStatusId),
      )?.name;
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
      Toast.fire({ icon: "success", title: `สถานะใหม่: ${statusName}` });
    } catch (err) {
      Swal.fire("Error", "อัปเดตสถานะไม่สำเร็จ", "error");
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="font-black text-slate-300 uppercase tracking-widest">
          Loading Rooms...
        </p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <LayoutGrid className="text-blue-600" size={32} />
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              Room <span className="text-blue-600">Assets</span>
            </h1>
          </div>
          <p className="text-slate-400 font-bold ml-1">
            จัดการทรัพยากรห้องประชุมและสถานะการให้บริการ
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[30px] font-black flex items-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95"
        >
          <Plus size={24} /> เพิ่มห้องประชุม
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room) => {
          const currentStatus =
            statusOptions.find((s) => s.id === room.status_id) ||
            statusOptions[0];

          return (
            <div
              key={room.id}
              className={`bg-white rounded-[48px] p-8 relative border-2 transition-all group flex flex-col h-full
                ${
                  room.status_id === 4
                    ? "opacity-60 grayscale border-dashed border-slate-200 bg-slate-50/50"
                    : "border-transparent hover:border-blue-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-blue-200/20"
                }`}
            >
              <div className="flex justify-between items-start mb-8">
                <div
                  className="w-16 h-16 rounded-[24px] shadow-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: room.color_code }}
                >
                  {room.status_id === 4 ? (
                    <EyeOff size={30} />
                  ) : (
                    <Hash size={30} />
                  )}
                </div>

                <div className="relative group/status">
                  <select
                    value={room.status_id}
                    onChange={(e) =>
                      handleQuickStatusUpdate(room.id, e.target.value)
                    }
                    className={`pl-4 pr-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest appearance-none border-none outline-none cursor-pointer transition-all shadow-sm ${currentStatus.color}`}
                  >
                    {statusOptions.map((opt) => (
                      <option
                        key={opt.id}
                        value={opt.id}
                        className="bg-white text-slate-800"
                      >
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"
                  />
                </div>
              </div>

              <div className="mb-8 flex-1">
                <h3 className="text-3xl font-black text-slate-800 truncate mb-2">
                  {room.room_name}
                </h3>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${currentStatus.dot} animate-pulse`}
                  />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {currentStatus.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-slate-500 font-black">
                  <Users size={18} className="text-blue-500" />
                  <span className="text-lg">{room.capacity}</span>
                  <span className="text-[10px] text-slate-300 uppercase mt-1">
                    Seats
                  </span>
                </div>

                <button
                  onClick={() => openModal(room)}
                  className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                >
                  <Settings2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Add/Edit Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[50px] overflow-hidden shadow-2xl border border-white">
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 leading-none">
                    {editingRoom ? "Edit" : "New"}{" "}
                    <span className="text-blue-600">Room</span>
                  </h2>
                  <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">
                    ตั้งค่ารายละเอียดห้องประชุม
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  <X size={24} className="text-slate-300" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em] ml-2">
                    Room Name
                  </label>
                  <input
                    className="w-full bg-slate-50 border-none rounded-3xl p-5 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="เช่น Executive Suite"
                    value={formData.room_name}
                    onChange={(e) =>
                      setFormData({ ...formData, room_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em] ml-2">
                      Capacity
                    </label>
                    <div className="relative">
                      <Users
                        size={18}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                      />
                      <input
                        type="number"
                        className="w-full bg-slate-50 border-none rounded-3xl p-5 pl-12 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                        value={formData.capacity}
                        onChange={(e) =>
                          setFormData({ ...formData, capacity: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em] ml-2">
                      Theme Color
                    </label>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-3xl h-[64px]">
                      <input
                        type="color"
                        className="w-12 h-10 rounded-xl cursor-pointer border-none p-0 bg-transparent"
                        value={formData.color_code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            color_code: e.target.value,
                          })
                        }
                      />
                      <span className="text-[10px] font-black text-slate-400 uppercase font-mono">
                        {formData.color_code}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-black py-6 rounded-[30px] shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-lg mt-4 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />{" "}
                  {editingRoom ? "Save Changes" : "Create Room"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoomManagement;
