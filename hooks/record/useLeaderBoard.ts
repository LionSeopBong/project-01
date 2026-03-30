import { useState, useEffect } from "react";
import { WorkoutRecord } from "@/types/wod";
import { getLeaderboard } from "@/lib/firestore";

export const useLeaderboard = (date: string, gymId: string) => {
  const [leaderboard, setLeaderboard] = useState<WorkoutRecord[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    if (!date || !gymId) return;
    setLeaderboardLoading(true);
    getLeaderboard(date, gymId)
      .then((data) => setLeaderboard(data))
      .finally(() => setLeaderboardLoading(false));
  }, [date, gymId]);

  return { leaderboard, leaderboardLoading };
};
