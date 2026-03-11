"use client";

import AttendanceCalendar from "@/app/components/ui/AttendanceCalendar";
import HomeHeader from "@/app/components/ui/HomeHeader";
import { useAuth } from "@/context/AuthContext";
import { useDate } from "@/hooks/useDate";
import { useRouter } from "next/navigation";

export default function RecordPage() {
  // 로그인 확인
  const { user, loading } = useAuth();
  // 오늘 날짜 불러오기
  const { dateStr } = useDate();

  const router = useRouter();

  if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <main className="min-h-screen bg[#0a0a0a] px-4">
      <HomeHeader />

      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">
          My <span className="text-[#E63946]">Records</span>
        </h1>
        <p className="text-zinc-500 text-sm">{dateStr}</p>
      </div>

      {/* 월간 출석 보드 */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">이번 달</h2>
          <span className="text-xs text-zinc-500">{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}</span>
        </div>
        {user && <AttendanceCalendar userId={user.uid} />}
      </section>
    </main>
  );
}
