import { useEffect, useState } from "react";
import { getUser } from "@/lib/firestore";

export const useIsAdmin = (userId: string | undefined) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const check = async () => {
      const userData = await getUser(userId);
      setIsAdmin(userData?.role === "admin");
    };
    check();
  }, [userId]);

  return { isAdmin };
};
