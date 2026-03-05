import { db } from "@/lib/firebase";
import { User, Wod, WodComment } from "@/types/wod";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

//오늘 날짜 WOD 조회
export const getTodayWod = async (): Promise<Wod | null> => {
  // const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // console.log("오늘 날짜:", today);

  const q = query(collection(db, "wods"), where("date", "==", today), limit(1));

  const snapshot = await getDocs(q);
  // console.log("결과 개수:", snapshot.size);
  // console.log(
  //   "데이터:",
  //   snapshot.docs.map((doc) => doc.data()),
  // );

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Wod;
};

export const getUser = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return { id: userSnap.id, ...userSnap.data() } as User;
};

export const createWod = async (wodData: Omit<Wod, "id">) => {
  const ref = await addDoc(collection(db, "wods"), {
    ...wodData,
    createdAt: Timestamp.now(),
  });
  return ref.id;
};

// 날짜로 WOD 조회 (Prev/Next용)
export const getWodByDate = async (date: string): Promise<Wod | null> => {
  const q = query(collection(db, "wods"), where("date", "==", date), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Wod;
};
// WOD 삭제
export const deleteWod = async (wodId: string) => {
  await deleteDoc(doc(db, "wods", wodId));
};

// WOD 수정
export const updateWod = async (wodId: string, wodData: Partial<Omit<Wod, "id">>) => {
  const ref = doc(db, "wods", wodId);
  await updateDoc(ref, wodData);
};
// 댓글 조회
export const getComments = async (wodId: string): Promise<WodComment[]> => {
  const q = query(collection(db, "comments"), where("wodId", "==", wodId), orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as WodComment[];
};
// 댓글 등록
export const addComment = async (comment: Omit<WodComment, "id">) => {
  const ref = await addDoc(collection(db, "comments"), {
    ...comment,
    createdAt: Timestamp.now(),
  });
  return ref.id;
};
// 댓글 삭제
export const deleteComments = async (CommentID: string) => {
  await deleteDoc(doc(db, "comments", CommentID));
};
// 댓글 좋아요
export const toggleLike = async (commentId: string, userId: string, isLiked: boolean) => {
  const commentRef = doc(db, "comments", commentId);

  if (isLiked) {
    // 취소
    await updateDoc(commentRef, {
      likedBy: arrayRemove(userId),
      likes: increment(-1),
    });
  } else {
    // 추가
    await updateDoc(commentRef, {
      likedBy: arrayUnion(userId),
      likes: increment(1),
    });
  }
};
