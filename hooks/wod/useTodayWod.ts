import { getTodayWod } from "@/lib/firestore";
import { Wod } from "@/types/wod";
import { useEffect, useState } from "react";

export const useTodayWod = (gymId: string) => {
  const [wod, setWod] = useState<Wod | null>(null);
  const [wodLoading, setWodLoading] = useState(true);

  // WOD 데이터 불러오기
  useEffect(() => {
    if (!gymId) return;
    const fetchWod = async () => {
      const data = await getTodayWod(gymId);
      setWod(data);
      setWodLoading(false);
    };
    fetchWod();
  }, [gymId]);
  return { wod, wodLoading };
};
