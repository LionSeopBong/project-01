// 로컬 시간 기준 오늘 날짜 (YYYY-MM-DD)
export const getLocalToday = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

// 로컬 시간 기준 년월 (YYYY-MM)
export const getYearMonth = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
