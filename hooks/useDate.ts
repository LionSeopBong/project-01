import { useEffect, useState } from "react";

export const useDate = () => {
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("ko-KR", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);
  return { dateStr };
};
