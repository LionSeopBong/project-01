import Link from "next/link";
import { Wod } from "@/types/wod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteWod } from "@/lib/firestore";

interface WodCardProps {
  wod: Wod;
  showDetail?: boolean;
  isAdmin?: boolean;
}

export default function WodCard({ wod, showDetail = true, isAdmin = false }: WodCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("WOD를 삭제할까요?")) return;
    await deleteWod(wod.id);
    window.location.reload();
  };

  return (
    <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 space-y-6">
      {/* WOD 제목 */}
      <div className="flex items-start justify-between">
        <h2 className="text-2xl font-black text-white tracking-tight flex-1 pr-4">{wod.title}</h2>

        {/* 관리자 메뉴 */}
        {isAdmin && (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-zinc-800 rounded-lg transition">
              <svg width="20" height="5" viewBox="0 0 20 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0 2.5C0 1.12054 1.12054 0 2.5 0C3.87946 0 5 1.12054 5 2.5C5 3.87946 3.87946 5 2.5 5C1.12054 5 0 3.87946 0 2.5ZM7.5 2.5C7.5 1.12054 8.62054 0 10 0C11.3795 0 12.5 1.12054 12.5 2.5C12.5 3.87946 11.3795 5 10 5C8.62054 5 7.5 3.87946 7.5 2.5ZM17.5 0C18.8795 0 20 1.12054 20 2.5C20 3.87946 18.8795 5 17.5 5C16.1205 5 15 3.87946 15 2.5C15 1.12054 16.1205 0 17.5 0Z"
                  fill="white"
                />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden z-20 w-32 shadow-xl">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(`/admin/wod/edit/${wod.id}`);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-zinc-700 transition"
                  >
                    ✏️ 수정
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleDelete();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-zinc-700 transition"
                  >
                    🗑️ 삭제
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 파트별 렌더링 */}
      {wod.parts.map((part, index) => (
        <div key={index} className="space-y-3">
          {/* 파트명 + 타입 뱃지 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[#E63946]">{part.part}</span>
            <span className="text-xs font-bold text-[#E63946] border border-[#E63946] px-2 py-0.5 rounded-full uppercase tracking-widest">{part.type}</span>
          </div>
          {/* 무게 */}
          {part.weights && part.weights.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {part.weights.map((w, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400">{w.tool}</span>
                  <span className="text-xs bg-blue-950 text-blue-300 border border-blue-700 px-2 py-0.5 rounded-full">
                    {w.maleWeight}
                    {w.unit}
                  </span>
                  <span className="text-xs text-zinc-500">/</span>
                  <span className="text-xs bg-pink-950 text-pink-300 border border-pink-700 px-2 py-0.5 rounded-full">
                    {w.femaleWeight}
                    {w.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* 파트 메모 */}
          {part.note && <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{part.note}</p>}

          {index < wod.parts.length - 1 && <div className="border-t border-zinc-800 pt-2" />}
        </div>
      ))}

      {/* 전체 메모 */}
      {wod.note && (
        <div className="bg-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">📝</p>
          <p className="text-sm text-zinc-300">{wod.note}</p>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="pt-4 border-t border-zinc-800">
        {showDetail ? (
          <Link href="/wod" className="block text-center text-sm font-bold text-[#E63946] tracking-widest uppercase">
            자세히 보기 →
          </Link>
        ) : (
          <button
            onClick={() => router.push(`/record/add?wodId=${wod.id}`)}
            className="w-full text-center text-sm font-bold text-zinc-400 hover:text-white tracking-widest uppercase transition"
          >
            ✅ Done
          </button>
        )}
      </div>
    </div>
  );
}
