"use client";

import { PrRecord } from "@/types/wod";
import { PR_RADAR_CONFIG } from "@/lib/constants";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface Props {
  prRecords: PrRecord[];
}

export default function AthleteRadar({ prRecords }: Props) {
  const getBestPr = (exercise: string) => {
    const records = prRecords.filter((r) => r.exercise === exercise);
    if (!records.length) return null;
    const config = PR_RADAR_CONFIG.find((c) => c.exercise === exercise);

    return records.reduce((best, cur) => {
      if (config?.inverse) {
        // 시간 낮을수록 좋음 (Endurance, Conditioning)
        return (cur.time ?? 0) < (best.time ?? 0) ? cur : best;
      }
      if (exercise === "Pull-Up") {
        // reps 높을수록 좋음 (Skill)
        return (cur.reps ?? 0) > (best.reps ?? 0) ? cur : best;
      }
      // weight 높을수록 좋음 (Strength, Power)
      return (cur.weight ?? 0) > (best.weight ?? 0) ? cur : best;
    });
  };

  const getRadarScore = () => {
    return PR_RADAR_CONFIG.map((config) => {
      const best = getBestPr(config.exercise);
      if (!best) return { subject: config.subject, score: 0 };

      const value = config.inverse
        ? (best.time ?? 0) // Endurance, Conditioning
        : config.exercise === "Pull-Up"
          ? (best.reps ?? 0) // Skill
          : (best.weight ?? 0); // Strength, Power

      let score = 0;
      if (config.inverse) {
        score = value === 0 ? 0 : Math.min(100, Math.round((config.max / value) * 100));
      } else {
        score = Math.min(100, Math.round((value / config.max) * 100));
      }

      return { subject: config.subject, score };
    });
  };

  const radarData = getRadarScore();
  const totalScore = Math.round(radarData.reduce((sum, item) => sum + item.score, 0) / radarData.length);
  // AthleteRadar.tsx 에 추가
  console.log("prRecords", prRecords);
  console.log("radarData", radarData);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Athlete Profile</h2>
        <span className="text-[#E63946] font-black text-sm">{totalScore} pts</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#3f3f46" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#71717a", fontSize: 11, fontWeight: "bold" }} />
          <Radar dataKey="score" stroke="#E63946" fill="#E63946" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>

      {/* 점수 표시 */}
      <div className="grid grid-cols-5 gap-2 mt-2">
        {radarData.map((item) => (
          <div key={item.subject} className="text-center">
            <p className="text-[#E63946] font-black text-lg">{item.score}</p>
            <p className="text-zinc-600 text-xs">{item.subject}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
