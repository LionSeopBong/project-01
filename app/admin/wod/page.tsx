"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getUser, createWod } from "@/lib/firestore";
import { Movement, WodPart } from "@/types/wod";

const PART_LABELS = ["A", "B", "C"] as const;
const WOD_TYPES = ["For Time", "AMRAP", "EMOM", "Every", "Strength", "Accessory"];

const defaultMovement = (): Movement => ({
  name: "",
  reps: 0,
  distance: 0,
  unit: "reps",
});
const defaultPart = (part: "A" | "B" | "C"): WodPart => ({
  part,
  label: part === "A" ? "Strength" : "WOD",
  type: part === "A" ? "Strength" : "AMRAP",
  rounds: 1,
  timeCap: 0,
  interval: "",
  movements: [defaultMovement()],
  isLadder: false,
  ladderStart: 3,
  ladderIncrement: 3,
  note: "",
});

export default function AdminWodPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  // 관리자 체크
  useEffect(() => {
    const checkAdmin = async () => {
      if (!loading && !user) {
        router.push("/");
        return;
      }
      if (user) {
        const userData = await getUser(user.uid);
        if (userData?.role !== "admin") {
          router.push("/home"); // 관리자 아니면 홈으로
          return;
        }
        setIsAdmin(true);
        setChecking(false);
      }
    };
    checkAdmin();
  }, [user, loading]);
  // 폼 상태
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [parts, setParts] = useState<WodPart[]>([defaultPart("A")]);
  const [submitting, setSubmitting] = useState(false);

  // 파트 추가
  const addPart = () => {
    if (parts.length >= 3) return;
    const nextPart = PART_LABELS[parts.length];
    setParts([...parts, defaultPart(nextPart)]);
  };

  // 파트 삭제
  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  // 파트 필드 수정
  const updatePart = (index: number, field: keyof WodPart, value: any) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    setParts(updated);
  };

  // 무브먼트 추가
  const addMovement = (partIndex: number) => {
    const updated = [...parts];
    updated[partIndex].movements.push(defaultMovement());
    setParts(updated);
  };

  // 무브먼트 삭제
  const removeMovement = (partIndex: number, movIndex: number) => {
    const updated = [...parts];
    updated[partIndex].movements = updated[partIndex].movements.filter((_, i) => i !== movIndex);
    setParts(updated);
  };

  // 무브먼트 수정
  const updateMovement = (partIndex: number, movIndex: number, field: keyof Movement, value: string | number) => {
    const updated = [...parts];
    updated[partIndex].movements[movIndex] = {
      ...updated[partIndex].movements[movIndex],
      [field]: value,
    };
    setParts(updated);
  };

  // WOD 등록
  const handleSubmit = async () => {
    if (!date) return alert("날짜를 입력해주세요.");
    if (parts.some((p) => p.movements.some((m) => !m.name))) return alert("무브먼트 이름을 모두 입력해주세요.");

    setSubmitting(true);
    try {
      await createWod({
        date,
        parts,
        title,
        note,
        createdAt: null,
      });
      alert("WOD 등록 완료!");
      router.push("/home");
    } catch (error) {
      console.error(error);
      alert("등록 실패");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return <div className="min-h-screen bg-[#0a0a0a]" />;
  if (!isAdmin) return null;
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pt-10 pb-24">
      <h1 className="text-2xl font-black text-white mb-8">
        WOD <span className="text-[#E63946]">등록</span>
      </h1>

      <div className="space-y-8">
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">WOD 제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: MUSCLE RUN"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946]"
          />
        </div>
        {/* 날짜 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
          />
        </div>

        {/* 파트 목록 */}
        {parts.map((part, partIndex) => (
          <div key={partIndex} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
            {/* 파트 헤더 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-[#E63946]">{part.part}</span>
                <input
                  value={part.label}
                  onChange={(e) => updatePart(partIndex, "label", e.target.value)}
                  placeholder="Strength / WOD / Accessory"
                  className="bg-zinc-800 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none w-40"
                />
              </div>
              {parts.length > 1 && (
                <button onClick={() => removePart(partIndex)} className="text-zinc-600 hover:text-red-500 text-xs transition">
                  파트 삭제
                </button>
              )}
            </div>

            {/* 타입 선택 */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">타입</label>
              <div className="flex flex-wrap gap-2">
                {WOD_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => updatePart(partIndex, "type", t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      part.type === t ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Every 타입일 때 인터벌 입력 */}
            {part.type === "Every" && (
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">인터벌</label>
                <input
                  value={part.interval}
                  onChange={(e) => updatePart(partIndex, "interval", e.target.value)}
                  placeholder="예: Every 1:30"
                  className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                />
              </div>
            )}

            {/* 라운드 + 타임캡 */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">{part.type === "Every" ? "세트" : "라운드"}</label>
                <input
                  type="number"
                  value={part.rounds}
                  onChange={(e) => updatePart(partIndex, "rounds", Number(e.target.value))}
                  className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                />
              </div>
              {["For Time", "AMRAP", "EMOM"].includes(part.type) && (
                <div className="flex-1">
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">타임캡 (분)</label>
                  <input
                    type="number"
                    value={part.timeCap}
                    onChange={(e) => updatePart(partIndex, "timeCap", Number(e.target.value))}
                    className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* 래더 설정 */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`ladder-${partIndex}`}
                checked={part.isLadder}
                onChange={(e) => updatePart(partIndex, "isLadder", e.target.checked)}
                className="accent-[#E63946]"
              />
              <label htmlFor={`ladder-${partIndex}`} className="text-sm text-zinc-400">
                래더 렙수 사용 (3-6-9-12...)
              </label>
            </div>

            {part.isLadder && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">시작 렙수</label>
                  <input
                    type="number"
                    value={part.ladderStart}
                    onChange={(e) => updatePart(partIndex, "ladderStart", Number(e.target.value))}
                    className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">증가 단위</label>
                  <input
                    type="number"
                    value={part.ladderIncrement}
                    onChange={(e) => updatePart(partIndex, "ladderIncrement", Number(e.target.value))}
                    className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 무브먼트 목록 */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-3 block">무브먼트</label>
              <div className="space-y-3">
                {part.movements.map((movement, movIndex) => (
                  <div key={movIndex} className="bg-zinc-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#E63946] font-bold">#{movIndex + 1}</span>
                      {part.movements.length > 1 && (
                        <button onClick={() => removeMovement(partIndex, movIndex)} className="text-zinc-600 hover:text-red-500 text-xs transition">
                          삭제
                        </button>
                      )}
                    </div>
                    <input
                      value={movement.name}
                      onChange={(e) => updateMovement(partIndex, movIndex, "name", e.target.value)}
                      placeholder="무브먼트명 (예: Power Clean)"
                      className="w-full bg-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none"
                    />
                    {!part.isLadder && (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={movement.reps}
                          onChange={(e) => updateMovement(partIndex, movIndex, "reps", Number(e.target.value))}
                          placeholder="Reps"
                          className="flex-1 min-w-0 bg-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                        />
                        <input
                          type="number"
                          value={movement.distance}
                          onChange={(e) => updateMovement(partIndex, movIndex, "distance", Number(e.target.value))}
                          placeholder="Distance"
                          className="flex-1 min-w-0 bg-zinc-700 rounded-lg px-3 py-2  text-white text-sm focus:outline-none"
                        />
                        <select
                          value={movement.unit}
                          onChange={(e) => updateMovement(partIndex, movIndex, "unit", e.target.value)}
                          className="flex-1 min-w-0 bg-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                        >
                          <option value="reps">reps</option>
                          <option value="m">m</option>
                          <option value="km">km</option>
                          <option value="cal">cal</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => addMovement(partIndex)}
                className="mt-3 w-full py-2.5 border border-dashed border-zinc-700 rounded-xl text-zinc-500 text-sm hover:border-[#E63946] hover:text-[#E63946] transition"
              >
                + 무브먼트 추가
              </button>
            </div>
          </div>
        ))}

        {/* 파트 추가 버튼 */}
        {parts.length < 3 && (
          <button
            onClick={addPart}
            className="w-full py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-500 text-sm hover:border-[#E63946] hover:text-[#E63946] transition"
          >
            + {PART_LABELS[parts.length]} 파트 추가
          </button>
        )}

        {/* 전체 메모 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">📝 오늘 공지 / 메모</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 오늘 무게는 1RM의 70%로 진행하세요. 부상 주의!"
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#E63946] resize-none"
          />
        </div>

        {/* 등록 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-[#E63946] rounded-xl text-white font-black text-lg tracking-wider uppercase disabled:opacity-50 transition"
        >
          {submitting ? "등록 중..." : "WOD 등록"}
        </button>
      </div>
    </main>
  );
}
