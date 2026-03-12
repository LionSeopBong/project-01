import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Wod } from "@/types/wod";

// 기존 WOD 데이터 불러오기
export const useWod = (id: string) => {
  const [wod, setWod] = useState<Wod | null>(null);
  const [wodLoading, setWodLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const wodRef = doc(db, "wods", id);
      const wodSnap = await getDoc(wodRef);
      if (wodSnap.exists()) {
        setWod({ id: wodSnap.id, ...wodSnap.data() } as Wod);
      }
      setWodLoading(false);
    };
    fetch();
  }, [id]);

  return { wod, wodLoading };
};
