"use client";
import { useRouter } from "next/navigation";
import WodCard from "@/app/components/ui/WodCard";
import HomeHeader from "@/app/components/ui/HomeHeader";
import { useAuthGuard } from "@/hooks/auth/useAuthGuard";
import { useTodayWod } from "@/hooks/wod/useTodayWod";
import AttendanceCalendar from "@/app/components/ui/AttendanceCalendar";
import { useDate } from "@/hooks/user/useDate";

export default function Home() {
  const router = useRouter();

  // 로그인 훅
  const { user, loading } = useAuthGuard();
  // wod 데이터 불러오기
  const { wod, wodLoading } = useTodayWod();
  // 오늘 날짜 불러오기
  const { dateStr } = useDate();

  if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4  pb-24">
      <HomeHeader />
      {/* 헤더 */}
      <div className="mb-6">
        <p className="text-zinc-500 text-sm">{dateStr}</p>

        <h1 className="text-2xl font-black text-white mt-1">안녕하세요 👋</h1>
      </div>

      {/* WOD 카드 */}
      <section>
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Today&apos;s WOD</h2>
        {wodLoading ? (
          <div className="bg-zinc-900 rounded-2xl h-48 animate-pulse" />
        ) : wod && wod.parts ? (
          <WodCard wod={wod} />
        ) : (
          <div className="bg-zinc-900 rounded-2xl p-5 text-zinc-500 text-sm text-center">오늘의 WOD가 아직 등록되지 않았어요 😢</div>
        )}
      </section>
      {/* 월간 출석 보드 */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">이번 달</h2>
          <span className="text-xs text-zinc-500">{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}</span>
        </div>
        {user && <AttendanceCalendar userId={user.uid} />}
      </section>
      {/* 공지 카드 */}
      {wod?.note && (
        <section className="mt-6">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">📢 Notice</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{wod.note}</p>
          </div>
        </section>
      )}
    </main>
  );
}
