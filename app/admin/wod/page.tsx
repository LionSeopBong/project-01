"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getUser, createWod } from "@/lib/firestore";
import { Movement } from "@/types/wod";

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
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("For Time");
  const [rounds, setRounds] = useState(1);
  const [timeCap, setTimeCap] = useState(0);
  const [movements, setMovements] = useState<Movement[]>([{ name: "", reps: 0, distance: 0, unit: "reps" }]);
  const [submitting, setSubmitting] = useState(false);

  // 무브먼트 추가
  const addMovement = () => {
    setMovements([...movements, { name: "", reps: 0, distance: 0, unit: "reps" }]);
  };

  // 무브먼트 삭제
  const removeMovement = (index: number) => {
    setMovements(movements.filter((_, i) => i !== index));
  };

  // 무브먼트 수정
  const updateMovement = (index: number, field: keyof Movement, value: string | number) => {
    const updated = [...movements];
    updated[index] = { ...updated[index], [field]: value };
    setMovements(updated);
  };

  // WOD 등록
  const handleSubmit = async () => {
    if (!title || !date) return alert("제목과 날짜를 입력해주세요.");
    setSubmitting(true);
    try {
      await createWod({
        title,
        date,
        type,
        rounds,
        timeCap: timeCap * 60, // 분 → 초 변환
        movements,
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

      <div className="space-y-6">
        {/* 제목 */}
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

        {/* 타입 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">타입</label>
          <div className="flex gap-2">
            {["For Time", "AMRAP", "EMOM"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border transition ${
                  type === t ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-900 border-zinc-700 text-zinc-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 라운드 + 타임캡 */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">라운드</label>
            <input
              type="number"
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">타임캡 (분)</label>
            <input
              type="number"
              value={timeCap}
              onChange={(e) => setTimeCap(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
            />
          </div>
        </div>

        {/* 무브먼트 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-3 block">무브먼트</label>
          <div className="space-y-3">
            {movements.map((movement, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#E63946] font-bold">#{index + 1}</span>
                  {movements.length > 1 && (
                    <button onClick={() => removeMovement(index)} className="text-zinc-600 hover:text-red-500 text-xs transition">
                      삭제
                    </button>
                  )}
                </div>
                <input
                  value={movement.name}
                  onChange={(e) => updateMovement(index, "name", e.target.value)}
                  placeholder="무브먼트명 (예: 400m Run)"
                  className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={movement.reps}
                    onChange={(e) => updateMovement(index, "reps", Number(e.target.value))}
                    placeholder="Reps"
                    className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  />
                  <input
                    type="number"
                    value={movement.distance}
                    onChange={(e) => updateMovement(index, "distance", Number(e.target.value))}
                    placeholder="Distance"
                    className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  />
                  <select
                    value={movement.unit}
                    onChange={(e) => updateMovement(index, "unit", e.target.value)}
                    className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  >
                    <option value="reps">reps</option>
                    <option value="m">m</option>
                    <option value="km">km</option>
                    <option value="cal">cal</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addMovement}
            className="mt-3 w-full py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-500 text-sm hover:border-[#E63946] hover:text-[#E63946] transition"
          >
            + 무브먼트 추가
          </button>
        </div>

        {/* 등록 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-[#E63946] rounded-xl text-white font-black text-lg tracking-wider uppercase disabled:opacity-50 transition"
        >
          {submitting ? "등록 중..." : "WOD 등록"}
        </button>
        <button className="w-full py-4 bg-[#E63946] rounded-xl text-white font-black text-lg tracking-wider uppercase disabled:opacity-50 transition">
          취소
        </button>
      </div>
    </main>
  );
}
