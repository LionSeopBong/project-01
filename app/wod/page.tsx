"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getWodByDate, getComments, addComment, deleteComments } from "@/lib/firestore";
import WodCard from "@/app/components/ui/WodCard";
import HomeHeader from "@/app/components/ui/HomeHeader";
import { Wod, WodComment } from "@/types/wod";
import { Timestamp } from "firebase/firestore";

// 날짜 포맷 유틸
const formatDate = (date: Date) => date.toISOString().split("T")[0];
const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export default function WodPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [wod, setWod] = useState<Wod | null>(null);
  const [wodLoading, setWodLoading] = useState(true);
  const [comments, setComments] = useState<WodComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const isToday = formatDate(currentDate) === formatDate(today);

  // 미로그인 시 리다이렉트
  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading]);

  // 날짜 변경시 WOD 불러오기
  useEffect(() => {
    const fetchWod = async () => {
      setWodLoading(true);
      setComments([]);
      const data = await getWodByDate(formatDate(currentDate));
      setWod(data);
      setWodLoading(false);

      // 댓글 불러오기
      if (data) {
        const commentData = await getComments(data.id);
        setComments(commentData);
      }
    };
    fetchWod();
  }, [currentDate]);

  // 댓글 등록
  const handleAddComment = async () => {
    if (!commentText.trim() || !wod || !user) return;
    setSubmitting(true);
    try {
      await addComment({
        wodId: wod.id,
        userId: user.uid,
        userName: user.displayName ?? "익명",
        profileImage: user.photoURL ?? "",
        content: commentText.trim(),
        createdAt: Timestamp.now(),
      });
      setCommentText("");
      // 댓글 새로고침
      const updated = await getComments(wod.id);
      setComments(updated);
    } finally {
      setSubmitting(false);
    }
  };
  //댓글 삭제
  const handleDeleteComment = async (commentID: string) => {
    if (!confirm("댓글을 삭제할까요?")) return;
    await deleteComments(commentID);
    const updated = await getComments(wod!.id);
    setComments(updated);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24">
      <HomeHeader />

      <div className="px-4">
        {/* 날짜 네비게이션 */}
        <div className="flex items-center justify-between mb-6">
          {/* Prev */}
          <button
            onClick={() => setCurrentDate(addDays(currentDate, -1))}
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition text-sm font-bold"
          >
            ← Prev
          </button>

          {/* 현재 날짜 */}
          <div className="text-center">
            <p className="text-white font-bold text-sm">{currentDate.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}</p>
            {isToday && <span className="text-xs text-[#E63946] font-bold">TODAY</span>}
          </div>

          {/* Next - 오늘이면 비활성 */}
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
            <WodCard wod={wod} showDetail={false} />
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
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="오늘 WOD 어떠셨나요?"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#E63946]"
                />
                <button
                  onClick={handleAddComment}
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
                {comments.map((comment) => (
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
                        {/* 본인 댓글에만 삭제 버튼 표시 */}
                        {user?.uid === comment.userId && (
                          <button onClick={() => handleDeleteComment(comment.id)} className="text-zinc-600 hover:text-red-500 text-xs transition">
                            삭제
                          </button>
                        )}
                      </div>
                      <p className="text-zinc-300 text-sm">{comment.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
