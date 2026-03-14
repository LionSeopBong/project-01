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
        if (a.isDNF && !b.isDNF) return 1;
        if (!a.isDNF && b.isDNF) return -1;
        return (a.finishTime ?? 0) - (b.finishTime ?? 0);
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
      if (record.isDNF) return `DNF · ${record.rounds ?? 0}R ${record.reps ?? 0}reps`;
      const min = Math.floor((record.finishTime ?? 0) / 60);
      const sec = (record.finishTime ?? 0) % 60;
      return `${min}:${String(sec).padStart(2, "0")}`;
    case "AMRAP":
      if (record.hasTotalRepsOnly) return `${record.totalReps ?? 0} reps`;
      return `${record.rounds ?? 0}R ${record.reps ?? 0}reps`;
    case "EMOM":
      if (record.hasTotalRepsOnly) return `${record.totalReps ?? 0} reps`;
      return `Fail ${record.failCount ?? 0}`;
    default:
      return record.memo ?? "-";
  }
};
