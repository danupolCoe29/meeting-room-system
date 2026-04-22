import React, { useState, useEffect } from "react";
import { Download, Search, FileText, ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import api from "../../services/api";
import DateSelector from "../../components/DateSelector";

const AdminReport = () => {
  const [reportData, setReportData] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
    room_id: "",
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/report", { params: filters });
      setReportData(res.data);
    } catch (err) {
      console.error("Fetch Report Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/rooms").then((res) => setAllRooms(res.data));
    fetchReport();
  }, []);

  const exportToExcel = () => {
    if (reportData.length === 0) return;

    const dataForExport = reportData.map((item, index) => ({
      ลำดับ: index + 1,
      หัวข้อ: item.title,
      ห้องประชุม: item.room_name,
      ผู้จอง: item.booker_name,
      วันที่: dayjs(item.start_time).format("DD/MM/YYYY"),
      เวลาเริ่ม: dayjs(item.start_time).format("HH:mm"),
      เวลาสิ้นสุด: dayjs(item.end_time).format("HH:mm"),
      จำนวนคน: item.participants,
      "ระยะเวลา (ชั่วโมง)": parseFloat(item.duration_hours).toFixed(2),
      สถานะ: item.status === "confirmed" ? "ปกติ" : "ยกเลิก",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Meeting_Report");
    XLSX.writeFile(
      workbook,
      `Report_${filters.startDate}_to_${filters.endDate}.xlsx`,
    );
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
              Booking <span className="text-blue-600">Reports</span>
            </h1>
            <p className="text-gray-400 font-bold mt-2">
              ตรวจสอบและส่งออกข้อมูลการใช้งานห้องประชุมรายเดือน
            </p>
          </div>
          <button
            onClick={exportToExcel}
            disabled={reportData.length === 0}
            className="flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-3xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:shadow-none active:scale-95"
          >
            <Download size={22} /> Export to Excel
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-wrap lg:flex-nowrap gap-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <DateSelector
                label="วันที่เริ่มต้น"
                value={filters.startDate}
                onChange={(val) => setFilters({ ...filters, startDate: val })}
                max={filters.endDate}
                iconColor="text-blue-600"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <DateSelector
                label="ถึงวันที่"
                value={filters.endDate}
                onChange={(val) => setFilters({ ...filters, endDate: val })}
                min={filters.startDate}
                iconColor="text-blue-600"
              />
            </div>

            <div className="flex-[1.5] min-w-[240px]">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                เลือกห้องประชุม
              </label>
              <div className="relative">
                <select
                  className="w-full h-[58px] ps-6 bg-gray-50 border-none text-gray-800 text-lg font-black rounded-3xl focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer outline-none transition-all"
                  value={filters.room_id}
                  onChange={(e) =>
                    setFilters({ ...filters, room_id: e.target.value })
                  }
                >
                  <option value="">ทั้งหมดทุกห้อง</option>
                  {allRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.room_name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={20}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            <button
              onClick={fetchReport}
              className="h-[58px] bg-gray-900 text-white px-10 rounded-3xl font-black hover:bg-black transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <Search size={20} /> ค้นหาข้อมูล
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="p-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    ข้อมูลการจอง
                  </th>
                  <th className="p-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    ห้อง
                  </th>
                  <th className="p-8 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                    จำนวนคน
                  </th>
                  <th className="p-8 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                    ระยะเวลา
                  </th>
                  <th className="p-8 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-24 text-center">
                      <div className="animate-pulse flex flex-col items-center">
                        <FileText size={40} className="text-blue-200 mb-4" />
                        <span className="text-gray-400 font-black">
                          กำลังรวบรวมรายงาน...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : reportData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-24 text-center">
                      <div className="flex flex-col items-center">
                        <Search size={40} className="text-gray-100 mb-4" />
                        <span className="text-gray-300 font-black">
                          ไม่พบข้อมูลรายงานในช่วงเวลานี้
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reportData.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/30 transition-all group"
                    >
                      <td className="p-8">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-xl group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </span>
                          <span className="text-xs font-bold text-gray-400 mt-2 bg-gray-50 self-start px-2 py-1 rounded-md">
                            {dayjs(item.start_time).format("DD MMM YYYY")} •{" "}
                            {dayjs(item.start_time).format("HH:mm")} -{" "}
                            {dayjs(item.end_time).format("HH:mm")}
                          </span>
                          <span className="text-[10px] text-gray-300 font-black uppercase mt-2 tracking-widest">
                            Booked by: {item.booker_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                          {item.room_name}
                        </span>
                      </td>
                      <td className="p-8 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xl font-black text-gray-700">
                            {item.participants}
                          </span>
                          <span className="text-[10px] font-black text-gray-300 uppercase">
                            Persons
                          </span>
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xl font-black text-blue-600">
                            {parseFloat(item.duration_hours).toFixed(1)}
                          </span>
                          <span className="text-[10px] font-black text-gray-300 uppercase">
                            Hours
                          </span>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <span
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                            item.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-red-50 text-red-600 border border-red-100"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        {reportData.length > 0 && (
          <div className="mt-8 flex justify-end">
            <div className="bg-white px-10 py-6 rounded-[32px] border border-gray-100 shadow-2xl shadow-gray-200/50 flex items-center gap-12">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
                  ยอดรวมการจอง
                </span>
                <span className="text-3xl font-black text-gray-800">
                  {reportData.length}{" "}
                  <span className="text-sm font-bold text-gray-400">Items</span>
                </span>
              </div>
              <div className="w-[1px] h-12 bg-gray-100" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
                  รวมชั่วโมงการใช้งาน
                </span>
                <span className="text-3xl font-black text-blue-600">
                  {reportData
                    .reduce(
                      (acc, curr) => acc + parseFloat(curr.duration_hours),
                      0,
                    )
                    .toFixed(1)}{" "}
                  <span className="text-sm font-bold text-gray-400">Hours</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReport;
