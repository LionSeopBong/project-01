"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { updateWod } from "@/lib/firestore";
import { WodPart } from "@/types/wod";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useWod } from "@/hooks/useWod";

const WOD_TYPES = ["For Time", "AMRAP", "EMOM", "Every", "Strength", "Accessory"];

export default function EditWodPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const { isAdmin, checking } = useAdminGuard();
  const { wod, wodLoading } = useWod(id);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [parts, setParts] = useState<WodPart[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // wod 데이터 로드되면 state에 세팅
  useEffect(() => {
    if (wod) {
      setTitle(wod.title);
      setDate(wod.date);
      setNote(wod.note ?? "");
      setParts(wod.parts);
    }
  }, [wod]);

  // 파트 필드 수정
  const updatePart = (index: number, field: keyof WodPart, value: any) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    setParts(updated);
  };

  // WOD 수정 저장
  const handleSubmit = async () => {
    if (!date) return alert("날짜를 입력해주세요.");
    if (!title) return alert("WOD 제목을 입력해주세요.");
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

  if (checking || wodLoading) return <div className="min-h-screen bg-[#0a0a0a]" />;
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

      <div className="space-y-6">
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
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-[#E63946]">{part.part} 파트</span>
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
            {/* 무게 항목 */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-3 block">무게</label>
              <div className="space-y-2">
                {part.weights?.map((w, wIndex) => (
                  <div key={wIndex} className="flex gap-2 items-center">
                    {/* 도구 선택 */}
                    <select
                      value={w.tool}
                      onChange={(e) => {
                        const updated = [...parts];
                        updated[partIndex].weights[wIndex].tool = e.target.value;
                        setParts(updated);
                      }}
                      className="bg-zinc-800 rounded-lg px-1.5 py-2 text-white text-sm focus:outline-none"
                    >
                      <option value="Barbell">Barbell</option>
                      <option value="Dumbbell">Dumbbell</option>
                      <option value="Kettlebell">Kettlebell</option>
                      <option value="Other">Other</option>
                    </select>
                    {/* 남성 무게 */}
                    <input
                      type="number"
                      value={w.maleWeight}
                      onChange={(e) => {
                        const updated = [...parts];
                        updated[partIndex].weights[wIndex].maleWeight = Number(e.target.value);
                        setParts(updated);
                      }}
                      placeholder="♂"
                      className="w-12 bg-blue-950 border border-blue-700 rounded-lg px-1.5 py-2 text-blue-300 text-sm focus:outline-none"
                    />

                    {/* 여성 무게 */}
                    <input
                      type="number"
                      value={w.femaleWeight}
                      onChange={(e) => {
                        const updated = [...parts];
                        updated[partIndex].weights[wIndex].femaleWeight = Number(e.target.value);
                        setParts(updated);
                      }}
                      placeholder="♀"
                      className="w-12 bg-pink-950 border border-pink-700 rounded-lg px-1.5 py-2 text-pink-300 text-sm focus:outline-none"
                    />

                    {/* 단위 선택 */}
                    <select
                      value={w.unit}
                      onChange={(e) => {
                        const updated = [...parts];
                        updated[partIndex].weights[wIndex].unit = e.target.value;
                        setParts(updated);
                      }}
                      className="bg-zinc-800 rounded-lg px-1 py-2 text-white text-sm focus:outline-none"
                    >
                      <option value="lb">lb</option>
                      <option value="kg">kg</option>
                    </select>

                    {/* 삭제 */}
                    <button
                      onClick={() => {
                        const updated = [...parts];
                        updated[partIndex].weights = updated[partIndex].weights.filter((_, i) => i !== wIndex);
                        setParts(updated);
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
                  const updated = [...parts];
                  updated[partIndex].weights = [...(updated[partIndex].weights ?? []), { tool: "Barbell", maleWeight: 0, femaleWeight: 0, unit: "lb" }];
                  setParts(updated);
                }}
                className="mt-3 w-full py-2.5 border border-dashed border-zinc-700 rounded-xl text-zinc-500 text-sm hover:border-[#E63946] hover:text-[#E63946] transition"
              >
                + 무게 추가
              </button>
            </div>
            {/* 파트 메모 */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">메모</label>
              <textarea
                value={part.note}
                onChange={(e) => updatePart(partIndex, "note", e.target.value)}
                placeholder="예: 21-15-9 / Every 1:30 x 5sets"
                rows={3}
                className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none border border-transparent focus:border-[#E63946] resize-none"
              />
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
