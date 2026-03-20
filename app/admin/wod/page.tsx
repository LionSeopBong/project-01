"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { createNotification, createWod, getAllUsers } from "@/lib/firestore";
import { WodPart } from "@/types/wod";
import { useAdminGuard } from "@/hooks/auth/useAdminGuard";

const PART_LABELS = ["A", "B", "C"] as const;
const WOD_TYPES = ["For Time", "AMRAP", "EMOM", "Every", "Strength", "Accessory"];
const defaultPart = (part: "A" | "B" | "C"): WodPart => ({
  part,
  label: "",
  type: "For Time",
  rounds: 0,
  timeCap: 0,
  movements: [],
  note: "",
  noRounds: false,
  noTimeCap: false,
  weights: [],
  isTeam: false,
  teamSize: 2,
});

export default function AdminWodPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 관리자 체크

  const { isAdmin, checking } = useAdminGuard();

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

  // WOD 등록
  const handleSubmit = async () => {
    if (!date) return alert("날짜를 입력해주세요.");
    if (!title) return alert("WOD 제목을 입력해주세요.");

    setSubmitting(true);
    try {
      await createWod({
        date,
        parts,
        title,
        note,
        createdAt: null,
      });
      // 모든 유저에게 알림 전송
      const users = await getAllUsers();
      await Promise.all(
        users.map((u) =>
          createNotification({
            userId: u.id,
            type: "wod_registered",
            message: `오늘의 WOD가 등록되었어요! 📋`,
            isRead: false,
            // createdAt: null,
            link: "/wod",
          }),
        ),
      );
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

      <div className="space-y-6">
        {/* WOD 제목 */}
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
              <span className="text-xl font-black text-[#E63946]">{part.part} 파트</span>
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

            {/* 무게 항목 */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-3 block">무게</label>
              <div className="space-y-2">
                {part.weights?.map((w, wIndex) => (
                  <div key={wIndex} className="flex gap-2 items-center flex-wrap">
                    {/* 도구 선택 */}
                    <select
                      value={w.tool}
                      onChange={(e) => {
                        const updated = [...parts];
                        updated[partIndex].weights[wIndex].tool = e.target.value;
                        setParts(updated);
                      }}
                      className="bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                    >
                      <option value="Barbell">Barbell</option>
                      <option value="Dumbbell">Dumbbell</option>
                      <option value="Kettlebell">Kettlebell</option>
                      <option value="Other">Other</option>
                    </select>

                    {/* 남성 무게 */}
                    <input
                      type="number"
                      value={w.maleWeight || ""}
                      onChange={(e) => {
                        const updated = [...parts];
                        updated[partIndex].weights[wIndex].maleWeight = Number(e.target.value);
                        setParts(updated);
                      }}
                      placeholder="♂"
                      className="w-20 bg-blue-950 border border-blue-700 rounded-lg px-3 py-2 text-blue-300 text-sm focus:outline-none"
                    />

                    {/* 여성 무게 */}
                    <input
                      type="number"
                      value={w.femaleWeight || ""}
                      onChange={(e) => {
                        const updated = [...parts];
                        updated[partIndex].weights[wIndex].femaleWeight = Number(e.target.value);
                        setParts(updated);
                      }}
                      placeholder="♀"
                      className="w-20 bg-pink-950 border border-pink-700 rounded-lg px-3 py-2 text-pink-300 text-sm focus:outline-none"
                    />

                    {/* 단위 선택 */}
                    <select
                      value={w.unit}
                      onChange={(e) => {
                        const updated = [...parts];
                        updated[partIndex].weights[wIndex].unit = e.target.value;
                        setParts(updated);
                      }}
                      className="bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
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
            {/* 팀 설정 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id={`team-${partIndex}`}
                  checked={part.isTeam}
                  onChange={(e) => updatePart(partIndex, "isTeam", e.target.checked)}
                  className="accent-[#E63946]"
                />
                <label htmlFor={`team-${partIndex}`} className="text-sm text-zinc-400">
                  팀 WOD
                </label>
              </div>

              {part.isTeam && (
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">팀 인원수</label>
                  <div className="flex gap-2">
                    {[2, 3, 4].map((size) => (
                      <button
                        key={size}
                        onClick={() => updatePart(partIndex, "teamSize", size)}
                        className={`px-5 py-2 rounded-xl text-sm font-bold border transition ${
                          part.teamSize === size ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                        }`}
                      >
                        {size}인
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* 와드 설명 */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">WOD</label>
              <textarea
                value={part.note}
                onChange={(e) => updatePart(partIndex, "note", e.target.value)}
                placeholder="예: 21-15-9 / Every 1:30 x 5sets"
                rows={3}
                className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#E63946] border border-transparent resize-none"
              />
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
