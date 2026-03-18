"use client";

import HomeHeader from "@/app/components/ui/HomeHeader";
import { useAuthGuard } from "@/hooks/auth/useAuthGuard";
import { useUserInfo } from "@/hooks/user/useUserInfo";
import { addPrRecord, deletePrRecord, getMyPrRecords } from "@/lib/firestore";
import { getLocalToday } from "@/lib/utils";
import { PrRecord } from "@/types/wod";
import { useEffect, useState } from "react";
import { PR_EXERCISES } from "@/lib/constants";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
export default function PRDataPage() {
  const { user, loading } = useAuthGuard();
  const { userInfo } = useUserInfo(user?.uid ?? "");
  const [prRecords, setPrRecords] = useState<PrRecord[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [weight, setWeight] = useState(0);
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [recordedAt, setRecordedAt] = useState(getLocalToday());
  const [submitting, setSubmitting] = useState(false);
  const [historyExercise, setHistoryExercise] = useState<string | null>(null);

  const [reps, setReps] = useState(0);

  const [timeHour, setTimeHour] = useState(0);
  const [timeMin, setTimeMin] = useState(0);
  const [timeSec, setTimeSec] = useState(0);
  const selectedCategory = PR_EXERCISES.find((e) => e.name === selectedExercise)?.category;
  const categories = [...new Set(PR_EXERCISES.map((e) => e.category))];

  const fetchPrRecords = async () => {
    if (!user) return;
    const data = await getMyPrRecords(user.uid);
    setPrRecords(data);
  };
  // 운동별 히스토리 헬퍼 함수
  const getHistory = (exercise: string) => {
    return prRecords.filter((r) => r.exercise === exercise).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  };
  useEffect(() => {
    fetchPrRecords();
  }, [user]);

  // 운동별 최고 기록
  const getBestPr = (exercise: string) => {
    const records = prRecords.filter((r) => r.exercise === exercise);
    if (!records.length) return null;
    const category = PR_EXERCISES.find((e) => e.name === exercise)?.category;
    return records.reduce((best, cur) => {
      if (category === "Endurance" || category === "Conditioning") {
        return (cur.time ?? 0) < (best.time ?? 0) ? cur : best;
      }
      if (category === "Skill") {
        return (cur.reps ?? 0) > (best.reps ?? 0) ? cur : best;
      }
      return (cur.weight ?? 0) > (best.weight ?? 0) ? cur : best;
    });
  };

  const handleSubmit = async () => {
    if (!user || !selectedExercise) return;
    setSubmitting(true);
    try {
      const category = PR_EXERCISES.find((e) => e.name === selectedExercise)?.category ?? "";
      await addPrRecord({
        userId: user.uid,
        category,
        exercise: selectedExercise,
        reps: selectedCategory === "Skill" ? reps : 0,

        weight: selectedCategory === "Strength" || selectedCategory === "Power" ? weight : 0,
        time: selectedCategory === "Endurance" || selectedCategory === "Conditioning" ? timeHour * 3600 + timeMin * 60 + timeSec : 0,
        unit,
        recordedAt,
        createdAt: null,
      });
      await fetchPrRecords();
      setSelectedExercise(null);
      setWeight(0);
      setTimeHour(0);
      setTimeMin(0);
      setTimeSec(0);
    } catch (error) {
      console.error(error);
      alert("저장 실패");
    } finally {
      setSubmitting(false);
    }
  };
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  };
  if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />;
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pt-10 pb-19">
      <HomeHeader />
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">
          PR <span className="text-[#E63946]">Board</span>
        </h1>
      </div>

      {/* 카테고리별 섹션 */}
      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-3">{category}</h2>
          {PR_EXERCISES.filter((e) => e.category === category).map(({ name }) => {
            const best = getBestPr(name);
            const history = getHistory(name);
            return (
              <div
                key={name}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer"
                onClick={() => setHistoryExercise(historyExercise === name ? null : name)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-black text-base">{name}</p>
                    {best ? (
                      <p className="text-[#E63946] font-black text-2xl mt-1">
                        {category === "Strength" || category === "Power" ? (
                          <>
                            {best.weight}
                            <span className="text-sm text-zinc-500 ml-1">{best.unit}</span>
                          </>
                        ) : category === "Skill" ? (
                          <>
                            {best.reps}
                            <span className="text-sm text-zinc-500 ml-1">reps</span>
                          </>
                        ) : (
                          <>{formatTime(best.time ?? 0)}</>
                        )}
                      </p>
                    ) : (
                      <p className="text-zinc-600 text-sm mt-1">기록 없음</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExercise(name);
                    }}
                    className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400 text-xs font-bold hover:border-[#E63946] hover:text-[#E63946] transition"
                  >
                    + PR 추가
                  </button>
                </div>

                {/* 히스토리 */}
                {historyExercise === name && (
                  <div className="mt-4 space-y-2 border-t border-zinc-800 pt-4">
                    {history.length === 0 && <p className="text-zinc-600 text-sm text-center">기록이 없어요</p>}
                    {history.map((record) => (
                      <div key={record.id} className="flex items-center justify-between">
                        <span className="text-zinc-500 text-xs">{record.recordedAt}</span>
                        <span className="text-white font-black">
                          {category === "Strength" ? (
                            <>
                              {record.weight}
                              <span className="text-zinc-500 text-xs ml-1">{record.unit}</span>
                            </>
                          ) : category === "Skill" ? (
                            <>
                              {record.reps}
                              <span className="text-zinc-500 text-xs ml-1">reps</span>
                            </>
                          ) : (
                            formatTime(record.time ?? 0)
                          )}
                        </span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm("삭제할까요?")) return;
                            await deletePrRecord(record.id);
                            await fetchPrRecords();
                          }}
                          className="text-zinc-600 hover:text-red-500 text-xs transition"
                        >
                          삭제
                        </button>
                      </div>
                    ))}

                    {/* 그래프 */}
                    {history.length > 1 && (
                      <div className="mt-4">
                        <ResponsiveContainer width="100%" height={150}>
                          <LineChart
                            data={[...history].reverse().map((r) => ({
                              date: r.recordedAt,
                              value: category === "Strength" ? r.weight : category === "Skill" ? r.reps : r.time,
                            }))}
                          >
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} />
                            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} domain={["auto", "auto"]} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#111", border: "1px solid #3f3f46", borderRadius: "8px" }}
                              labelStyle={{ color: "#71717a", fontSize: "10px" }}
                              itemStyle={{ color: "#E63946", fontSize: "12px" }}
                              formatter={(value) => {
                                const num = Number(value);
                                if (category === "Skill") return `${num}reps`;
                                if (category === "Strength") return `${num}${unit}`;

                                return formatTime(num);
                              }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#E63946" strokeWidth={2} dot={{ fill: "#E63946", r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* 모달 */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end mb-16">
          <div className="bg-[#111111] w-full rounded-t-2xl p-6 space-y-4">
            <h2 className="text-white font-black text-lg">{selectedExercise} PR 추가</h2>

            {/* 날짜 */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">날짜</label>
              <input
                type="date"
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
              />
            </div>

            {/* Strength - 무게 입력 */}
            {(selectedCategory === "Strength" || selectedCategory === "Power") && (
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">무게</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={weight || ""}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
                  />
                  {["lb", "kg"].map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u as "lb" | "kg")}
                      className={`px-4 py-2 rounded-xl text-sm font-black border transition ${
                        unit === u ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Skill - 랩스 입력 */}
            {selectedCategory === "Skill" && (
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Max Reps</label>
                <input
                  type="number"
                  value={reps || ""}
                  onChange={(e) => setReps(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
                />
              </div>
            )}

            {/* Endurance / Conditioning - 시간 입력 */}
            {(selectedCategory === "Endurance" || selectedCategory === "Conditioning") && (
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">시간</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={timeHour}
                    onChange={(e) => setTimeHour(Number(e.target.value))}
                    placeholder="0"
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-center text-sm focus:outline-none focus:border-[#E63946]"
                  />
                  <span className="text-zinc-500 text-sm">시</span>
                  <input
                    type="number"
                    value={timeMin || ""}
                    onChange={(e) => setTimeMin(Number(e.target.value))}
                    placeholder="0"
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-center text-sm focus:outline-none focus:border-[#E63946]"
                  />
                  <span className="text-zinc-500 text-sm">분</span>
                  <input
                    type="number"
                    value={timeSec || ""}
                    onChange={(e) => setTimeSec(Number(e.target.value))}
                    placeholder="0"
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-center text-sm focus:outline-none focus:border-[#E63946]"
                  />
                  <span className="text-zinc-500 text-sm">초</span>
                </div>
              </div>
            )}
            {/* 버튼 */}
            <div className="flex gap-2">
              <button onClick={() => setSelectedExercise(null)} className="flex-1 py-3 border border-zinc-700 rounded-xl text-zinc-400 font-bold transition">
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-[#E63946] rounded-xl text-white font-black disabled:opacity-50 transition"
              >
                {submitting ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
