"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { getUser, updateWod } from "@/lib/firestore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Wod, WodPart, Movement } from "@/types/wod";

const WOD_TYPES = ["For Time", "AMRAP", "EMOM", "Every", "Strength", "Accessory"];

const defaultMovement = (): Movement => ({
  name: "",
  reps: 0,
  distance: 0,
  unit: "reps",
});

export default function EditWodPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [parts, setParts] = useState<WodPart[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // 관리자 체크 + 기존 데이터 불러오기
  useEffect(() => {
    const init = async () => {
      if (!loading && !user) {
        router.push("/");
        return;
      }
      if (user) {
        const userData = await getUser(user.uid);
        if (userData?.role !== "admin") {
          router.push("/home");
          return;
        }
        setIsAdmin(true);

        // 기존 WOD 데이터 불러오기
        const wodRef = doc(db, "wods", id);
        const wodSnap = await getDoc(wodRef);
        if (wodSnap.exists()) {
          const data = wodSnap.data() as Wod;
          setTitle(data.title);
          setDate(data.date);
          setNote(data.note ?? "");
          setParts(data.parts);
        }
        setChecking(false);
      }
    };
    init();
  }, [user, loading]);

  // 파트 수정 함수들 (등록 페이지와 동일)
  const updatePart = (index: number, field: keyof WodPart, value: any) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    setParts(updated);
  };

  const addMovement = (partIndex: number) => {
    const updated = [...parts];
    updated[partIndex].movements.push(defaultMovement());
    setParts(updated);
  };

  const removeMovement = (partIndex: number, movIndex: number) => {
    const updated = [...parts];
    updated[partIndex].movements = updated[partIndex].movements.filter((_, i) => i !== movIndex);
    setParts(updated);
  };

  const updateMovement = (partIndex: number, movIndex: number, field: keyof Movement, value: string | number) => {
    const updated = [...parts];
    updated[partIndex].movements[movIndex] = { ...updated[partIndex].movements[movIndex], [field]: value };
    setParts(updated);
  };

  // WOD 수정 저장
  const handleSubmit = async () => {
    if (!date) return alert("날짜를 입력해주세요.");
    setSubmitting(true);
    try {
      await updateWod(id, { title, date, note, parts });
      alert("WOD 수정 완료!");
      router.push("/wod");
    } catch (error) {
      console.error(error);
      alert("수정 실패");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return <div className="min-h-screen bg-[#0a0a0a]" />;
  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pt-10 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition">
          ← 뒤로
        </button>
        <h1 className="text-2xl font-black text-white">
          WOD <span className="text-[#E63946]">수정</span>
        </h1>
      </div>

      <div className="space-y-8">
        {/* 제목 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">WOD 제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
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
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-[#E63946]">{part.part}</span>
              <input
                value={part.label}
                onChange={(e) => updatePart(partIndex, "label", e.target.value)}
                className="bg-zinc-800 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none w-40"
              />
            </div>

            {/* 타입 */}
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

            {part.type === "Every" && (
              <input
                value={part.interval}
                onChange={(e) => updatePart(partIndex, "interval", e.target.value)}
                placeholder="예: Every 1:30"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
              />
            )}

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-zinc-500 mb-2 block">{part.type === "Every" ? "세트" : "라운드"}</label>
                <input
                  type="number"
                  value={part.rounds}
                  onChange={(e) => updatePart(partIndex, "rounds", Number(e.target.value))}
                  className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                />
              </div>
              {["For Time", "AMRAP", "EMOM"].includes(part.type) && (
                <div className="flex-1">
                  <label className="text-xs text-zinc-500 mb-2 block">타임캡 (분)</label>
                  <input
                    type="number"
                    value={part.timeCap}
                    onChange={(e) => updatePart(partIndex, "timeCap", Number(e.target.value))}
                    className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* 래더 */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={part.isLadder}
                onChange={(e) => updatePart(partIndex, "isLadder", e.target.checked)}
                className="accent-[#E63946]"
              />
              <label className="text-sm text-zinc-400">래더 렙수 (3-6-9-12...)</label>
            </div>

            {part.isLadder && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-zinc-500 mb-2 block">시작 렙수</label>
                  <input
                    type="number"
                    value={part.ladderStart}
                    onChange={(e) => updatePart(partIndex, "ladderStart", Number(e.target.value))}
                    className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-zinc-500 mb-2 block">증가 단위</label>
                  <input
                    type="number"
                    value={part.ladderIncrement}
                    onChange={(e) => updatePart(partIndex, "ladderIncrement", Number(e.target.value))}
                    className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 무브먼트 */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-3 block">무브먼트</label>
              <div className="space-y-3">
                {part.movements.map((movement, movIndex) => (
                  <div key={movIndex} className="bg-zinc-800 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between">
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
                      placeholder="무브먼트명"
                      className="w-full bg-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                    />
                    {!part.isLadder && (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={movement.reps}
                          onChange={(e) => updateMovement(partIndex, movIndex, "reps", Number(e.target.value))}
                          placeholder="Reps"
                          className="flex-1 bg-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                        />
                        <input
                          type="number"
                          value={movement.distance}
                          onChange={(e) => updateMovement(partIndex, movIndex, "distance", Number(e.target.value))}
                          placeholder="Distance"
                          className="flex-1 bg-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                        />
                        <select
                          value={movement.unit}
                          onChange={(e) => updateMovement(partIndex, movIndex, "unit", e.target.value)}
                          className="flex-1 bg-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
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

        {/* 전체 메모 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">📝 공지 / 메모</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E63946] resize-none"
          />
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-[#E63946] rounded-xl text-white font-black text-lg tracking-wider uppercase disabled:opacity-50 transition"
        >
          {submitting ? "저장 중..." : "수정 저장"}
        </button>
      </div>
    </main>
  );
}
