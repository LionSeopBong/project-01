import { useState, useEffect } from "react";
import { WorkoutRecord } from "@/types/wod";
import { getMyRecords } from "@/lib/firestore";

export const useMyRecords = (userId: string) => {
  const [myRecords, setMyRecords] = useState<WorkoutRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const fetchRecords = async () => {
    if (!userId) return;
    setRecordsLoading(true);
    try {
      const data = await getMyRecords(userId);
      setMyRecords(data);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [userId]);

  return { myRecords, recordsLoading, refetch: fetchRecords };
};
