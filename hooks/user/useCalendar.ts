import { useEffect, useState } from "react";
import { getMonthlyAttendance } from "@/lib/firestore";
import { getLocalToday, getYearMonth } from "@/lib/utils";

export const useCalendar = (userId: string | undefined, gymId: string) => {
  const [attendance, setAttendance] = useState<string[]>([]);

  useEffect(() => {
    if (!userId || !gymId) return;
    const fetch = async () => {
      const yearMonth = getYearMonth(new Date());
      const att = await getMonthlyAttendance(userId, yearMonth, gymId);
      setAttendance(att);
    };
    fetch();
  }, [userId, gymId]);

  return { attendance };
};
