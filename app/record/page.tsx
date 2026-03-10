"use client";

import { useAuth } from "@/context/AuthContext";
import { getMonthlyAttendance } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// 날짜 유틸
const getLocalToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function RecordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const today = getLocalToday();
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [attendance, setAttendance] = useState<string[]>([]); //출석한 날짜배열

  // 미로그인 시 리다이렉트
  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />;

  // 날짜 유틸 추가
  const getYearMonth = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  // useEffect 추가 - 월 바뀔 때마다 출석 데이터 불러오기
  useEffect(() => {
    const fetchAttendance = async () => {
      if (loading || !user) return;
      const yearMonth = getYearMonth(calendarDate);
      const att = await getMonthlyAttendance(user.uid, yearMonth);
      setAttendance(att);
    };
    fetchAttendance();
  }, [user, loading, calendarDate]);
  // 달력 랜더링
  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    // 빈칸(1일 이전)
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty=${i}`} />);
    }
    // 날짜
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isAttended = attendance.includes(dateStr);
      const isToday = dateStr === today;
      days.push(
        <div key={d} className="flex items-center justify-center">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold
            ${isAttended ? "bg-[#E63946] text-white" : ""}
            ${isToday && !isAttended ? "border border-[#E63946] text-[#E63946]" : ""}
            ${!isAttended && !isToday ? "text-zinc-500" : ""}
          `}
          >
            {d}
          </div>
        </div>,
      );
    }
    return days;
  };
  if (loading) return <div className="min-h-screen bg-[#0a0a0a]"></div>;
  return (
    <main className="min-h-screen bg[#0a0a0a]">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">
          my <span className="text-[#E63946]">Records</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {new Date().toLocaleDateString("ko-KR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <div className="space-y-6">
        {/* 출석 달력 */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Attendance Month</h2>

          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
              className="text-zinc-400 hover:text-white transition text-xl font-bold px-2"
            >
              ‹
            </button>
            <p className="text-white font-black">{calendarDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}</p>
            <button
              onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
              className="text-zinc-400 hover:text-white transition text-xl font-bold px-2"
            >
              ›
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-xs text-zinc-600 font-bold">
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-y-2">{renderCalendar()}</div>
        </section>
      </div>
    </main>
  );
}
