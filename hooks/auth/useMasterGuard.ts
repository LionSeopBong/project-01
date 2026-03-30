import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/firestore";

// master 전용 가드 - master role만 접근 가능
export const useMasterGuard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMaster, setIsMaster] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/");
      return;
    }

    const check = async () => {
      const userData = await getUser(user.uid);

      if (!userData) {
        router.push("/onboarding/profile");
        return;
      }

      if (!userData.currentGymId) {
        router.push("/onboarding/gym");
        return;
      }

      if (userData.role !== "master") {
        router.push("/home");
        return;
      }

      setIsMaster(true);
      setChecking(false);
    };

    check();
  }, [user, loading]);

  return { isMaster, checking };
};
