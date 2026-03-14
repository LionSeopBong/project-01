"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WodCard from "@/app/components/ui/WodCard";
import HomeHeader from "@/app/components/ui/HomeHeader";
import { useAuthGuard } from "@/hooks/auth/useAuthGuard";
import { useWodByDate } from "@/hooks/wod/useWodByDate";
import { useComments } from "@/hooks/social/useComments";
import { useIsAdmin } from "@/hooks/auth/useIsAdmin";
import ReactDatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export default function WodPage() {
  const { user, loading } = useAuthGuard();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  const isToday = formatDate(currentDate) === formatDate(today);

  const { wod, wodLoading } = useWodByDate(formatDate(currentDate));
  const { isAdmin } = useIsAdmin(user?.uid);
  const { comments, commentText, setCommentText, submitting, fetchComments, handleAddComment, handleDeleteComment, handleToggleLike } = useComments(
    wod?.id,
    user?.uid,
  );

  // wod 변경시 댓글 불러오기
  useEffect(() => {
    if (wod) fetchComments(wod.id);
  }, [wod]);
  if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24">
      <HomeHeader />

      <div className="px-4">
        {/* 날짜 네비게이션 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(addDays(currentDate, -1))}
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition text-sm font-bold"
          >
            ← Prev
          </button>

          <ReactDatePicker
            selected={currentDate}
            onChange={(date: Date | null) => {
              if (date) setCurrentDate(date);
            }}
            maxDate={today}
            locale={ko}
            dateFormat="yyyy.MM.dd"
            customInput={
              <button className="text-center">
                <p className="text-white font-bold text-sm">
                  {currentDate.toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  })}
                </p>
                {isToday && <span className="text-xs text-[#E63946] font-bold">TODAY</span>}
              </button>
            }
          />

          <button
            onClick={() => !isToday && setCurrentDate(addDays(currentDate, 1))}
            className={`flex items-center gap-1 text-sm font-bold transition ${
              isToday ? "text-zinc-700 cursor-not-allowed" : "text-zinc-400 hover:text-white"
            }`}
          >
            Next →
          </button>
        </div>

        {/* WOD 카드 */}
        <section>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{isToday ? "Today's WOD" : formatDate(currentDate)}</h2>
          {wodLoading ? (
            <div className="bg-zinc-900 rounded-2xl h-48 animate-pulse" />
          ) : wod && wod.parts ? (
            <WodCard wod={wod} showDetail={false} isAdmin={isAdmin} />
          ) : (
            <div className="bg-zinc-900 rounded-2xl p-5 text-zinc-500 text-sm text-center">이 날의 WOD가 등록되지 않았어요 😢</div>
          )}
        </section>

        {/* 댓글 섹션 */}
        {wod && (
          <section className="mt-8" id="comments">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">💬 Comments {comments.length > 0 && `(${comments.length})`}</h2>

            {/* 댓글 입력 */}
            <div className="flex gap-2 mb-6">
              {user?.photoURL && <img src={user.photoURL} alt="profile" className="w-8 h-8 rounded-full shrink-0" />}
              <div className="flex-1 flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment(user?.displayName ?? "익명", user?.photoURL ?? "")}
                  placeholder="오늘 WOD 어떠셨나요?"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#E63946]"
                />
                <button
                  onClick={() => handleAddComment(user?.displayName ?? "익명", user?.photoURL ?? "")}
                  disabled={submitting || !commentText.trim()}
                  className="px-4 py-2.5 bg-[#E63946] rounded-xl text-white text-sm font-bold disabled:opacity-50 transition"
                >
                  등록
                </button>
              </div>
            </div>

            {/* 댓글 목록 */}
            {comments.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">첫 번째 댓글을 남겨보세요! 🔥</p>
            ) : (
              <ul className="space-y-4">
                {comments.map((comment) => {
                  const isLiked = comment.likedBy?.includes(user?.uid ?? "");
                  return (
                    <li key={comment.id} className="flex gap-3">
                      {comment.profileImage ? (
                        <img src={comment.profileImage} alt={comment.userName} className="w-8 h-8 rounded-full shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-xs font-bold">{comment.userName}</span>
                          <span className="text-zinc-600 text-xs">{comment.createdAt?.toDate?.()?.toLocaleDateString("ko-KR")}</span>
                          <button onClick={() => handleToggleLike(comment.id, isLiked ?? false)} className="flex items-center mx-2 gap-1 transition">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill={isLiked ? "#E63946" : "none"}
                              stroke={isLiked ? "#E63946" : "#71717a"}
                              strokeWidth="2"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span className={`text-xs ${isLiked ? "text-[#E63946]" : "text-zinc-500"}`}>{comment.likes ?? 0}</span>
                          </button>
                          {user?.uid === comment.userId && (
                            <button onClick={() => handleDeleteComment(comment.id)} className="text-zinc-600 mx-2 hover:text-red-500 text-xs transition">
                              삭제
                            </button>
                          )}
                        </div>
                        <p className="text-zinc-300 text-sm">{comment.content}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
