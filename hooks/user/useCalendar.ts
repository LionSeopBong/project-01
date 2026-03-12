import { useEffect, useState } from "react";
import { getMonthlyAttendance } from "@/lib/firestore";
import { getLocalToday, getYearMonth } from "@/lib/utils";

export const useCalendar = (userId: string | undefined) => {
  const [attendance, setAttendance] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const yearMonth = getYearMonth(new Date());
      const att = await getMonthlyAttendance(userId, yearMonth);
      setAttendance(att);
    };
    fetch();
  }, [userId]);

  return { attendance };
};
