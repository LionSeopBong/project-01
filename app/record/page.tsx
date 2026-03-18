"use client";

import AttendanceCalendar from "@/app/components/ui/AttendanceCalendar";
import HomeHeader from "@/app/components/ui/HomeHeader";
import { useAuthGuard } from "@/hooks/auth/useAuthGuard";
import { useDate } from "@/hooks/user/useDate";
import { useMyRecords } from "@/hooks/record/useMyRecords";
import { deleteWorkoutRecord } from "@/lib/firestore";
import { getLocalToday } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useWodByDate } from "@/hooks/wod/useWodByDate";
import { useLeaderboard } from "@/hooks/record/useLeaderBoard";
import { getResultText, getSortedRecords, getLevelColor } from "@/lib/utils";
import { useMyPrRecords } from "@/hooks/record/useMyPrRecords";
import AthleteRadar from "@/app/components/ui/AthleteRadar";

export default function RecordPage() {
  // 로그인 확인
  const { user, loading } = useAuthGuard();
  // 오늘 날짜 불러오기
  const { dateStr } = useDate();

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my" | "leaderboard_men" | "leaderboard_women">("my");
  const [selectedDate, setSelectedDate] = useState(getLocalToday());
  //나의 기록 불러오기
  const { myRecords, recordsLoading, refetch } = useMyRecords(user?.uid ?? "");
  const { wod: selectedWod } = useWodByDate(selectedDate);
  const todayRecords = useMemo(() => {
    return myRecords.filter((record) => record.completedAt === selectedDate);
  }, [myRecords, selectedDate]);
  // 리더보드 state
  const [selectedPart, setSelectedPart] = useState("A");
  const { leaderboard, leaderboardLoading } = useLeaderboard(selectedDate);

  const gender = activeTab === "leaderboard_men" ? "male" : "female";
  // 레이더 차트 데이터
  const { prRecords } = useMyPrRecords(user?.uid ?? "");

  if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pb-16 mb-10">
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
        {user && <AttendanceCalendar userId={user.uid} onDateClick={(date) => setSelectedDate(date)} />}
      </section>
      <AthleteRadar prRecords={prRecords} />
      {/* 탭 */}
      <div className="flex gap-2 mt-3 mb-4">
        {[
          { key: "my", label: "내 기록" },
          { key: "leaderboard_men", label: "리더보드(남)" },
          { key: "leaderboard_women", label: "리더보드(여)" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "my" | "leaderboard_men" | "leaderboard_women")}
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
        <div className="space-y-3 mt-2">
          {recordsLoading && <div className="text-zinc-500 text-sm text-center py-10">불러오는 중...</div>}
          {!recordsLoading && todayRecords.length === 0 && (
            <div className="text-center py-10 space-y-3">
              <p className="text-zinc-500 text-sm">{selectedWod ? "기록이 없어요." : "오늘의 와드가 등록되지 않았어요"}</p>
              <button
                onClick={() => {
                  if (selectedWod) router.push(`/record/add?wodId=${selectedWod.id}`);
                }}
                disabled={!selectedWod}
                className={`px-4 py-2 rounded-xl text-white text-sm font-black transition ${
                  selectedWod ? "bg-[#E63946]" : "bg-zinc-700 opacity-50 cursor-not-allowed"
                }`}
              >
                + 기록 추가
              </button>
            </div>
          )}

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
      {(activeTab === "leaderboard_men" || activeTab === "leaderboard_women") && (
        <div className="space-y-4">
          {/* 파트 선택 */}
          <div className="flex gap-2">
            {selectedWod?.parts.map((part) => (
              <button
                key={part.part}
                onClick={() => setSelectedPart(part.part)}
                className={`px-5 py-2 rounded-xl text-sm font-black border transition ${
                  selectedPart === part.part ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                }`}
              >
                {part.part}
              </button>
            ))}
          </div>

          {leaderboardLoading && <div className="text-zinc-500 text-sm text-center py-10">불러오는 중...</div>}

          {/* 레벨별 섹션 */}
          {(["Athlete", "R'xd", "Scale", "Beginner"] as const).map((level) => {
            const allRecords = getSortedRecords(leaderboard.filter((r) => r.wodPart === selectedPart && r.level === level && r.gender === gender));
            if (allRecords.length === 0) return null;

            return (
              <div key={level}>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{level}</h3>
                <div className="space-y-2">
                  {allRecords.map((record, index) => (
                    <div key={record.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-3">
                      {/* 순위 */}
                      <span
                        className={`text-sm font-black w-6 text-center ${
                          index === 0 ? "text-yellow-400" : index === 1 ? "text-zinc-300" : index === 2 ? "text-amber-600" : "text-zinc-600"
                        }`}
                      >
                        {index + 1}
                      </span>

                      {/* 이름 */}
                      <span className="text-white font-bold text-sm flex-1">{record.userName}</span>

                      {/* 결과 */}
                      {}

                      <span className={`text-sm font-black ${record.isDNF ? "text-zinc-400" : "text-white"}`}>
                        <span className={`text-sm ${getLevelColor(record.level)}`}>{record.level}</span>&nbsp;{getResultText(record)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {!leaderboardLoading && leaderboard.filter((r) => r.wodPart === selectedPart).length === 0 && (
            <div className="text-zinc-500 text-sm text-center py-10">기록이 없어요</div>
          )}
        </div>
      )}
    </main>
  );
}
