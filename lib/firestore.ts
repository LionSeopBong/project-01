import { db } from "@/lib/firebase";
import { getLocalToday } from "@/lib/utils";
import { Notification, PrRecord, User, Wod, WodComment, WorkoutRecord, Gym, GymMember } from "@/types/wod";
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
export const getTodayWod = async (gymId: string): Promise<Wod | null> => {
  const today = getLocalToday();
  const q = query(collection(db, "wods"), where("gymId", "==", gymId), where("date", "==", today), limit(1));

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
export const getWodByDate = async (date: string, gymId: string): Promise<Wod | null> => {
  const q = query(collection(db, "wods"), where("gymId", "==", gymId), where("date", "==", date), limit(1));
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
export const getMyRecords = async (userId: string, gymId: string): Promise<WorkoutRecord[]> => {
  const q = query(collection(db, "workoutRecords"), where("gymId", "==", gymId), where("userId", "==", userId), orderBy("completedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as unknown as WorkoutRecord[];
};
// 월별 출석 날짜 조회
export const getMonthlyAttendance = async (userId: string, yearMonth: string, gymId: string): Promise<string[]> => {
  const q = query(
    collection(db, "workoutRecords"),
    where("userId", "==", userId),
    where("gymId", "==", gymId),
    where("completedAt", ">=", `${yearMonth}-01`),
    where("completedAt", "<=", `${yearMonth}-31`),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data().completedAt as string);
};
// 특정 날짜 + 타입별 리더보드 조회
export const getLeaderboard = async (date: string, gymId: string): Promise<WorkoutRecord[]> => {
  const q = query(collection(db, "workoutRecords"), where("gymId", "==", gymId), where("completedAt", "==", date));
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
// PR 기록 하나만 등록하도록 업데이트
export const updatePrRecord = async (id: string, data: Partial<PrRecord>) => {
  await updateDoc(doc(db, "prRecords", id), data);
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
  await addDoc(collection(db, "notifications"), {
    ...rest,
    createdAt: now,
  });
};
// 박스별 전체 유저 알림 //getAllUsers
export const getGymUsers = async (gymId: string): Promise<User[]> => {
  const memberSnap = await getDocs(query(collection(db, "gymMembers"), where("gymId", "==", gymId)));
  const uids = memberSnap.docs.map((d) => d.data().userId as string);
  if (!uids.length) return [];

  const chunks: string[][] = [];
  for (let i = 0; i < uids.length; i += 30) chunks.push(uids.slice(i, i + 30));

  const results = await Promise.all(chunks.map((chunk) => getDocs(query(collection(db, "users"), where("__name__", "in", chunk)))));

  return results.flatMap((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as User));
};
// 알림 단건 삭제
export const deleteNotification = async (id: string) => {
  await deleteDoc(doc(db, "notifications", id));
};

// 읽은 알림 전체 삭제
export const deleteReadNotifications = async (userId: string) => {
  const notifications = await getNotifications(userId);
  const read = notifications.filter((n) => n.isRead);
  await Promise.all(read.map((n) => deleteNotification(n.id)));
};

// Gym ********************************************************************************
// 체육관 생성
export const createGym = async (adminID: string, data: Pick<Gym, "name" | "code">): Promise<string> => {
  const existing = await getGymByCode(data.code);
  if (existing) throw new Error("이미 사용 중인 체육관 코드입니다.");

  const ref = await addDoc(collection(db, "gyms"), {
    ...data,
    adminID,
    createdAt: serverTimestamp(),
  });
  //생성자를 admin 멤버로 자동등록
  await addGymMember({ gymId: ref.id, userId: adminID, role: "admin" });
  await updateDoc(doc(db, "users", adminID), { currnetGymId: ref.id });
  return ref.id;
};

// 체육관 단건 조회
export const getGym = async (gymId: string): Promise<Gym | null> => {
  const snap = await getDoc(doc(db, "gyms", gymId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Gym;
};

// 코드로 체육관 조회 (가입 시 사용)
export const getGymByCode = async (code: string): Promise<Gym | null> => {
  const q = query(collection(db, "gyms"), where("code", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Gym;
};

// 체육관 정보 수정
export const updateGym = async (gymId: string, data: Partial<Pick<Gym, "name" | "code">>) => {
  await updateDoc(doc(db, "gyms", gymId), data);
};
// 체육관 삭제
export const deleteGym = async (gymId: string) => {
  await deleteDoc(doc(db, "gyms", gymId));
};

// GYM MEMBER ********************************************************************************
//멤버 추가 (가입)
export const addGymMember = async (data: Omit<GymMember, "id" | "joinedAt">): Promise<string> => {
  const ref = await addDoc(collection(db, "gymMembers"), {
    ...data,
    joinedAt: serverTimestamp(),
  });
  return ref.id;
};
// 특정 체육관(박스) 전체 멤버 조회
export const getGymMembers = async (gymId: string): Promise<GymMember[]> => {
  const q = query(collection(db, "GymMembers"), where("gymId", "==", gymId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as GymMember[];
};
// 유저가 속한 체육관 멤버십 목록 조회
export const getUserGymMemberships = async (userId: string): Promise<GymMember[]> => {
  const q = query(collection(db, "gymMembers"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as GymMember[];
};
// 특정 체육관에서 유저의 멤버십 조회
export const getGymMember = async (gymId: string, userId: string): Promise<GymMember | null> => {
  const q = query(collection(db, "gymMembers"), where("gymId", "==", gymId), where("userId", "==", userId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as GymMember;
};
//멤버 역할 변경
export const updateGymMemberRole = async (memberId: string, role: "admin" | "member") => {
  await updateDoc(doc(db, "gymMembers", memberId), { role });
};
// 멤버 삭제 (탈퇴 / 강퇴)
export const removeGymMember = async (memberId: string) => {
  await deleteDoc(doc(db, "gymMembers", memberId));
};

// 체육관가입 플로우 ********************************************************************************
export const joinGymByCode = async (code: string, userId: string): Promise<string> => {
  const gym = await getGymByCode(code);
  if (!gym) throw new Error("존재하지 않는 박스(체육관) 코드입니다.");

  // 이미 멤버인지 확인
  const existing = await getGymMember(gym.id, userId);
  if (existing) throw new Error("이미 가입된 박스(체육관)입니다.");

  await addGymMember({ gymId: gym.id, userId, role: "member" });

  // currentGymId 업데이트
  await updateDoc(doc(db, "users", userId), { currentGymId: gym.id });

  return gym.id;
};

// 현재 체육관 전환 (user.currentGymId 변경)
// 이미 멤버인 체육관만 전환 가능
export const switchCurrentGym = async (userId: string, gymId: string): Promise<void> => {
  const membership = await getGymMember(gymId, userId);
  if (!membership) throw new Error("가입된 박스(체육관)이 아닙니다.");

  await updateDoc(doc(db, "users", userId), { currentGymId: gymId });
};

//  체육관 탈퇴
//  탈퇴 후 currentGymId가 해당 체육관이면 다른 체육관으로 자동 전환
//  남은 체육관이 없으면 currentGymId = ""

export const leaveGym = async (userId: string, gymId: string): Promise<void> => {
  const membership = await getGymMember(gymId, userId);
  if (!membership) throw new Error("가입된 체육관이 아닙니다.");

  await removeGymMember(membership.id);

  // currentGymId 재조정
  const userSnap = await getDoc(doc(db, "users", userId));
  const userData = userSnap.data() as User;

  if (userData?.currentGymId === gymId) {
    const remaining = await getUserGymMemberships(userId);
    const nextGymId = remaining.length > 0 ? (remaining.find((m) => m.gymId !== gymId)?.gymId ?? "") : "";
    await updateDoc(doc(db, "users", userId), { currentGymId: nextGymId });
  }
};
