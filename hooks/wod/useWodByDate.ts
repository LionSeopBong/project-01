import { useEffect, useState } from "react";
import { getWodByDate } from "@/lib/firestore";
import { Wod } from "@/types/wod";

export const useWodByDate = (dateStr: string, gymId: string) => {
  const [wod, setWod] = useState<Wod | null>(null);
  const [wodLoading, setWodLoading] = useState(true);

  useEffect(() => {
    if (!dateStr || !gymId) return;

    const fetch = async () => {
      setWodLoading(true);
      setWod(null);
      const data = await getWodByDate(dateStr, gymId);
      setWod(data);
      setWodLoading(false);
    };
    fetch();
  }, [dateStr, gymId]);

  return { wod, wodLoading };
};
