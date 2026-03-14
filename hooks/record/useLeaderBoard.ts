import { useState, useEffect } from "react";
import { WorkoutRecord } from "@/types/wod";
import { getLeaderboard } from "@/lib/firestore";

export const useLeaderboard = (date: string) => {
  const [leaderboard, setLeaderboard] = useState<WorkoutRecord[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLeaderboardLoading(true);
    getLeaderboard(date)
      .then((data) => setLeaderboard(data))
      .finally(() => setLeaderboardLoading(false));
  }, [date]);

  return { leaderboard, leaderboardLoading };
};
