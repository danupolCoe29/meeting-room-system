import React, { useState, useEffect } from "react";
import { History, Inbox, AlertCircle } from "lucide-react";
import api from "../services/api";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import BookingCard from "../components/BookingCard"; // นำเข้าคอมโพเนนต์ที่สร้างใหม่

const socket = io("http://localhost:3000");

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchMyBookings = async () => {
    try {
      // 💡 สำคัญ: Backend ต้อง JOIN room_status_master ส่ง is_bookable มาด้วย
      const res = await api.get("/users/my-bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();

    socket.on("booking_updated", () => {
      fetchMyBookings();
    });

    return () => {
      socket.off("booking_updated");
    };
  }, []);

  const handleCancel = async (bookingId) => {
    const result = await Swal.fire({
      title: "ยืนยันการยกเลิก?",
      text: "คุณจะไม่สามารถย้อนกลับรายการนี้ได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ใช่, ยกเลิกเลย!",
      cancelButtonText: "ปิดหน้าต่าง",
      customClass: {
        popup: "rounded-[32px]",
        confirmButton: "rounded-2xl px-6 py-3 font-black",
        cancelButton: "rounded-2xl px-6 py-3 font-black",
      },
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/book/${bookingId}`);
        Swal.fire({
          icon: "success",
          title: "ยกเลิกสำเร็จ!",
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "rounded-[32px]" },
        });
        fetchMyBookings();
      } catch (err) {
        Swal.fire("Error", "ไม่สามารถยกเลิกได้", "error");
      }
    }
  };

  const now = new Date();

  // แยกรายการที่จะมาถึง
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.end_time) >= now && b.status === "confirmed",
  );

  // แยกประวัติการจอง
  const historyBookings = bookings.filter(
    (b) => new Date(b.end_time) < now || b.status === "cancelled",
  );

  const displayBookings =
    activeTab === "upcoming" ? upcomingBookings : historyBookings;

  if (loading)
    return (
      <div className="p-10 text-center font-bold text-gray-400 animate-pulse">
        กำลังโหลดข้อมูล...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans bg-gray-50/50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          การจองของฉัน
        </h1>
        <p className="text-gray-500 font-bold mt-2">
          จัดการและตรวจสอบสถานะการเข้าใช้งานห้องประชุมของคุณ
        </p>
      </header>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-8 bg-white p-2 rounded-[28px] w-fit shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-2 px-8 py-3 rounded-[22px] font-black text-sm transition-all ${
            activeTab === "upcoming"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Inbox size={18} />
          รายการที่จะมาถึง ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-8 py-3 rounded-[22px] font-black text-sm transition-all ${
            activeTab === "history"
              ? "bg-gray-800 text-white shadow-lg shadow-gray-200"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <History size={18} />
          ประวัติการจอง ({historyBookings.length})
        </button>
      </div>

      {displayBookings.length === 0 ? (
        <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-gray-100 shadow-sm">
          <AlertCircle className="text-gray-100 mx-auto mb-4" size={64} />
          <p className="text-gray-400 font-black text-xl">
            ไม่พบรายการข้อมูลในส่วนนี้
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              // 🚩 ส่ง ID ของการจอง และระบุว่าเป็นการดึงประวัติเพื่อปรับ UI ภายใน Card
              onCancel={() => handleCancel(booking.id)}
              isHistory={activeTab === "history"}
              onViewDetails={() => setSelectedBooking(booking)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
