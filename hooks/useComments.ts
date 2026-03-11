import { useState } from "react";
import { getComments, addComment, deleteComments, toggleLike } from "@/lib/firestore";
import { WodComment } from "@/types/wod";
import { Timestamp } from "firebase/firestore";

export const useComments = (wodId: string | undefined, userId: string | undefined) => {
  const [comments, setComments] = useState<WodComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async (id: string) => {
    const data = await getComments(id);
    setComments(data);
  };

  const handleAddComment = async (userName: string, profileImage: string) => {
    if (!commentText.trim() || !wodId || !userId) return;
    setSubmitting(true);
    try {
      await addComment({
        wodId,
        userId,
        userName,
        profileImage,
        content: commentText.trim(),
        likes: 0,
        likedBy: [],
        createdAt: Timestamp.now(),
      });
      setCommentText("");
      await fetchComments(wodId);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제할까요?")) return;
    if (!wodId) return;
    await deleteComments(commentId);
    await fetchComments(wodId);
  };

  const handleToggleLike = async (commentId: string, isLiked: boolean) => {
    if (!userId || !wodId) return;
    await toggleLike(commentId, userId, isLiked);
    await fetchComments(wodId);
  };

  return {
    comments,
    commentText,
    setCommentText,
    submitting,
    fetchComments,
    handleAddComment,
    handleDeleteComment,
    handleToggleLike,
  };
};
