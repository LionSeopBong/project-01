import Link from "next/link";
import { Wod } from "@/types/wod";

interface WodCardProps {
  wod: Wod;
  showDetail?: boolean; // 홈에서 자세히 보기 버튼 표시 여부
}

export default function WodCard({ wod, showDetail = true }: WodCardProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 space-y-6">
      {/* WOD 제목 */}
      <h2 className="text-2xl font-black text-white tracking-tight">{wod.title}</h2>

      {/* 파트별 렌더링 */}
      {wod.parts.map((part, index) => (
        <div key={index} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[#E63946]">{part.part}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">{part.label}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#E63946] border border-[#E63946] px-2 py-0.5 rounded-full uppercase tracking-widest">{part.type}</span>
            {part.type === "Every" && part.interval && <span className="text-xs text-zinc-400">{part.interval}</span>}
            {part.timeCap > 0 && <span className="text-xs text-zinc-500">Time Cap {Math.floor(part.timeCap / 60)}min</span>}
            {part.rounds > 0 && part.type !== "Every" && <span className="text-xs text-zinc-500">{part.rounds} Rounds</span>}
          </div>

          {part.isLadder && (
            <p className="text-xs text-zinc-400">{Array.from({ length: 4 }, (_, i) => part.ladderStart + i * part.ladderIncrement).join(" - ")} - - -</p>
          )}

          <ul className="space-y-2">
            {part.movements.map((movement, movIndex) => (
              <li key={movIndex} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] shrink-0" />
                <span className="text-white text-sm font-medium">
                  {movement.distance > 0 ? `${movement.distance}${movement.unit} ${movement.name}` : `${movement.reps} ${movement.name}`}
                </span>
              </li>
            ))}
          </ul>

          {index < wod.parts.length - 1 && <div className="border-t border-zinc-800 pt-2" />}
        </div>
      ))}

      {/* 전체 메모 */}
      {wod.note && (
        <div className="bg-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">📝 공지</p>
          <p className="text-sm text-zinc-300">{wod.note}</p>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="pt-4 border-t border-zinc-800">
        {showDetail ? (
          // 홈 → 자세히 보기
          <Link href="/wod" className="block text-center text-sm font-bold text-[#E63946] tracking-widest uppercase">
            자세히 보기 →
          </Link>
        ) : (
          // WOD 페이지 → 댓글로 스크롤
          <button
            onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full text-center text-sm font-bold text-zinc-400 hover:text-white tracking-widest uppercase transition"
          >
            ✅ Done
          </button>
        )}
      </div>
    </div>
  );
}
