"use client";

import HomeHeader from "@/app/components/ui/HomeHeader";
import { useAuthGuard } from "@/hooks/auth/useAuthGuard";
import { useRecordForm } from "@/hooks/record/useRecordForm";
import { useUserInfo } from "@/hooks/user/useUserInfo";
import { useWod } from "@/hooks/wod/useWod";
import { LEVELS } from "@/lib/constants";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AddRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, loading } = useAuthGuard();
  const wodId = searchParams.get("wodId");
  const { wod, wodLoading } = useWod(wodId ?? "");
  const { userInfo } = useUserInfo(user?.uid ?? "");

  const { selectedPart, recordPart, setRecordPart, finishMin, setFinishMin, finishSec, setFinishSec, submitting, currentPart, handlePartChange, handleSubmit } =
    useRecordForm(wod || null);

  useEffect(() => {
    if (wod) {
      handlePartChange(wod.parts[0].part);
    }
  }, [wod]);

  if (loading || wodLoading) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pb-24">
      <HomeHeader />
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">
          <span className="text-[#E63946]">Record Form</span>
        </h1>
        <h2 className="text-2xl font-black text-white tracking-tight flex-1 pr-4">{wod?.title}</h2>
      </div>
      {/* 파트 선택 */}
      <div className="flex gap-2">
        {wod?.parts.map((part) => (
          <button
            key={part.part}
            onClick={() => handlePartChange(part.part)}
            className={`px-5 py-2 rounded-xl text-sm font-black border transition 
              ${selectedPart === part.part ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}
          >
            {part.part}
          </button>
        ))}
      </div>
      {/* 레벨 선택 */}
      <div>
        <label>레벨</label>
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setRecordPart({ ...recordPart, level: l })}
              className={`px-2 py-2 rounded-xl text-sm font-black border transition 
              ${recordPart.level === l ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div>
        {/* 현재 와드의 타입 보여주기 */}
        {currentPart && (
          <div className="space-y-3 mt-4">
            {/* 타입 + 팀 뱃지 */}
            <div className="flex items-center gap-3">
              <span className="text-xs bg-[#E63946] border-[#E63946] text-white rounded-lg px-2 py-1">{currentPart.type}</span>
              {currentPart.isTeam && (
                <span className="text-xs bg-[#E63946] border-[#E63946] text-white rounded-lg px-2 py-1">Team of {currentPart.teamSize}</span>
              )}
            </div>

            {/* 팀 WOD 입력 */}
            {currentPart.isTeam && (
              <div className="space-y-3">
                {/* 파트너 이름 */}
                <div>
                  <label className="text-xs text-zinc-500 mb-2 block">파트너 이름</label>
                  <input
                    type="text"
                    value={recordPart.partnerName}
                    onChange={(e) => setRecordPart({ ...recordPart, partnerName: e.target.value })}
                    placeholder="파트너 이름"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E63946]"
                  />
                </div>

                {/* 파트너 다른 무게 */}
                <div className="flex items-center gap-3">
                  <label htmlFor="partnerDiffWeight" className="text-sm text-zinc-400">
                    파트너 다른 무게 사용
                  </label>
                  <input
                    type="checkbox"
                    id="partnerDiffWeight"
                    checked={recordPart.partnerDifferentWeight}
                    onChange={(e) => setRecordPart({ ...recordPart, partnerDifferentWeight: e.target.checked })}
                    className="accent-[#E63946]"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* 무게 입력 (공통) */}
      {currentPart && (
        <div className="space-y-3 mt-2.5">
          <label className="text-xs text-zinc-500 uppercase tracking-widest block">사용 무게</label>

          {/* 권장 무게 참고 */}
          {currentPart.weights?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-1">
              {currentPart.weights.map((w, i) => (
                <span key={i} className="text-xs bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-zinc-400">
                  <span className="text-[#E63946]">R'xd</span> {w.tool} ·{" "}
                  <span className="text-blue-400">
                    {w.maleWeight}
                    {w.unit}
                  </span>{" "}
                  /{" "}
                  <span className="text-pink-400">
                    {w.femaleWeight}
                    {w.unit}
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* 실제 사용 무게 입력 */}
          <div className="space-y-2">
            {(recordPart.weights ?? []).map((w, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={w.tool}
                  onChange={(e) => {
                    const updated = [...(recordPart.weights ?? [])];
                    updated[i] = { ...updated[i], tool: e.target.value };
                    setRecordPart({ ...recordPart, weights: updated });
                  }}
                  className="bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                >
                  <option value="Barbell">Barbell</option>
                  <option value="Dumbbell">Dumbbell</option>
                  <option value="Kettlebell">Kettlebell</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="number"
                  value={w.weight || ""}
                  onChange={(e) => {
                    const updated = [...(recordPart.weights ?? [])];
                    updated[i] = { ...updated[i], weight: Number(e.target.value) };
                    setRecordPart({ ...recordPart, weights: updated });
                  }}
                  placeholder="무게"
                  className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E63946]"
                />

                <select
                  value={w.unit}
                  onChange={(e) => {
                    const updated = [...(recordPart.weights ?? [])];
                    updated[i] = { ...updated[i], unit: e.target.value };
                    setRecordPart({ ...recordPart, weights: updated });
                  }}
                  className="bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                >
                  <option value="lb">lb</option>
                  <option value="kg">kg</option>
                </select>

                <button
                  onClick={() => {
                    const updated = (recordPart.weights ?? []).filter((_, idx) => idx !== i);
                    setRecordPart({ ...recordPart, weights: updated });
                  }}
                  className="text-zinc-600 hover:text-red-500 text-xs transition"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>

          {/* 무게 추가 버튼 */}
          <button
            onClick={() => {
              const updated = [...(recordPart.weights ?? []), { tool: "Barbell", weight: 0, unit: "lb" }];
              setRecordPart({ ...recordPart, weights: updated });
            }}
            className="w-full py-2.5 border border-dashed border-zinc-700 rounded-xl text-zinc-500 text-sm hover:border-[#E63946] hover:text-[#E63946] transition"
          >
            + 무게 추가
          </button>
        </div>
      )}
      {/* 타입별 폼 */}

      {/* For Time */}
      {currentPart?.type === "For Time" && (
        <div className="space-y-4">
          {/* DNF 체크 */}
          <div className="flex items-center gap-3 mt-2 ml-2">
            <label htmlFor="dnf" className="text-sm text-zinc-400">
              완주 실패 (DNF)
            </label>
            <input
              type="checkbox"
              id="dnf"
              checked={recordPart.isDNF}
              onChange={(e) => setRecordPart({ ...recordPart, isDNF: e.target.checked })}
              className="accent-[#E63946] mt-0.5"
            />
          </div>

          {/* 완주했을 때 */}
          {!recordPart.isDNF && (
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">완료 시간</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={finishMin || ""}
                  onChange={(e) => setFinishMin(Number(e.target.value))}
                  placeholder="0"
                  className="w-20 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-center text-sm focus:outline-none focus:border-[#E63946]"
                />
                <span className="text-zinc-500 text-sm">분</span>
                <input
                  type="number"
                  value={finishSec || ""}
                  onChange={(e) => setFinishSec(Number(e.target.value))}
                  placeholder="0"
                  className="w-20 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-center text-sm focus:outline-none focus:border-[#E63946]"
                />
                <span className="text-zinc-500 text-sm">초</span>
              </div>
            </div>
          )}

          {/* 완주 못했을 때 */}
          {recordPart.isDNF && (
            <div className="space-y-3">
              {/* Reps만 제출 체크 */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="repsOnly"
                  checked={recordPart.hasRepsOnly}
                  onChange={(e) => setRecordPart({ ...recordPart, hasRepsOnly: e.target.checked })}
                  className="accent-[#E63946]"
                />
                <label htmlFor="repsOnly" className="text-sm text-zinc-400">
                  Reps만 제출
                </label>
              </div>

              {/* Rounds + Reps */}
              {!recordPart.hasRepsOnly && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Rounds</label>
                    <input
                      type="number"
                      value={recordPart.rounds ?? 0}
                      onChange={(e) => setRecordPart({ ...recordPart, rounds: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E63946]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Reps</label>
                    <input
                      type="number"
                      value={recordPart.reps ?? 0}
                      onChange={(e) => setRecordPart({ ...recordPart, reps: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E63946]"
                    />
                  </div>
                </div>
              )}

              {/* Reps만 */}
              {recordPart.hasRepsOnly && (
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Reps</label>
                  <input
                    type="number"
                    value={recordPart.reps ?? 0}
                    onChange={(e) => setRecordPart({ ...recordPart, reps: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E63946]"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* AMRAP */}
      {currentPart?.type === "AMRAP" && (
        <div className="space-y-4">
          {/* 총 Reps만 제출 체크 */}
          <div className="flex items-center gap-3  mt-2 ml-2">
            <label htmlFor="totalRepsOnly" className="text-sm text-zinc-400">
              Only Reps
            </label>
            <input
              type="checkbox"
              id="totalRepsOnly"
              checked={recordPart.hasTotalRepsOnly}
              onChange={(e) => setRecordPart({ ...recordPart, hasTotalRepsOnly: e.target.checked })}
              className="accent-[#E63946] mt-0.5"
            />
          </div>
          {/* 총 Reps만 */}
          {recordPart.hasTotalRepsOnly && (
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Total Reps</label>
              <input
                type="number"
                value={recordPart.totalReps ?? ""}
                onChange={(e) => setRecordPart({ ...recordPart, totalReps: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E63946]"
              />
            </div>
          )}
          {/* Rounds + Reps */}
          {!recordPart.hasTotalRepsOnly && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Rounds</label>
                <input
                  type="number"
                  value={recordPart.rounds ?? ""}
                  onChange={(e) => setRecordPart({ ...recordPart, rounds: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E63946]"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Reps</label>
                <input
                  type="number"
                  value={recordPart.reps ?? ""}
                  onChange={(e) => setRecordPart({ ...recordPart, reps: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E63946]"
                />
              </div>
            </div>
          )}{" "}
        </div>
      )}
      {/* EMOM */}
      {currentPart?.type === "EMOM" && (
        <div className="space-y-4">
          {/* 총 Reps만 제출 체크 */}
          <div className="flex items-center gap-3  mt-2 ml-2">
            <label htmlFor="totalRepsOnly" className="text-sm text-zinc-400">
              Only Reps
            </label>
            <input
              type="checkbox"
              id="totalRepsOnly"
              checked={recordPart.hasTotalRepsOnly}
              onChange={(e) => setRecordPart({ ...recordPart, hasTotalRepsOnly: e.target.checked })}
              className="accent-[#E63946] mt-0.5"
            />
          </div>
          {/* Reps 입력 */}
          {recordPart.hasTotalRepsOnly && (
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block mt-2">Total Reps</label>
              <input
                type="number"
                value={recordPart.totalReps ?? 0}
                onChange={(e) => setRecordPart({ ...recordPart, totalReps: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E63946]"
              />
            </div>
          )}
          {/* Fail Count 입력 */}
          {!recordPart.hasTotalRepsOnly && (
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block mt2">Fail Count</label>
              <input
                type="number"
                value={recordPart.failCount ?? 0}
                onChange={(e) => setRecordPart({ ...recordPart, failCount: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E63946]"
              />
            </div>
          )}
        </div>
      )}
      {/* Every */}
      {(currentPart?.type === "Every" || currentPart?.type === "Strength") && (
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">메모</label>
          <textarea
            value={recordPart.memo ?? ""}
            onChange={(e) => setRecordPart({ ...recordPart, memo: e.target.value })}
            placeholder="예: 185lb / 3set 완료 / 마지막 세트 실패"
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#E63946] resize-none"
          />
        </div>
      )}

      {/*  제출 버튼 */}
      <button
        onClick={() => handleSubmit(user?.uid ?? "", userInfo?.name ?? "", userInfo?.gender ?? "", userInfo?.currentGymId ?? "")}
        disabled={submitting}
        className="w-full py-4 mt-3 bg-[#E63946] rounded-xl text-white font-black text-lg tracking-wider uppercase disabled:opacity-50 transition"
      >
        {submitting ? "제출 중" : "Submit"}
      </button>
    </main>
  );
}
