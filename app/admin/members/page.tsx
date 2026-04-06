"use client";

import HomeHeader from "@/app/components/ui/HomeHeader";
import { useAdminGuard } from "@/hooks/auth/useAdminGuard";
import { useAuth } from "@/context/AuthContext";
import { useUserInfo } from "@/hooks/user/useUserInfo";
import { useGymManager } from "@/hooks/user/useGymManager";
import { getGymUsers, getGymMembers, removeGymMember, updateGymMemberRole, getGymMember } from "@/lib/firestore";
import { Gym, GymMember, User } from "@/types/wod";
import { PUBLIC_GYM_ID } from "@/lib/constants";
import { useEffect, useState } from "react";

export default function AdminMembersPage() {
  const { user } = useAuth();
  const { isAdmin, checking } = useAdminGuard();
  const { userInfo, refetch } = useUserInfo(user?.uid ?? "");
  const isMaster = userInfo?.role === "master";

  const { gyms, gymsLoading } = useGymManager(user?.uid ?? "", userInfo?.currentGymId ?? "", refetch);

  // 선택된 체육관
  const [selectedGymId, setSelectedGymId] = useState<string>("");

  // 멤버 목록
  const [members, setMembers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<GymMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // 첫 번째 체육관 자동 선택 (public 제외)
  useEffect(() => {
    if (!selectedGymId && gyms.length > 0) {
      const first = gyms.find((g) => g.id !== PUBLIC_GYM_ID);
      if (first) setSelectedGymId(first.id);
    }
  }, [gyms]);

  // 체육관 선택 시 멤버 로드
  useEffect(() => {
    if (!selectedGymId) return;
    let canclled = false;
    const fetchMembers = async () => {
      setMembers([]);
      setMemberships([]);
      setMembersLoading(true);
      try {
        const [users, mships] = await Promise.all([getGymUsers(selectedGymId), getGymMembers(selectedGymId)]);
        if (canclled) return;
        setMembers(users);
        setMemberships(mships);
      } catch (error) {
        alert("멤버목록을 불러오지 못했습니다.");
      } finally {
        setMembersLoading(false);
      }
    };
    fetchMembers();
    return () => {
      canclled = true; // clean Up
    };
  }, [selectedGymId]);

  const getMembership = (userId: string) => memberships.find((m) => m.userId === userId);

  // 강퇴
  const handleKick = async (targetUser: User) => {
    if (!confirm(`"${targetUser.name}"을 강퇴할까요?`)) return;
    try {
      const membership = await getGymMember(selectedGymId, targetUser.id);
      if (membership) {
        await removeGymMember(membership.id);
        setMembers((prev) => prev.filter((m) => m.id !== targetUser.id));
        setMemberships((prev) => prev.filter((m) => m.userId !== targetUser.id));
      }
    } catch (error: any) {
      alert(error.message ?? "강퇴 실패");
    }
  };

  // 역할 변경
  const handleRoleChange = async (targetUser: User, newRole: "admin" | "member") => {
    const membership = getMembership(targetUser.id);
    if (!membership) return;
    try {
      await updateGymMemberRole(membership.id, newRole);
      setMemberships((prev) => prev.map((m) => (m.id === membership.id ? { ...m, role: newRole } : m)));
    } catch (error: any) {
      alert(error.message ?? "역할 변경 실패");
    }
  };

  const filteredGyms = gyms.filter((g) => g.id !== PUBLIC_GYM_ID);

  if (checking) return <div className="min-h-screen bg-[#0a0a0a]" />;
  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pt-4 pb-24">
      <HomeHeader />
      <h1 className="text-2xl font-black text-white mb-6">
        멤버 <span className="text-[#E63946]">관리</span>
      </h1>

      {/* 체육관 탭 필터 */}
      {gymsLoading ? (
        <div className="text-zinc-500 text-sm mb-4">불러오는 중...</div>
      ) : filteredGyms.length === 0 ? (
        <div className="text-zinc-600 text-sm mb-4">관리할 체육관이 없어요</div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {filteredGyms.map((gym) => (
            <button
              key={gym.id}
              onClick={() => setSelectedGymId(gym.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border transition ${
                selectedGymId === gym.id ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"
              }`}
            >
              {gym.imageUrl ? <img src={gym.imageUrl} alt={gym.name} className="w-5 h-5 rounded object-cover" /> : <span>🏋️</span>}
              {gym.name}
            </button>
          ))}
        </div>
      )}

      {/* 멤버 목록 */}
      {selectedGymId && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">멤버 {members.length}명</p>
          </div>

          {membersLoading ? (
            <div className="text-zinc-500 text-sm text-center py-10">불러오는 중...</div>
          ) : members.length === 0 ? (
            <div className="text-zinc-600 text-sm text-center py-10">멤버가 없어요</div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => {
                const membership = getMembership(member.id);
                const isMe = member.id === user?.uid;
                const memberRole = membership?.role ?? "member";

                return (
                  <div key={member.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* 프로필 이미지 */}
                      {member.profileImage ? (
                        <img src={member.profileImage} alt={member.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex-shrink-0" />
                      )}

                      {/* 이름 + 역할 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-black text-sm truncate">{member.name}</p>
                          {isMe && <span className="text-xs text-zinc-500">(나)</span>}
                        </div>
                        <p className="text-zinc-500 text-xs">
                          {member.gender === "male" ? "남" : "여"} · {member.weight}
                          {member.unit}
                        </p>
                      </div>

                      {/* 역할 뱃지 */}
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                          memberRole === "admin" ? "bg-[#E63946]/20 text-[#E63946]" : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {memberRole}
                      </span>
                    </div>

                    {/* 액션 버튼 (본인 제외) */}
                    {!isMe && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
                        {/* 역할 변경 */}
                        <button
                          onClick={() => handleRoleChange(member, memberRole === "admin" ? "member" : "admin")}
                          className="flex-1 py-1.5 border border-zinc-700 rounded-lg text-zinc-400 text-xs font-bold hover:border-[#E63946] hover:text-[#E63946] transition"
                        >
                          {memberRole === "admin" ? "→ member" : "→ admin"}
                        </button>
                        {/* 강퇴 */}
                        <button
                          onClick={() => handleKick(member)}
                          className="flex-1 py-1.5 border border-red-900 rounded-lg text-red-600 text-xs font-bold hover:border-red-500 hover:text-red-400 transition"
                        >
                          강퇴
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
