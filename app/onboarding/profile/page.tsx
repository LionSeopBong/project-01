"use client";

import { useAuthGuard } from "@/hooks/auth/useAuthGuard";
import { createUser } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
const CODE_LENGTH = 6;

export default function OnboardingProfilePage() {
  const { user, loading } = useAuthGuard();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState(0);
  const [height, setHeight] = useState(0);
  const [unit, setUnit] = useState<"kg" | "lb">("kg");

  useEffect(() => {
    // 뒤로가기 방지
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, "", window.location.href);
    };
  }, []);

  const handleSubmit = async () => {
    if (!user) return;
    if (!name) return alert("닉네임을 입력해주세요.");
    setSubmitting(true);
    try {
      await createUser(user.uid, {
        name,
        gender,
        weight,
        height,
        unit,
        profileImage: user.photoURL ?? "",
        role: "user",
        currentGymId: "",
      });
      // router.push("/home");
      router.push("/onboarding/gym");
    } catch (error) {
      console.error(error);
      alert("저장 실패");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pt-10 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">
          프로필 <span className="text-[#E63946]">설정</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">기본 정보를 입력해주세요</p>
      </div>

      <div className="space-y-6">
        {/* 이름 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">닉네임</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="닉네임을 입력해주세요"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946]"
          />
        </div>

        {/* 성별 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">성별</label>
          <div className="flex gap-2">
            {[
              { key: "male", label: "남" },
              { key: "female", label: "여" },
            ].map((g) => (
              <button
                key={g.key}
                onClick={() => setGender(g.key as "male" | "female")}
                className={`px-8 py-2 rounded-xl text-sm font-black border transition ${
                  gender === g.key ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* 단위 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">단위</label>
          <div className="flex gap-2">
            {["kg", "lb"].map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u as "kg" | "lb")}
                className={`px-8 py-2 rounded-xl text-sm font-black border transition ${
                  unit === u ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* 몸무게 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">몸무게 ({unit})</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            placeholder="0"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946]"
          />
        </div>

        {/* 키 */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">키 (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            placeholder="0"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946]"
          />
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-[#E63946] rounded-xl text-white font-black text-lg tracking-wider uppercase disabled:opacity-50 transition"
        >
          {submitting ? "저장 중..." : "시작하기"}
        </button>
      </div>
    </main>
  );
}
