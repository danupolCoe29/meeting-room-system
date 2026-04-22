import React, { useMemo } from "react";
import Swal from "sweetalert2";
import { AlertTriangle, Clock } from "lucide-react"; // เพิ่ม Clock icon

const DailyTimeline = ({ rooms, bookings, selectedDate, onSlotClick }) => {
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 8; h <= 18; h++) {
      const hour = String(h).padStart(2, "0");
      slots.push(`${hour}:00`, `${hour}:30`);
    }
    return slots;
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const handleStatusClick = (room, isConflict, isPast) => {
    // ถ้าเป็นเวลาที่ผ่านมาแล้ว ไม่ต้องโชว์ Alert อะไรเป็นพิเศษ หรือโชว์สั้นๆ
    if (isPast) return;

    Swal.fire({
      icon: isConflict ? "warning" : "info",
      title: isConflict ? "มีปัญหาการจองซ้อน!" : room.status_name_th,
      text: isConflict
        ? `ห้องนี้ถูกปิดปรับปรุงกระทันหันในช่วงที่มีการจองไว้ กรุณาติดต่อ Admin เพื่อย้ายห้อง`
        : `ขออภัย ห้อง ${room.room_name} อยู่ในสถานะ: ${room.status_name_th}`,
      confirmButtonColor: isConflict ? "#ef4444" : "#10b981",
      customClass: { popup: "rounded-[32px]" },
    });
  };

  return (
    <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col">
      <div className="overflow-auto max-h-[75vh] md:max-h-[800px] custom-scrollbar">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="sticky top-0 z-40 shadow-sm">
              <th className="sticky left-0 top-0 z-50 bg-gray-100 p-6 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest border-b border-r border-gray-200 w-24">
                เวลา
              </th>
              {rooms.map((room) => {
                const roomId = room.room_id || room.id;
                return (
                  <th
                    key={`head-${roomId}`}
                    className="sticky top-0 z-30 p-6 text-center border-b border-l border-gray-100 bg-gray-50/95 backdrop-blur-sm"
                  >
                    <span className="text-sm font-black text-gray-700 block truncate">
                      {room.room_name}
                    </span>
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full text-white font-black uppercase tracking-tighter"
                        style={{
                          backgroundColor: room.color_code_status || "#10b981",
                        }}
                      >
                        {room.status_name_th || "Available"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        Cap: {room.capacity}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {timeSlots.map((slot) => (
              <tr key={`row-${slot}`} className="group">
                <td className="sticky left-0 z-20 p-4 text-xs font-black text-gray-500 bg-white group-hover:bg-gray-50 transition-colors text-center border-r border-b border-gray-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                  {slot}
                </td>

                {rooms.map((room) => {
                  const roomId = room.room_id || room.id;
                  const canBook = room.is_bookable;
                  const slotDateTime = new Date(`${selectedDate}T${slot}`);
                  const isPast = slotDateTime < new Date();

                  const isBooked = bookings.find((b) => {
                    if (!b.booking_id) return false;
                    const sameRoom = String(b.room_id) === String(roomId);
                    const bStart = formatTime(b.start_time);
                    const bEnd = formatTime(b.end_time);
                    return sameRoom && slot >= bStart && slot < bEnd;
                  });

                  // --- ส่วนที่ปรับปรุง: การแสดงผลช่องที่จองไม่ได้ ---
                  if (!canBook || isPast) {
                    return (
                      <td
                        key={`cell-${roomId}-${slot}`}
                        className={`p-1 border-l border-b border-gray-50 relative h-16 ${isPast ? "bg-gray-100/30" : "bg-gray-50/50"}`}
                      >
                        <div
                          onClick={() =>
                            handleStatusClick(room, !!isBooked, isPast)
                          }
                          className={`h-full w-full flex items-center justify-center relative ${isPast ? "cursor-default" : "cursor-pointer"}`}
                        >
                          {/* ลายทแยงสำหรับช่อง Maintenance */}
                          {!isPast && (
                            <div
                              className="w-full h-full opacity-10"
                              style={{
                                backgroundColor: room.color_code_status,
                              }}
                            ></div>
                          )}

                          {isBooked ? (
                            <div
                              className={`absolute inset-0 flex flex-col items-center justify-center border-2 ${isPast ? "bg-gray-200/50 border-gray-300" : "bg-red-100/40 border-red-500/50 animate-pulse"}`}
                            >
                              {isPast ? (
                                <span className="text-[8px] font-black text-gray-400 uppercase">
                                  Expired
                                </span>
                              ) : (
                                <>
                                  <AlertTriangle
                                    size={14}
                                    className="text-red-600 mb-0.5"
                                  />
                                  <span className="text-[8px] font-black text-red-700">
                                    CONFLICT
                                  </span>
                                </>
                              )}
                            </div>
                          ) : isPast ? (
                            // ไอคอนเวลาสำหรับช่องที่ผ่านมาแล้ว
                            <Clock size={14} className="text-gray-200" />
                          ) : (
                            <div className="w-full h-[1px] bg-gray-300 rotate-12 absolute"></div>
                          )}
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={`cell-${roomId}-${slot}`}
                      className="p-1 border-l border-b border-gray-50 relative h-16"
                    >
                      {isBooked ? (
                        <div
                          className="h-full w-full bg-white flex flex-col items-center justify-center overflow-hidden border-l-4"
                          style={{
                            borderColor: room.color_code_room || "#ef4444", // สีขอบตามสีห้อง
                            backgroundColor: `${room.color_code_room}08`, // สีพื้นหลังจางๆ (ความใส 8%)
                          }}
                        >
                          <span
                            className="text-[9px] font-black uppercase"
                            style={{ color: room.color_code_room }}
                          >
                            Reserved
                          </span>
                          <span className="text-[8px] text-gray-500 truncate px-1 font-bold">
                            {isBooked.booker_name || "Booked"}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onSlotClick(room, slot)}
                          className="h-full w-full transition-all cursor-pointer flex items-center justify-center group/btn active:opacity-70"
                          style={{ "--hover-bg": `${room.color_code_room}15` }} // สร้าง CSS variable สำหรับสีจางๆ
                        >
                          <div
                            className="opacity-0 group-hover/btn:opacity-100 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg transition-all transform scale-90 group-hover/btn:scale-100"
                            style={{
                              backgroundColor:
                                room.color_code_room || "#10b981",
                              boxShadow: `0 10px 15px -3px ${room.color_code_room}40`, // เงาสีเดียวกับห้อง
                            }}
                          >
                            + จอง
                          </div>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyTimeline;
