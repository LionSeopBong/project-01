import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getUser, getUserGymMemberships, updateUser } from "@/lib/firestore";

// 로그인 여부 + 체육관 가입 여부 확인
export const useAuthGuard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // 미로그인 → 랜딩
    if (!user) {
      router.push("/");
      return;
    }

    const checkGym = async () => {
      const userData = await getUser(user.uid);

      // 유저 데이터 없음 → 온보딩 처음부터
      if (!userData) {
        router.push("/onboarding/profile");
        return;
      }

      // currentGymId 있으면 통과
      if (userData.currentGymId) return;

      // currentGymId 없음 → gymMembers에서 자동 복구 시도
      const memberships = await getUserGymMemberships(user.uid);
      if (memberships.length > 0) {
        // 이미 가입된 체육관이 있으면 첫 번째로 자동 설정
        await updateUser(user.uid, { currentGymId: memberships[0].gymId });
        return;
      }

      // 가입된 체육관도 없음 → 온보딩 gym으로
      router.push("/onboarding/gym");
    };

    checkGym();
  }, [user, loading]);

  return { user, loading };
};
