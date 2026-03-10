import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/firestore";
// 관리자 여부확인
export const useAdminGuard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!loading && !user) {
        router.push("/");
        return;
      }
      if (user) {
        const userData = await getUser(user.uid);
        if (userData?.role !== "admin") {
          router.push("/home");
          return;
        }
        setIsAdmin(true);
        setChecking(false);
      }
    };
    check();
  }, [user, loading]);

  return { isAdmin, checking };
};
