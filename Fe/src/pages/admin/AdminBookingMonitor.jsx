import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Trash2,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Edit3,
} from "lucide-react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import socket from "../../services/socket";
import api from "../../services/api";
import AdminBookingEditModal from "../../components/AdminBookingEditModal";

const AdminBookingMonitor = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [allRooms, setAllRooms] = useState([]);
  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/bookings", {
        params: { date: filterDate },
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      // ดึงรายชื่อห้องทั้งหมดมาเก็บไว้
      const resRooms = await api.get("/rooms");
      setAllRooms(resRooms.data);

      // ดึงข้อมูลการจอง (ถ้ามีฟังก์ชันนี้อยู่แล้ว)
      fetchAllBookings();
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAllBookings();
    socket.on("booking_updated", fetchAllBookings);
    return () => socket.off("booking_updated");
  }, [filterDate]);

  const handleCancelBooking = async (bookingId) => {
    const result = await Swal.fire({
      title: "ยืนยันการยกเลิก?",
      text: "รายการจองนี้จะถูกยกเลิกและคืนพื้นที่ในตาราง",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "ใช่, ยกเลิกเลย",
      cancelButtonText: "ปิด",
      customClass: { popup: "rounded-[32px]" },
    });

    if (result.isConfirmed) {
      try {
        // ส่งคำสั่ง Update Status ไปยัง Backend
        await api.patch(`/admin/bookings/${bookingId}/cancel`);

        Swal.fire({
          icon: "success",
          title: "ยกเลิกเรียบร้อย",
          timer: 1000,
          showConfirmButton: false,
          customClass: { popup: "rounded-[32px]" },
        });

        fetchAllBookings(); // รีโหลดตาราง Admin
      } catch (err) {
        Swal.fire("Error", "ไม่สามารถยกเลิกได้", "error");
      }
    }
  };

  // กรองข้อมูลใน Client-side สำหรับ Search
  const filteredBookings = bookings.filter(
    (b) =>
      b.booker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.room_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (bookingId, updatedData) => {
    debugger;
    try {
      await api.put(`/admin/bookings/${bookingId}`, updatedData);
      setIsEditModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchAllBookings(); // รีโหลดข้อมูลใหม่
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "แก้ไขไม่สำเร็จ",
        "error",
      );
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Booking <span className="text-blue-600">Monitor</span>
            </h1>
            <p className="text-gray-500 font-medium">
              ตรวจสอบและจัดการรายการจองห้องประชุมทั้งหมด
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้จอง, ห้อง..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <input
              type="date"
              className="px-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-600"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">
                    ข้อมูลการจอง
                  </th>
                  <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                    ห้อง
                  </th>
                  <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                    จำนวนคน
                  </th>
                  <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">
                    ผู้จอง
                  </th>
                  <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">
                    สถานะ
                  </th>
                  <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-lg">
                          {b.title}
                        </span>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />{" "}
                            {dayjs(b.start_time).format("DD MMM YYYY")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />{" "}
                            {dayjs(b.start_time).format("HH:mm")} -{" "}
                            {dayjs(b.end_time).format("HH:mm")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span
                        className="px-4 py-1.5 rounded-full text-white text-xs font-black shadow-sm"
                        style={{ backgroundColor: b.color_code }}
                      >
                        {b.room_name}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-xl">
                          <User size={14} className="text-gray-500" />
                          <span className="font-black text-gray-700">
                            {b.participants || 0}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                          Persons
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <User size={16} />
                        </div>
                        <span className="font-bold text-gray-700">
                          {b.booker_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      {(() => {
                        const isPast = new Date(b.end_time) < new Date(); // เช็กว่าหมดเวลาหรือยัง

                        if (b.status === "cancelled") {
                          return (
                            <span className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold">
                              Cancelled
                            </span>
                          );
                        }

                        if (isPast) {
                          return (
                            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold">
                              Completed
                            </span>
                          );
                        }

                        return (
                          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold">
                            Confirmed
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        {(() => {
                          const isPast = new Date(b.end_time) < new Date();
                          const isCancelled = b.status === "cancelled";

                          // 🛑 กรณีที่ห้ามแก้ไข: ถูกยกเลิกไปแล้ว หรือ เวลาผ่านไปแล้ว
                          if (isCancelled || isPast) {
                            return (
                              <span className="text-gray-300 p-3 italic text-[10px] font-black uppercase tracking-widest bg-gray-50 rounded-xl">
                                {isCancelled
                                  ? "Locked (Cancelled)"
                                  : "Locked (Finished)"}
                              </span>
                            );
                          }

                          // ✅ กรณีที่ยังแก้ไขได้: ยังไม่ถูกยกเลิก และ ยังไม่หมดเวลา
                          return (
                            <>
                              <button
                                onClick={() => handleEditClick(b)}
                                className="p-3 text-gray-300 hover:text-blue-500 hover:bg-blue-100 rounded-2xl transition-all shadow-sm hover:shadow-md"
                                title="แก้ไขการจอง"
                              >
                                <Edit3 size={20} />
                              </button>

                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-100 rounded-2xl transition-all shadow-sm hover:shadow-md"
                                title="ยกเลิกการจอง"
                              >
                                <Trash2 size={20} />
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBookings.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="text-gray-200" size={40} />
                </div>
                <p className="text-gray-400 font-bold">
                  ไม่พบรายการจองในช่วงเวลานี้
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <AdminBookingEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        booking={editingBooking}
        allRooms={allRooms}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default AdminBookingMonitor;
