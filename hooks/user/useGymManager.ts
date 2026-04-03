import { useEffect, useRef, useState } from "react";
import {
  createGym,
  deleteGym,
  getGym,
  getGymMember,
  getGymUsers,
  getUserGymMemberships,
  joinGymByCode,
  leaveGym,
  removeGymMember,
  switchCurrentGym,
  updateGym,
} from "@/lib/firestore";
import { uploadGymImage } from "@/lib/storage";
import { Gym, User } from "@/types/wod";
import { GYM_CODE_LENGTH, PUBLIC_GYM_ID } from "@/lib/constants";

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

  // 수정(master)
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [editGymName, setEditGymName] = useState("");
  const [editGymCode, setEditGymCode] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  //멤버 관리(admin)
  const [memberGym, setMemberGym] = useState<Gym | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

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
      await joinGymByCode(joinCode.trim().toUpperCase(), userId, false); // 추가 가입 → currentGymId 유지
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

  // user: 체육관 탈퇴
  const handleLeave = async (gymId: string, gymName: string) => {
    if (!userId) return;
    if (gymId === PUBLIC_GYM_ID) return alert("Solo Athlete 는 기본값입니다");
    if (!confirm(`"${gymName}"에서 탈퇴할까요?`)) return;
    try {
      await leaveGym(userId, gymId);
      await refetchUser();
      await fetchGyms();
    } catch (error: any) {
      alert(error.message ?? "탈퇴 실패");
    }
  };

  // admin : 멤버 목록 열기
  const handleOpenMembers = async (gym: Gym) => {
    setMemberGym(gym);
    setMembersLoading(true);
    try {
      const users = await getGymUsers(gym.id);
      setMembers(users);
    } finally {
      setMembersLoading(false);
    }
  };
  // admin: 멤버 강퇴
  const handleKickMember = async (targetUserId: string, targetName: string) => {
    if (!memberGym) return;
    if (!confirm(`"${targetName}"을 강퇴할까요?`)) return;
    try {
      const membership = await getGymMember(memberGym.id, targetUserId);
      if (membership) await removeGymMember(membership.id);
      setMembers((prev) => prev.filter((m) => m.id !== targetUserId));
    } catch (error: any) {
      alert(error.message ?? "강퇴 실패");
    }
  };
  // ── master: 체육관 수정 열기 ──
  const handleOpenEdit = (gym: Gym) => {
    setEditingGym(gym);
    setEditGymName(gym.name);
    setEditGymCode(gym.code);
  };

  // master: 체육관 수정 저장
  const handleEditSave = async () => {
    if (!editingGym) return;
    if (!editGymName.trim()) return alert("체육관 이름을 입력해주세요.");
    if (editGymCode.trim().length !== GYM_CODE_LENGTH) return alert(`코드는 ${GYM_CODE_LENGTH}자리여야 합니다.`);
    setEditLoading(true);
    try {
      await updateGym(editingGym.id, {
        name: editGymName.trim(),
        code: editGymCode.trim().toUpperCase(),
      });
      await fetchGyms();
      setEditingGym(null);
    } catch (error: any) {
      alert(error.message ?? "수정 실패");
    } finally {
      setEditLoading(false);
    }
  };

  // master: 체육관 삭제
  const handleDeleteGym = async (gymId: string, gymName: string) => {
    if (gymId === PUBLIC_GYM_ID) return alert("Solo Athlete 체육관은 삭제할 수 없어요.");
    if (!confirm(`"${gymName}" 체육관을 삭제할까요? 이 작업은 되돌릴 수 없어요.`)) return;
    try {
      await deleteGym(gymId);
      await fetchGyms();
    } catch (error: any) {
      alert(error.message ?? "삭제 실패");
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
    // 목록
    gyms,
    gymsLoading,
    fetchGyms,
    // 모드
    gymMode,
    setGymMode,
    cancelMode,
    // 가입
    joinCode,
    setJoinCode,
    joinLoading,
    handleJoin,
    // 생성
    newGymName,
    setNewGymName,
    newGymCode,
    setNewGymCode,
    newGymImagePreview,
    handleImageChange,
    imageInputRef,
    createLoading,
    handleCreate,
    // 전환
    handleSwitch,
    // 탈퇴 (user)
    handleLeave,
    // 멤버 관리 (admin)
    memberGym,
    setMemberGym,
    members,
    membersLoading,
    handleOpenMembers,
    handleKickMember,
    // 수정/삭제 (master)
    editingGym,
    setEditingGym,
    editGymName,
    setEditGymName,
    editGymCode,
    setEditGymCode,
    editLoading,
    handleOpenEdit,
    handleEditSave,
    handleDeleteGym,
  };
};
