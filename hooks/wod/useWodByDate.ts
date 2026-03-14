import { useEffect, useState } from "react";
import { getWodByDate } from "@/lib/firestore";
import { Wod } from "@/types/wod";

export const useWodByDate = (dateStr: string) => {
  const [wod, setWod] = useState<Wod | null>(null);
  const [wodLoading, setWodLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setWodLoading(true);
      setWod(null);
      const data = await getWodByDate(dateStr);
      setWod(data);
      setWodLoading(false);
    };
    fetch();
  }, [dateStr]);

  return { wod, wodLoading };
};
