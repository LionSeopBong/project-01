import { useCalendar } from "@/hooks/user/useCalendar";
import { getLocalToday } from "@/lib/utils";

export default function AttendanceCalendar({ userId, onDateClick }: { userId: string; onDateClick?: (date: string) => void }) {
  const { attendance } = useCalendar(userId);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = getLocalToday();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-xs text-zinc-600 font-bold">
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isAttended = attendance.includes(dateStr);
          const isToday = dateStr === today;

          return (
            <div key={d} className="flex items-center justify-center">
              <div
                onClick={() => onDateClick?.(dateStr)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition cursor-pointer
                  ${isAttended ? "bg-[#E63946] text-white" : ""}
                  ${isToday && !isAttended ? "border border-[#E63946] text-[#E63946]" : ""}
                  ${!isAttended && !isToday ? "text-zinc-600" : ""}
                `}
              >
                {d}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
