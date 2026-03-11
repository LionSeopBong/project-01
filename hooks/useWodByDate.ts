import { useEffect, useState } from "react";
import { getWodByDate } from "@/lib/firestore";
import { Wod } from "@/types/wod";

const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const useWodByDate = (currentDate: Date) => {
  const [wod, setWod] = useState<Wod | null>(null);
  const [wodLoading, setWodLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setWodLoading(true);
      setWod(null);
      const data = await getWodByDate(formatDate(currentDate));
      setWod(data);
      setWodLoading(false);
    };
    fetch();
  }, [currentDate]);

  return { wod, wodLoading };
};
