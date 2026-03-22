"use client";

import { PrRecord } from "@/types/wod";
import { PR_RADAR_CONFIG, SKILL_WEIGHTS, STRENGTH_WEIGHTS, POWER_WEIGHTS, ENDURANCE_WIGHTS } from "@/lib/constants";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface Props {
  prRecords: PrRecord[];
  gender: string;
}

export default function AthleteRadar({ prRecords, gender }: Props) {
  // 운동별 점수 계산
  const getExerciseScore = (exercise: string, maleMax: number, femaleMax: number, inverse: boolean, valueType: string) => {
    const max = gender === "male" ? maleMax : femaleMax;
    const records = prRecords.filter((r) => r.exercise === exercise);
    if (!records.length) return null;
    // 현재 - 최고 기록으로 상태를 보여줌
    const best = records.reduce((best, cur) => {
      if (valueType === "time") return (cur.time ?? 0) < (best.time ?? 0) ? cur : best;
      if (valueType === "reps") return (cur.reps ?? 0) > (best.reps ?? 0) ? cur : best;
      return (cur.weight ?? 0) > (best.weight ?? 0) ? cur : best;
    });
    // 최근 기록으로 현재 기록을 보여줌 (최신)
    // const best = records.reduce((best, cur) => (cur.recordedAt > best.recordedAt ? cur : best));

    let value = 0;

    if (valueType === "time") {
      value = best.time ?? 0;
      // Endurance 가중치 적용 (거리가 길수록 나누기)
      if (ENDURANCE_WIGHTS[exercise]) {
        value = value / ENDURANCE_WIGHTS[exercise];
      }
    } else if (valueType === "reps") {
      value = best.reps ?? 0;
      // Skill 가중치 적용
      if (SKILL_WEIGHTS[exercise]) {
        value = value * SKILL_WEIGHTS[exercise];
      }
    } else if (valueType === "weight") {
      value = best.weight ?? 0;
      // lb → kg 변환
      if (best.unit === "lb") {
        value = value * 0.453592;
      }
      // Power/Strength 가중치 적용
      if (POWER_WEIGHTS[exercise]) value = value * POWER_WEIGHTS[exercise];
      else if (STRENGTH_WEIGHTS[exercise]) value = value * STRENGTH_WEIGHTS[exercise];
    }

    if (value === 0) return null;

    return inverse ? Math.min(100, Math.round((max / value) * 100)) : Math.min(100, Math.round((value / max) * 100));
  };

  const getRadarScore = () => {
    return PR_RADAR_CONFIG.map((config) => {
      const scores = config.exercises
        .map((exercise) => getExerciseScore(exercise, config.maleMax, config.femaleMax, config.inverse, config.valueType))
        .filter((score): score is number => score !== null);

      if (scores.length === 0) return { subject: config.subject, score: 0 };

      const avg = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
      return { subject: config.subject, score: avg };
    });
  };

  const radarData = getRadarScore();
  const totalScore = Math.round(radarData.reduce((sum, item) => sum + item.score, 0) / radarData.length);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 mt-4">
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
