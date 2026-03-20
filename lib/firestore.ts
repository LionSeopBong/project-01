import { db } from "@/lib/firebase";
import { getLocalToday } from "@/lib/utils";
import { Notification, PrRecord, User, Wod, WodComment, WorkoutRecord } from "@/types/wod";
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
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

//오늘 날짜 WOD 조회
export const getTodayWod = async (): Promise<Wod | null> => {
  const today = getLocalToday();
  const q = query(collection(db, "wods"), where("date", "==", today), limit(1));

  const snapshot = await getDocs(q);
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

// 같은 WOD 의 내 모든 파트 기록 불러오기
export const getMyWodRecords = async (userId: string, wodId: string): Promise<WorkoutRecord[]> => {
  const q = query(collection(db, "workoutRecords"), where("userId", "==", userId), where("wodId", "==", wodId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as unknown as WorkoutRecord[];
};

// 댓글 등록
export const addComment = async (comment: Omit<WodComment, "id">) => {
  const { createdAt, ...rest } = comment;
  await addDoc(collection(db, "comments"), {
    ...rest,
    createdAt: Timestamp.now(), // ← 수정
  });
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

// 기록등록
export const addWorkoutRecord = async (record: Omit<WorkoutRecord, "id">) => {
  const ref = await addDoc(collection(db, "workoutRecords"), {
    ...record,
    createdAt: Timestamp.now(),
  });
  return ref.id;
};
// 내 기록 조회
export const getMyRecords = async (userId: string): Promise<WorkoutRecord[]> => {
  const q = query(collection(db, "workoutRecords"), where("userId", "==", userId), orderBy("completedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as unknown as WorkoutRecord[];
};
// 월별 출석 날짜 조회
export const getMonthlyAttendance = async (userId: string, yearMonth: string): Promise<string[]> => {
  const q = query(
    collection(db, "workoutRecords"),
    where("userId", "==", userId),
    where("completedAt", ">=", `${yearMonth}-01`),
    where("completedAt", "<=", `${yearMonth}-31`),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data().completedAt as string);
};
// 특정 날짜 + 타입별 리더보드 조회
export const getLeaderboard = async (date: string): Promise<WorkoutRecord[]> => {
  const q = query(collection(db, "workoutRecords"), where("completedAt", "==", date));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as unknown as WorkoutRecord[];
};
// 나의 오늘 기록 삭제
export const deleteWorkoutRecord = async (id: string) => {
  await deleteDoc(doc(db, "workoutRecords", id));
};
// 레코드 페이지 한개 기록 조회
export const getWorkoutRecord = async (id: string): Promise<WorkoutRecord | null> => {
  const docRef = doc(db, "workoutRecords", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as WorkoutRecord;
};

// 기록 수정
export const updateWorkoutRecord = async (id: string, record: Partial<WorkoutRecord>) => {
  const docRef = doc(db, "workoutRecords", id);
  await updateDoc(docRef, record);
};
// 유저 정보 생성
export const createUser = async (uid: string, data: Omit<User, "id" | "createdAt">) => {
  await setDoc(doc(db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
};
// 유저 정보수정
export const updateUser = async (uid: string, data: Partial<User>) => {
  await updateDoc(doc(db, "users", uid), data);
};
// PR 기록 추가
export const addPrRecord = async (record: Omit<PrRecord, "id">) => {
  await addDoc(collection(db, "prRecords"), record);
};

// PR 기록 조회
export const getMyPrRecords = async (userId: string): Promise<PrRecord[]> => {
  const q = query(collection(db, "prRecords"), where("userId", "==", userId), orderBy("recordedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as unknown as PrRecord[];
};
// PR 기록 삭제
export const deletePrRecord = async (id: string) => {
  await deleteDoc(doc(db, "prRecords", id));
};
// 알림 조회
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const q = query(collection(db, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as unknown as Notification[];
};

// 알림 읽음 처리
export const markNotificationRead = async (id: string) => {
  await updateDoc(doc(db, "notifications", id), { isRead: true });
};

// 알림 전체 읽음 처리
export const markAllNotificationsRead = async (userId: string) => {
  const notifications = await getNotifications(userId);
  const unread = notifications.filter((n) => !n.isRead);
  await Promise.all(unread.map((n) => markNotificationRead(n.id)));
};

// 알림 생성
export const createNotification = async (data: Omit<Notification, "id">) => {
  const { createdAt, ...rest } = data;
  const now = Timestamp.now();
  console.log("Timestamp.now()", now); // ← 추가
  await addDoc(collection(db, "notifications"), {
    ...rest,
    createdAt: now,
  });
};
// 전체 유저 알림
export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as unknown as User[];
};
