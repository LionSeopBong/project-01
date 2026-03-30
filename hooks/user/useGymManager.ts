import { useEffect, useRef, useState } from "react";
import { createGym, getGym, getUserGymMemberships, joinGymByCode, switchCurrentGym, updateGym } from "@/lib/firestore";
import { uploadGymImage } from "@/lib/storage";
import { Gym } from "@/types/wod";
import { GYM_CODE_LENGTH } from "@/lib/constants";

type GymMode = "idle" | "join" | "create";

export const useGymManager = (userId: string, currentGymId: string, refetchUser: () => Promise<void>) => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [gymsLoading, setGymsLoading] = useState(false);
  const [gymMode, setGymMode] = useState<GymMode>("idle");

  // 가입
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  // 생성
  const [newGymName, setNewGymName] = useState("");
  const [newGymCode, setNewGymCode] = useState("");
  const [newGymImage, setNewGymImage] = useState<File | null>(null);
  const [newGymImagePreview, setNewGymImagePreview] = useState<string>("");
  const [createLoading, setCreateLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchGyms = async () => {
    if (!userId) return;
    setGymsLoading(true);
    try {
      const memberships = await getUserGymMemberships(userId);
      const gymList = await Promise.all(memberships.map((m) => getGym(m.gymId)));
      setGyms(gymList.filter(Boolean) as Gym[]);
    } finally {
      setGymsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchGyms();
  }, [userId]);

  // 이미지 파일 선택
  const handleImageChange = (file: File | null) => {
    if (!file) return;
    setNewGymImage(file);
    setNewGymImagePreview(URL.createObjectURL(file));
  };

  // 체육관 전환
  const handleSwitch = async (gymId: string) => {
    if (!userId || gymId === currentGymId) return;
    try {
      await switchCurrentGym(userId, gymId);
      await refetchUser();
    } catch (error: any) {
      alert(error.message ?? "전환 실패");
    }
  };

  // 체육관 가입
  const handleJoin = async () => {
    if (!userId || joinCode.trim().length !== GYM_CODE_LENGTH) return;
    setJoinLoading(true);
    try {
      await joinGymByCode(joinCode.trim().toUpperCase(), userId);
      await refetchUser();
      await fetchGyms();
      setJoinCode("");
      setGymMode("idle");
    } catch (error: any) {
      alert(error.message ?? "가입 실패");
    } finally {
      setJoinLoading(false);
    }
  };

  // 체육관 생성
  const handleCreate = async () => {
    if (!userId) return;
    if (!newGymName.trim()) return alert("체육관 이름을 입력해주세요.");
    if (newGymCode.trim().length !== GYM_CODE_LENGTH) return alert(`코드는 ${GYM_CODE_LENGTH}자리여야 합니다.`);
    setCreateLoading(true);
    try {
      const gymId = await createGym(userId, {
        name: newGymName.trim(),
        code: newGymCode.trim().toUpperCase(),
      });

      // 이미지 있으면 업로드 후 URL 저장
      if (newGymImage) {
        const imageUrl = await uploadGymImage(gymId, newGymImage);
        await updateGym(gymId, { imageUrl } as any);
      }

      await refetchUser();
      await fetchGyms();
      setNewGymName("");
      setNewGymCode("");
      setNewGymImage(null);
      setNewGymImagePreview("");
      setGymMode("idle");
    } catch (error: any) {
      alert(error.message ?? "생성 실패");
    } finally {
      setCreateLoading(false);
    }
  };

  const cancelMode = () => {
    setGymMode("idle");
    setJoinCode("");
    setNewGymName("");
    setNewGymCode("");
    setNewGymImage(null);
    setNewGymImagePreview("");
  };

  return {
    gyms,
    gymsLoading,
    gymMode,
    setGymMode,
    cancelMode,
    joinCode,
    setJoinCode,
    joinLoading,
    handleJoin,
    newGymName,
    setNewGymName,
    newGymCode,
    setNewGymCode,
    newGymImagePreview,
    handleImageChange,
    imageInputRef,
    createLoading,
    handleCreate,
    handleSwitch,
  };
};
