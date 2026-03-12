"use client";

import AttendanceCalendar from "@/app/components/ui/AttendanceCalendar";
import HomeHeader from "@/app/components/ui/HomeHeader";
import { useAuthGuard } from "@/hooks/auth/useAuthGuard";
import { useDate } from "@/hooks/user/useDate";
import { useMyRecords } from "@/hooks/record/useMyRecords";
import { useTodayWod } from "@/hooks/wod/useTodayWod";
import { deleteWorkoutRecord } from "@/lib/firestore";
import { getLocalToday } from "@/lib/utils";
import { WorkoutRecord } from "@/types/wod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const getResultText = (record: WorkoutRecord) => {
  switch (record.wodType) {
    case "For Time":
      if (record.isDNF) return `DNF · ${record.rounds ?? 0}R ${record.reps ?? 0}reps`;
      const min = Math.floor((record.finishTime ?? 0) / 60);
      const sec = (record.finishTime ?? 0) % 60;
      return `${min}:${String(sec).padStart(2, "0")}`;
    case "AMRAP":
      if (record.hasTotalRepsOnly) return `${record.totalReps ?? 0} reps`;
      return `${record.rounds ?? 0}R ${record.reps ?? 0}reps`;
    case "EMOM":
      if (record.hasTotalRepsOnly) return `${record.totalReps ?? 0} reps`;
      return `Fail ${record.failCount ?? 0}`;
    default:
      return record.memo ?? "-";
  }
};

export default function RecordPage() {
  // 로그인 확인
  const { user, loading } = useAuthGuard();
  // 오늘 날짜 불러오기
  const { dateStr } = useDate();

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my" | "leaderboard">("my");

  //나의 기록 불러오기
  const { myRecords, recordsLoading, refetch } = useMyRecords(user?.uid ?? "");
  // const todayRecords = myRecords.filter((record) => record.completedAt === getLocalToday() && record.wodId === todayWod?.id);
  const { wod: todayWod } = useTodayWod();
  const todayRecords = useMemo(() => {
    if (!todayWod) return [];
    return myRecords.filter((record) => record.completedAt === getLocalToday() && record.wodId === todayWod.id);
  }, [myRecords, todayWod]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 mb-16">
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
      {/* 탭 */}
      <div className="flex gap-2 mt-3">
        {[
          { key: "my", label: "내 기록" },
          { key: "leaderboard", label: "리더보드" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "my" | "leaderboard")}
            className={`px-3 py-2 rounded-xl text-sm font-black border transition ${
              activeTab === tab.key ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* 내 기록 */}
      {activeTab === "my" && (
        <div className="space-y-3">
          {recordsLoading && <div className="text-zinc-500 text-sm text-center py-10">불러오는 중...</div>}
          {!recordsLoading && todayRecords.length === 0 && <div className="text-zinc-500 text-sm text-center py-10">기록이 없어요</div>}
          {todayRecords.map((record) => (
            <div key={record.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
              {/* 날짜 + 와드명 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">{record.completedAt}</span>
                <button onClick={() => router.push(`/record/edit/${record.id}`)} className="text-zinc-600 hover:text-white text-xs transition">
                  수정
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("기록을 삭제할까요?")) return;
                    await deleteWorkoutRecord(record.id);
                    refetch();
                  }}
                  className="text-zinc-600 hover:text-red-500 text-xs transition"
                >
                  삭제
                </button>
              </div>

              <div className="text-white font-black text-base">{record.wodName}</div>

              {/* 파트 + 타입 뱃지 */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#E63946] border border-[#E63946] px-2 py-0.5 rounded-full">{record.wodPart}</span>
                <span className="text-xs font-bold text-[#E63946] border border-[#E63946] px-2 py-0.5 rounded-full">{record.wodType}</span>
                {record.wodTeam && <span className="text-xs font-bold text-[#E63946] border border-[#E63946] px-2 py-0.5 rounded-full">Team</span>}
                <span className="text-xs font-bold text-[#E63946] border border-[#E63946] px-2 py-0.5 rounded-full">{record.level}</span>
              </div>

              {/* 결과 */}
              <div className="text-2xl font-black text-white">{getResultText(record)}</div>

              {/* 무게 */}
              {record.weights?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {record.weights.map((w, i) => (
                    <span key={i} className="text-xs bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-400">
                      {w.tool} {w.weight}
                      {w.unit}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}{" "}
      {/* 리더보드 탭 */}
      {activeTab === "leaderboard" && <div>리더보드</div>}
    </main>
  );
}
