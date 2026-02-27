import { db } from "@/lib/firebase";
import { Wod } from "@/types/wod";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

//오늘 날짜 WOD 조회
export const getTodayWod = async (): Promise<Wod | null> => {
  const today = new Date().toISOString().split("T")[0];

  const q = query(collection(db, "wods"), where("date", "==", today), limit(1));

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Wod;
};
