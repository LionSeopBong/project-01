"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getUser, addWorkoutRecord, getTodayWod } from "@/lib/firestore";
import { EverySet, Wod } from "@/types/wod";

export default function AddRecordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedPart, setSelectedPart] = useState("");
  const [wod, setWod] = useState<Wod | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const [level, setLevel] = useState("Rxd");
  const [submitting, setSubmitting] = useState(false);

  const [extraParts, setExtraParts] = useState<string[]>([]); // ["B"] or ["B", "C"]

  // 팀 WOD
  const [isTeam, setIsTeam] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerDifferentWeight, setPartnerDifferentWeight] = useState(false);
  const [partnerWeight, setPartnerWeight] = useState(0);

  // For Time
  const [finishMinutes, setFinishMinutes] = useState(0);
  const [finishSeconds, setFinishSeconds] = useState(0);
  const [weight, setWeight] = useState(0);
  const [isDNF, setIsDNF] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [reps, setReps] = useState(0);
  const [maxCal, setMaxCal] = useState(0);
  const [maxReps, setMaxReps] = useState(0);

  // EMOM
  const [failedRounds, setFailedRounds] = useState(0);

  // Every
  const [interval, setInterval] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const [sets, setSets] = useState<EverySet[]>([{ set: 1, weight: 0, reps: 0 }]);

  // AMRAP
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedMinutes, setCompletedMinutes] = useState(0);
  const [completedSeconds, setCompletedSeconds] = useState(0);
  const [amrapWeight, setAmrapWeight] = useState(0);
  const [amrapRounds, setAmrapRounds] = useState(0);
  const [amrapReps, setAmrapReps] = useState(0);

  // 미로그인 시 리다이렉트
  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading]);

  // WOD 정보 불러오기
  useEffect(() => {
    const init = async () => {
      if (loading || !user) return;
      const todayWod = await getTodayWod();
      setWod(todayWod);
      if (todayWod?.parts?.[0]?.type) {
        setSelectedType(todayWod.parts[0].type);
      }
    };
    init();
  }, [user, loading]);

  // Every 세트 수 변경 시 sets 배열 업데이트
  const handleTotalSetsChange = (count: number) => {
    setTotalSets(count);
    const newSets = Array.from({ length: count }, (_, i) => ({
      set: i + 1,
      weight: sets[i]?.weight ?? 0,
      reps: sets[i]?.reps ?? 0,
    }));
    setSets(newSets);
  };

  const handleSubmit = async () => {
    if (!user || !wod) return alert("오늘의 WOD가 없어요.");
    setSubmitting(true);
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      await addWorkoutRecord({
        userId: user.uid,
        userName: user.displayName ?? "익명",
        gender: "",
        wodId: wod.id,
        wodName: wod.title,
        wodType: selectedType,
        level,
        completedAt: today,
        // Wod Part
        wodPart: selectedPart, 

        // 팀
        isTeam,
        partnerName,
        partnerWeight,
        partnerDifferentWeight,
        // For Time
        timeCap: 0,
        finishTime: finishMinutes * 60 + finishSeconds,
        weight,
        isDNF,
        rounds,
        reps,
        maxCal,
        maxReps,
        // EMOM
        failedRounds,
        // Every
        interval,
        totalSets,
        sets,
        // AMRAP
        isCompleted,
        completedTime: completedMinutes * 60 + completedSeconds,
        amrapWeight,
        amrapRounds,
        amrapReps,
        createdAt: null,
      });

      alert("기록 등록 완료! 🔥");
      router.push("/record");
    } catch (e) {
      console.error(e);
      alert("등록 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pt-10 pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition">
          ← 뒤로
        </button>
        <h1 className="text-2xl font-black text-white">
          기록 <span className="text-[#E63946]">등록</span>
        </h1>
      </div>

      {/* WOD 정보 */}
      {wod && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Today&apos;s WOD</p>
          <p className="text-white font-black">{wod.title}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* WOD 파트 선택 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">WOD 파트</label>
          <div className="flex gap-2 flex-wrap">
            {/* WOD에 있는 파트 */}
            {wod?.parts.map((part) => (
              <button
                key={part.part}
                onClick={() => setSelectedPart(part.part)}
                className={`px-5 py-3 rounded-xl text-sm font-black border transition ${
                  selectedPart === part.part ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-900 border-zinc-700 text-zinc-400"
                }`}
              >
                {part.part}
              </button>
            ))}

            {/* 추가된 파트 */}
            {extraParts.map((part) => (
              <button
                key={part}
                onClick={() => setSelectedPart(part)}
                className={`px-5 py-3 rounded-xl text-sm font-black border transition ${
                  selectedPart === part ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-900 border-zinc-700 text-zinc-400"
                }`}
              >
                {part}
              </button>
            ))}

            {/* 파트 추가 버튼 - 최대 3개 */}
            {(wod?.parts.length ?? 0) + extraParts.length < 3 && (
              <button
                onClick={() => {
                  const allParts = [...(wod?.parts.map((p) => p.part) ?? []), ...extraParts];
                  const next = ["A", "B", "C"].find((p) => !allParts.includes(p));
                  if (next) setExtraParts([...extraParts, next]);
                }}
                className="px-5 py-3 rounded-xl text-sm font-black border border-dashed border-zinc-700 text-zinc-500 hover:border-[#E63946] hover:text-[#E63946] transition"
              >
                + 파트
              </button>
            )}
          </div>
        </div>
        {/* 기록 타입 직접 선택 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">기록 타입</label>
          <div className="flex flex-wrap gap-2">
            {["For Time", "AMRAP", "EMOM", "Every", "Strength"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                  selectedType === type ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-900 border-zinc-700 text-zinc-400"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        {/* 레벨 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">레벨</label>
          <div className="flex gap-2">
            {["Beginner", "Rxd", "Athlete"].map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border transition ${
                  level === l ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-900 border-zinc-700 text-zinc-400"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        {/* ===================== For Time ===================== */}
        {selectedType === "For Time" && (
          <div className="space-y-4">
            <p className="text-xs text-[#E63946] font-black uppercase tracking-widest">For Time</p>

            <div>
              <label className="text-xs text-zinc-500 mb-2 block">완료 시간</label>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <input
                    type="number"
                    value={finishMinutes}
                    onChange={(e) => setFinishMinutes(Number(e.target.value))}
                    min={0}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-lg font-bold focus:outline-none focus:border-[#E63946]"
                  />
                  <p className="text-xs text-zinc-500 text-center mt-1">분</p>
                </div>
                <span className="text-white font-black text-xl mb-4">:</span>
                <div className="flex-1">
                  <input
                    type="number"
                    value={finishSeconds}
                    onChange={(e) => setFinishSeconds(Number(e.target.value))}
                    min={0}
                    max={59}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-lg font-bold focus:outline-none focus:border-[#E63946]"
                  />
                  <p className="text-xs text-zinc-500 text-center mt-1">초</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-2 block">진행 무게 (lb)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                min={0}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-lg font-bold focus:outline-none focus:border-[#E63946]"
              />
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" checked={isDNF} onChange={(e) => setIsDNF(e.target.checked)} className="accent-[#E63946] w-4 h-4" />
              <label className="text-sm text-zinc-400">DNF (Did Not Finish)</label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">Rounds</label>
                <input
                  type="number"
                  value={rounds}
                  onChange={(e) => setRounds(Number(e.target.value))}
                  min={0}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">Reps</label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  min={0}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">Max Cal</label>
                <input
                  type="number"
                  value={maxCal}
                  onChange={(e) => setMaxCal(Number(e.target.value))}
                  min={0}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">Max Reps</label>
                <input
                  type="number"
                  value={maxReps}
                  onChange={(e) => setMaxReps(Number(e.target.value))}
                  min={0}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                />
              </div>
            </div>
          </div>
        )}
        {/* ===================== AMRAP ===================== */}
        {selectedType === "AMRAP" && (
          <div className="space-y-4">
            <p className="text-xs text-[#E63946] font-black uppercase tracking-widest">AMRAP</p>

            <div className="flex items-center gap-3">
              <input type="checkbox" checked={isCompleted} onChange={(e) => setIsCompleted(e.target.checked)} className="accent-[#E63946] w-4 h-4" />
              <label className="text-sm text-zinc-400">완주 성공</label>
            </div>

            {isCompleted && (
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">완주 시간</label>
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={completedMinutes}
                      onChange={(e) => setCompletedMinutes(Number(e.target.value))}
                      min={0}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-lg font-bold focus:outline-none focus:border-[#E63946]"
                    />
                    <p className="text-xs text-zinc-500 text-center mt-1">분</p>
                  </div>
                  <span className="text-white font-black text-xl mb-4">:</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={completedSeconds}
                      onChange={(e) => setCompletedSeconds(Number(e.target.value))}
                      min={0}
                      max={59}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-lg font-bold focus:outline-none focus:border-[#E63946]"
                    />
                    <p className="text-xs text-zinc-500 text-center mt-1">초</p>
                  </div>
                </div>
              </div>
            )}

            {!isCompleted && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-2 block">완료 Rounds</label>
                  <input
                    type="number"
                    value={amrapRounds}
                    onChange={(e) => setAmrapRounds(Number(e.target.value))}
                    min={0}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-2 block">완료 Reps</label>
                  <input
                    type="number"
                    value={amrapReps}
                    onChange={(e) => setAmrapReps(Number(e.target.value))}
                    min={0}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-zinc-500 mb-2 block">진행 무게 (lb)</label>
              <input
                type="number"
                value={amrapWeight}
                onChange={(e) => setAmrapWeight(Number(e.target.value))}
                min={0}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-lg font-bold focus:outline-none focus:border-[#E63946]"
              />
            </div>
          </div>
        )}
        {/* ===================== EMOM ===================== */}
        {selectedType === "EMOM" && (
          <div className="space-y-4">
            <p className="text-xs text-[#E63946] font-black uppercase tracking-widest">EMOM</p>

            <div>
              <label className="text-xs text-zinc-500 mb-2 block">실패 라운드 수</label>
              <input
                type="number"
                value={failedRounds}
                onChange={(e) => setFailedRounds(Number(e.target.value))}
                min={0}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-lg font-bold focus:outline-none focus:border-[#E63946]"
              />
            </div>
          </div>
        )}
        {/* ===================== Every ===================== */}
        {selectedType === "Every" && (
          <div className="space-y-4">
            <p className="text-xs text-[#E63946] font-black uppercase tracking-widest">Every</p>

            <div>
              <label className="text-xs text-zinc-500 mb-2 block">몇 분마다</label>
              <input
                type="number"
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                min={0}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
              />
            </div>

            {/* 세트별 무게/횟수 */}
            {sets.map((s, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[#E63946] font-black">Set {s.set}</p>
                  {sets.length > 1 && (
                    <button onClick={() => setSets(sets.filter((_, idx) => idx !== i))} className="text-xs text-zinc-600 hover:text-red-500 transition">
                      삭제
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-2 block">무게 (lb)</label>
                    <input
                      type="number"
                      value={s.weight}
                      onChange={(e) => {
                        const updated = [...sets];
                        updated[i].weight = Number(e.target.value);
                        setSets(updated);
                      }}
                      min={0}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-2 block">횟수</label>
                    <input
                      type="number"
                      value={s.reps}
                      onChange={(e) => {
                        const updated = [...sets];
                        updated[i].reps = Number(e.target.value);
                        setSets(updated);
                      }}
                      min={0}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* 세트 추가 버튼 */}
            <button
              onClick={() => setSets([...sets, { set: sets.length + 1, weight: 0, reps: 0 }])}
              className="w-full py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-500 text-sm hover:border-[#E63946] hover:text-[#E63946] transition"
            >
              + 세트 추가
            </button>
          </div>
        )}
        {/* ===================== Strength ===================== */}
        {selectedType === "Strength" && (
          <div className="space-y-4">
            <p className="text-xs text-[#E63946] font-black uppercase tracking-widest">Strength</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">몇 분마다</label>
                <input
                  type="number"
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                  min={0}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">총 세트 수</label>
                <input
                  type="number"
                  value={totalSets}
                  onChange={(e) => handleTotalSetsChange(Number(e.target.value))}
                  min={0}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                />
              </div>
            </div>

            {sets.map((s, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-xs text-[#E63946] font-black mb-3">Set {s.set}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-2 block">무게 (lb)</label>
                    <input
                      type="number"
                      value={s.weight}
                      onChange={(e) => {
                        const updated = [...sets];
                        updated[i].weight = Number(e.target.value);
                        setSets(updated);
                      }}
                      min={0}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-2 block">횟수</label>
                    <input
                      type="number"
                      value={s.reps}
                      onChange={(e) => {
                        const updated = [...sets];
                        updated[i].reps = Number(e.target.value);
                        setSets(updated);
                      }}
                      min={0}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* ===================== 팀 WOD ===================== */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={isTeam} onChange={(e) => setIsTeam(e.target.checked)} className="accent-[#E63946] w-4 h-4" />
            <label className="text-sm text-white font-bold">Team WOD</label>
          </div>

          {isTeam && (
            <>
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">파트너 이름</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="파트너 이름 입력"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={partnerDifferentWeight}
                  onChange={(e) => setPartnerDifferentWeight(e.target.checked)}
                  className="accent-[#E63946] w-4 h-4"
                />
                <label className="text-sm text-zinc-400">파트너 무게 다름</label>
              </div>

              {partnerDifferentWeight && (
                <div>
                  <label className="text-xs text-zinc-500 mb-2 block">파트너 무게 (lb)</label>
                  <input
                    type="number"
                    value={partnerWeight}
                    onChange={(e) => setPartnerWeight(Number(e.target.value))}
                    min={0}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-[#E63946]"
                  />
                </div>
              )}
            </>
          )}
        </div>
        {/* 등록 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-[#E63946] rounded-xl text-white font-black text-lg tracking-wider uppercase disabled:opacity-50 transition"
        >
          {submitting ? "등록 중..." : "기록 등록 🔥"}
        </button>
      </div>
    </main>
  );
}
