"use client";
import { useAuth } from "@/context/AuthContext";
import { getTodayWod } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import WodCard from "@/app/components/ui/WodCard";
import { Wod } from "@/types/wod";
import HomeHeader from "@/app/components/ui/HomeHeader";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [wod, setWod] = useState<Wod | null>(null);
  const [wodLoading, setWodLoading] = useState(true);

  // 미로그인 시 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading]);

  // WOD 데이터 불러오기
  useEffect(() => {
    const fetchWod = async () => {
      const data = await getTodayWod();
      setWod(data);
      setWodLoading(false);
    };
    fetchWod();
  }, []);

  if (loading) return <div className="min-h-screen bg[#0a0a0a]" />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pt-10 pb-24">
      <HomeHeader />
      {/* 헤더 */}
      <div className="mb-6">
        <p className="text-zinc-500 text-sm">{new Date().toLocaleDateString("ko-KR", { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="text-2xl font-black text-white mt-1">안녕하세요 👋</h1>
      </div>

      {/* WOD 카드 */}
      <section>
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Today&apos;s WOD</h2>
        {wodLoading ? (
          <div className="bg-zinc-900 rounded-2xl h-48 animate-pulse" />
        ) : wod && wod.parts ? (
          <WodCard wod={wod} />
        ) : (
          <div className="bg-zinc-900 rounded-2xl p-5 text-zinc-500 text-sm text-center">오늘의 WOD가 아직 등록되지 않았어요 😢</div>
        )}
      </section>
    </main>
  );
}
