import { getTodayWod } from "@/lib/firestore";
import { Wod } from "@/types/wod";
import { useEffect, useState } from "react";

export const useTodayWod = () => {
  const [wod, setWod] = useState<Wod | null>(null);
  const [wodLoading, setWodLoading] = useState(true);

  // WOD 데이터 불러오기
  useEffect(() => {
    const fetchWod = async () => {
      const data = await getTodayWod();
      setWod(data);
      setWodLoading(false);
    };
    fetchWod();
  }, []);
  return { wod, wodLoading };
};
