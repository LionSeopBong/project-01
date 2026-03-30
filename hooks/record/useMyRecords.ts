import { useState, useEffect } from "react";
import { WorkoutRecord } from "@/types/wod";
import { getMyRecords } from "@/lib/firestore";

export const useMyRecords = (userId: string, gymId: string) => {
  const [myRecords, setMyRecords] = useState<WorkoutRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const fetchRecords = async () => {
    if (!userId || !gymId) return;
    setRecordsLoading(true);
    try {
      const data = await getMyRecords(userId, gymId);
      setMyRecords(data);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [userId, gymId]);

  return { myRecords, recordsLoading, refetch: fetchRecords };
};
