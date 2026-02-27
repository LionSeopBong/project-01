import { Movement } from "@/types/wod";
import Link from "next/link";

interface WodCardProps {
  title: string;
  type: string;
  rounds: number;
  timeCap: number;
  movements: Movement[];
}

export default function WodCard({ title, type, rounds, timeCap, movements = [] }: WodCardProps) {
  const minutes = Math.floor(timeCap / 60);
  return (
    <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-[#E63946] border border-[#E63946] px-2 py-0.5 rounded-full uppercase tracking-widest">{type}</span>
        {timeCap > 0 && <span className="text-xs text-zinc-500">Time Cap {minutes}min</span>}
      </div>
      {/* WOD 제목 */}
      <h2 className="text-2xl font-black text-white tracking-tight mb-1">{title}</h2>

      {/* 라운드 */}
      <p className="text-sm text-zinc-400 mb-4">{rounds} Rounds</p>

      {/* 무브먼트 목록 */}
      <ul className="space-y-2">
        {movements.map((movement, index) => (
          <li key={index} className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] shrink-0" />
            <span className="text-white text-sm font-medium">
              {movement.distance > 0 ? `${movement.distance}${movement.unit} ${movement.name}` : `${movement.reps} ${movement.name}`}
            </span>
          </li>
        ))}
      </ul>
      {/* 하단 구분선 + 시작 버튼 */}
      <div className="mt-5 pt-4 border-t border-zinc-800">
        <Link href="/wod" className="block text-center text-sm font-bold text-[#E63946] tracking-widest uppercase">
          {" "}
          자세히 보기 →
        </Link>
      </div>
    </div>
  );
}
