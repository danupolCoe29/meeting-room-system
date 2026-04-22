import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Shield, Info } from "lucide-react";

// Import Custom Components
import DateSelector from "../components/DateSelector";
import DailyTimeline from "../components/DailyTimeline";
import BookingModal from "../components/BookingModal";
import api from "../services/api";
import Swal from "sweetalert2";
import socket from "../services/socket";

// เชื่อมต่อ Socket.io
// const socket = io("http://localhost:3000");

function BookingPage() {
  // --- States ---
  const today = new Date().toLocaleDateString("en-CA");
  const [maxDays, setMaxDays] = useState(30);
  const [searchDate, setSearchDate] = useState(today);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [allRooms, setAllRooms] = useState([]); // Master List ของห้องทั้งหมด
  const [dailyBookings, setDailyBookings] = useState([]); // ข้อมูลการจองรายวัน

  // --- Functions ---

  // 1. ดึงข้อมูลพื้นฐาน (ครั้งเดียวตอน Load)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const config = await api.get("/settings");
        if (config.data.max_booking_days)
          setMaxDays(parseInt(config.data.max_booking_days));

        // ดึงรายชื่อห้องทั้งหมดเพื่อใช้เป็น "แกนหลัก" ของตาราง Timeline
        const resRooms = await api.get("/rooms");
        const visibleRooms = resRooms.data.filter(
          (room) => room.status_id !== 4,
        );
        setAllRooms(visibleRooms);
      } catch (err) {
        console.error("Initial load error:", err);
      }
    };
    fetchInitialData();
  }, []);

  // 2. ดึงข้อมูลการจอง (เรียกเมื่อเปลี่ยนวันที่ หรือมีการอัปเดต Real-time)
  const fetchTimelineData = async () => {
    try {
      const res = await api.get("/bookings-by-date", {
        params: { date: searchDate },
      });
      // เก็บข้อมูลดิบทั้งหมดที่ Backend ส่งมา (ที่มีทั้งรายละเอียดห้องและข้อมูลการจอง)
      setDailyBookings(res.data);
    } catch (err) {
      console.error("Timeline error:", err);
    }
  };

  // 3. จัดการ Real-time Sync
  useEffect(() => {
    fetchTimelineData();

    // ฟังก์ชันดึงข้อมูลห้องใหม่ (กรณี Admin แก้ไขข้อมูลห้อง)
    const refreshRooms = async () => {
      try {
        const res = await api.get("/rooms");
        const visibleRooms = res.data.filter((room) => room.status_id !== 4);
        setAllRooms(visibleRooms);
      } catch (err) {
        console.error(err);
      }
    };

    // เมื่อมีการอัปเดต (ทั้งการจอง และ ข้อมูลห้อง) ให้ดึงใหม่ทั้งคู่
    socket.on("booking_updated", () => {
      fetchTimelineData();
      refreshRooms(); // 🚀 เพิ่มบรรทัดนี้เพื่อให้ชื่อห้องหรือสถานะห้องอัปเดต Real-time
    });

    return () => socket.off("booking_updated");
  }, [searchDate]);

  // 4. เมื่อคลิกที่ช่องว่างใน Timeline
  const handleTimelineClick = (room, slot) => {
    const now = new Date();
    const selectedDateTime = new Date(`${searchDate}T${slot}`);

    if (selectedDateTime < now) {
      Swal.fire({
        icon: "warning",
        title: "ไม่สามารถจองย้อนหลังได้",
        text: "กรุณาเลือกช่วงเวลาที่เป็นปัจจุบันหรืออนาคต",
        confirmButtonColor: "#f59e0b",
        customClass: { popup: "rounded-[32px]" },
      });
      return; // หยุดการทำงาน ไม่เปิด Modal
    }

    setSelectedRoom(room);
    setStartTime(slot);

    // ตั้งเวลาจบ Default (+1 ชม.)
    const [h, m] = slot.split(":").map(Number);
    const endH = m === 30 ? h + 1 : h;
    const endM = m === 30 ? "00" : "30";
    setEndTime(`${String(endH).padStart(2, "0")}:${endM}`);

    setIsModalOpen(true);
  };

  // 5. ส่งข้อมูลการจองไปยัง Backend
  const handleConfirmBooking = async (formData) => {
    // ใช้ searchDate จากหน้าตารางร่วมกับเวลาที่เลือก
    const startISO = new Date(`${searchDate}T${startTime}`).toISOString();
    const endISO = new Date(`${searchDate}T${endTime}`).toISOString();

    try {
      await api.post("/book", {
        // รองรับทั้งชื่อ field id หรือ room_id
        roomId: formData.selectedRoom.room_id || formData.selectedRoom.id,
        startTime: startISO,
        endTime: endISO,
        title: formData.title,
        bookerName: formData.bookerName,
        participants: formData.participants,
      });

      setIsModalOpen(false);
      await Swal.fire({
        icon: "success",
        title: "จองห้องประชุมสำเร็จ!",
        confirmButtonColor: "#10b981",
        customClass: { popup: "rounded-[32px]" },
      });

      return true;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "จองไม่สำเร็จ",
        text: err.response?.data?.error || "เกิดข้อผิดพลาด",
        customClass: { popup: "rounded-[32px]" },
      });
      return false;
    }
  };

  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + maxDays);
  const maxDateLimit = maxDateObj.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tight mb-3">
              Meeting <span className="text-emerald-600">Scheduler</span>
            </h1>
            <p className="text-gray-500 font-medium text-lg italic">
              "คลิกที่ช่วงเวลาว่างในตารางเพื่อทำการจองห้องประชุมทันที"
            </p>
          </div>

          <div className="w-full md:w-72 bg-white p-2 rounded-[24px] shadow-xl shadow-gray-200/50">
            <DateSelector
              label="เลือกดูวันที่"
              value={searchDate}
              min={today}
              max={maxDateLimit}
              onChange={setSearchDate}
            />
          </div>
        </header>

        {/* --- Main Timeline Section --- */}
        <main className="mb-10">
          <div className="flex items-center gap-3 mb-6 ml-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-gray-700 uppercase tracking-wider">
              Live Availability
            </h2>
          </div>

          <DailyTimeline
            rooms={allRooms} // ใช้ Master List เพื่อให้หัวตารางมาครบทุกห้อง
            bookings={dailyBookings} // ส่งข้อมูลการจองรายวัน
            selectedDate={searchDate}
            onSlotClick={handleTimelineClick}
          />
        </main>
      </div>

      {/* --- Booking Form Modal --- */}
      {isModalOpen && selectedRoom && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRoom(null);
          }}
          room={selectedRoom}
          setRoom={setSelectedRoom}
          allRooms={allRooms}
          date={searchDate}
          onChangeDate={setSearchDate}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
}

export default BookingPage;
