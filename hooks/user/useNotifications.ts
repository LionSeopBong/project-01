import { useState, useEffect } from "react";
import { Notification } from "@/types/wod";
import { markAllNotificationsRead } from "@/lib/firestore";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"));

    // 실시간 구독 시작
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      }) as unknown as Notification[];
      setNotifications(data);
      setNotificationsLoading(false);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const readAll = async () => {
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return { notifications, notificationsLoading, unreadCount, readAll };
};
