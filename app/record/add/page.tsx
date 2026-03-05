"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { getUser, addWorkoutRecord, getTodayWod } from "@/lib/firestore";
import { Wod } from "@/types/wod";

export default function AddRecordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const wodId = searchParams.get("wodId");

  const [selectedType, setSelectedType] = useState("");
  const [wod, setWod] = useState<Wod | null>(null);
  const [gender, setGender] = useState("");
  const [timeMinutes, setTimeMinutes] = useState(0);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [reps, setReps] = useState(0);
  const [level, setLevel] = useState("Rxd");
  const [submitting, setSubmitting] = useState(false);

  // 미로그인 시 리다이렉트
  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading]);

  // WOD 정보 + 유저 정보 불러오기
  useEffect(() => {
    const init = async () => {
      if (loading || !user) return; // ← loading 체크 추가

      const userData = await getUser(user.uid);
      setGender(userData?.gender ?? "");

      const todayWod = await getTodayWod();
      setWod(todayWod);

      // 첫 번째 파트 타입 자동 설정
      if (todayWod?.parts?.[0]?.type) {
        console.log("자동 설정 타입:", todayWod.parts[0].type); // ← 추가

        setSelectedType(todayWod.parts[0].type);
      }
    };
    init();
  }, [user, loading]);

  const handleSubmit = async () => {
    if (!user || !wod) return alert("오늘의 WOD가 없어요.");
    if (!gender) return alert("성별을 선택해주세요.");

    setSubmitting(true);
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      await addWorkoutRecord({
        userId: user.uid,
        userName: user.displayName ?? "익명",
        wodType: selectedType,
        gender,
        wodId: wod.id,
        wodName: wod.title,
        timeSeconds: timeMinutes * 60 + timeSeconds,
        reps,
        level,
        completedAt: today,
        createdAt: null,
      });

      alert("기록 등록 완료! 🔥");
      router.push("/record");
    } catch (error) {
      console.error(error);
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
      <div>
        <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">WOD 타입</label>
        <div className="flex flex-wrap gap-2">
          {wod?.parts.map((part) => (
            <button
              key={part.type}
              onClick={() => {
                setSelectedType(part.type);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                selectedType === part.type ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-900 border-zinc-700 text-zinc-400"
              }`}
            >
              {part.part} - {part.type}
            </button>
          ))}
        </div>
      </div>
      {/* 나중에 없앨 수 있음 */}
      <div className="space-y-6 mt-4">
        {/* 성별 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">성별</label>
          <div className="flex gap-3">
            {["male", "female"].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border transition ${
                  gender === g ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-900 border-zinc-700 text-zinc-400"
                }`}
              >
                {g === "male" ? "👨 Men" : "👩 Women"}
              </button>
            ))}
          </div>
        </div>
        {/* 나중에 없앨 수 있음 */}
        {/* 기록 타입 선택 */}
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
        {/* For Time, EMOM, Every → 시간 입력 */}

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
