import { db } from "@/lib/firebase";
import { User, Wod } from "@/types/wod";
import { addDoc, collection, doc, getDoc, getDocs, limit, query, Timestamp, where } from "firebase/firestore";

//오늘 날짜 WOD 조회
export const getTodayWod = async (): Promise<Wod | null> => {
  const today = new Date().toISOString().split("T")[0];

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
    createAt: Timestamp.now(),
  });
  return ref.id;
};
