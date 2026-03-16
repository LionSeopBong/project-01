import { WorkoutRecord } from "@/types/wod";

// 로컬 시간 기준 오늘 날짜 (YYYY-MM-DD)
export const getLocalToday = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

// 로컬 시간 기준 년월 (YYYY-MM)
export const getYearMonth = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

// 리더보드 순차설정
export const getSortedRecords = (records: WorkoutRecord[]) => {
  if (!records.length) return [];
  const type = records[0].wodType;
  return [...records].sort((a, b) => {
    switch (type) {
      case "For Time":
        // 완주 > DNF
        if (!a.isDNF && b.isDNF) return -1;
        if (a.isDNF && !b.isDNF) return 1;
        // 둘 다 완주 → finishTime 오름차순
        if (!a.isDNF && !b.isDNF) return (a.finishTime ?? 0) - (b.finishTime ?? 0);
        // 둘 다 DNF → reps 내림차순
        if ((b.rounds ?? 0) !== (a.rounds ?? 0)) return (b.rounds ?? 0) - (a.rounds ?? 0);
        return (b.reps ?? 0) - (a.reps ?? 0);

      case "AMRAP":
        if (a.hasTotalRepsOnly) return (b.totalReps ?? 0) - (a.totalReps ?? 0);
        if ((b.rounds ?? 0) !== (a.rounds ?? 0)) return (b.rounds ?? 0) - (a.rounds ?? 0);
        return (b.reps ?? 0) - (a.reps ?? 0);

      case "EMOM":
        if (a.hasTotalRepsOnly) return (b.totalReps ?? 0) - (a.totalReps ?? 0);
        return (a.failCount ?? 0) - (b.failCount ?? 0);

      default:
        return 0;
    }
  });
};

export const getResultText = (record: WorkoutRecord) => {
  switch (record.wodType) {
    case "For Time":
      if (record.isDNF) {
        const parts = [];
        if (record.rounds) parts.push(`${record.rounds}R`);
        if (record.reps) parts.push(`${record.reps}reps`);
        return `DNF${parts.length ? ` · ${parts.join(" ")}` : ""}`;
      }
      const min = Math.floor((record.finishTime ?? 0) / 60);
      const sec = (record.finishTime ?? 0) % 60;
      return `${min}:${String(sec).padStart(2, "0")}`;

    case "AMRAP":
      if (record.hasTotalRepsOnly) return `${record.totalReps ?? 0} reps`;
      const parts2 = [];
      if (record.rounds) parts2.push(`${record.rounds}R`);
      if (record.reps) parts2.push(`${record.reps}reps`);
      return parts2.join(" ") || "-";

    case "EMOM":
      if (record.hasTotalRepsOnly) return `${record.totalReps ?? 0} reps`;
      return `Fail ${record.failCount ?? 0}`;

    default:
      return record.memo ?? "-";
  }
};
export const getLevelColor = (level: string) => {
  switch (level) {
    case "Athlete":
      return "text-yellow-400";
    case "R'xd":
      return "text-[#FF3B30]";
    case "Scale":
      return "text-green-400";
    case "Beginner":
      return "text-zinc-400";
    default:
      return "text-zinc-400";
  }
};
