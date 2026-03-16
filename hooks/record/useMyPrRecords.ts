import { useState, useEffect } from "react";
import { PrRecord } from "@/types/wod";
import { getMyPrRecords } from "@/lib/firestore";
//PR 기록
export const useMyPrRecords = (userId: string) => {
  const [prRecords, setPrRecords] = useState<PrRecord[]>([]);
  const [prLoading, setPrLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setPrLoading(true);
    getMyPrRecords(userId)
      .then((data) => setPrRecords(data))
      .finally(() => setPrLoading(false));
  }, [userId]);

  return { prRecords, prLoading };
};
