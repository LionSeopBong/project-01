import { getUser } from "@/lib/firestore";
import { User } from "@/types/wod";
import { useEffect, useState } from "react";

export const useUserInfo = (userId: string) => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  const fetchUserInfo = async () => {
    if (!userId) return;
    setUserLoading(true);
    try {
      const data = await getUser(userId);
      setUserInfo(data);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [userId]);

  return { userInfo, userLoading, refetch: fetchUserInfo };
};
