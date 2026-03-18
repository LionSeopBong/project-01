import { useState, useEffect, useCallback } from "react";
import { Notification } from "@/types/wod";
import { getNotifications, markAllNotificationsRead } from "@/lib/firestore";

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setNotificationsLoading(true);
    try {
      const data = await getNotifications(userId);
      setNotifications(data);
    } finally {
      setNotificationsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const readAll = async () => {
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return { notifications, notificationsLoading, unreadCount, readAll, refetch: fetchNotifications };
};
