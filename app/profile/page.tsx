"use client";

import HomeHeader from "@/app/components/ui/HomeHeader";
import { useAuthGuard } from "@/hooks/auth/useAuthGuard";
import { useUserInfo } from "@/hooks/user/useUserInfo";
import { useGymManager } from "@/hooks/user/useGymManager";
import { updateUser } from "@/lib/firestore";
import { logOut } from "@/lib/auth";
import { User } from "@/types/wod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { GYM_CODE_LENGTH, PUBLIC_GYM_ID } from "@/lib/constants";

export default function ProfilePage() {
  const { user, loading } = useAuthGuard();
  const { userInfo, userLoading, refetch } = useUserInfo(user?.uid ?? "");
  const router = useRouter();
  const role = userInfo?.role ?? "user";
  //익명 체크
  const isGuest = user?.isAnonymous ?? false;

  // 프로필 수정
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [submitting, setSubmitting] = useState(false);

  // 체육관 관리 훅
  const {
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
    handleLeave,
    memberGym,
    setMemberGym,
    members,
    membersLoading,
    handleOpenMembers,
    handleKickMember,
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
  } = useGymManager(user?.uid ?? "", userInfo?.currentGymId ?? "", refetch);

  const handleEdit = () => {
    setEditData({
      name: userInfo?.name,
      gender: userInfo?.gender,
      weight: userInfo?.weight,
      height: userInfo?.height,
      unit: userInfo?.unit,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await updateUser(user.uid, editData);
      await refetch();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("저장 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (user?.isAnonymous) {
      if (!confirm("게스트 데이터는 로그아웃 시 삭제됩니다.\n그래도 로그 아웃 하시겠습니까?")) return;
    }
    await logOut();
    router.push("/");
  };

  if (loading || userLoading) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pb-24">
      <HomeHeader />
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">
          My <span className="text-[#E63946]">Profile</span>
        </h1>
      </div>

      {/* 프로필 정보 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 mb-6">
        {!isEditing ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              {user?.photoURL && <Image src={user.photoURL} alt="profile" width={64} height={64} className="rounded-full" />}
              <div>
                <p className="text-white font-black text-lg">{userInfo?.name}</p>
                <p className="text-zinc-500 text-sm">{user?.email}</p>
                <span className="text-xs font-bold text-[#E63946] border border-[#E63946] px-2 py-0.5 rounded-full mt-1 inline-block uppercase">{role}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">성별</span>
              <span className="text-white font-bold">{userInfo?.gender === "male" ? "남" : "여"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">몸무게</span>
              <span className="text-white font-bold">
                {userInfo?.weight}
                {userInfo?.unit}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">키</span>
              <span className="text-white font-bold">{userInfo?.height}cm</span>
            </div>
            <button
              onClick={handleEdit}
              className="w-full py-2.5 border border-zinc-700 rounded-xl text-zinc-400 text-sm font-bold hover:border-[#E63946] hover:text-[#E63946] transition"
            >
              수정
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">닉네임</label>
              <input
                type="text"
                value={editData.name ?? ""}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">성별</label>
              <div className="flex gap-2">
                {[
                  { key: "male", label: "남" },
                  { key: "female", label: "여" },
                ].map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setEditData({ ...editData, gender: g.key })}
                    className={`px-8 py-2 rounded-xl text-sm font-black border transition ${editData.gender === g.key ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">단위</label>
              <div className="flex gap-2">
                {["kg", "lb"].map((u) => (
                  <button
                    key={u}
                    onClick={() => setEditData({ ...editData, unit: u })}
                    className={`px-8 py-2 rounded-xl text-sm font-black border transition ${editData.unit === u ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">몸무게 ({editData.unit})</label>
              <input
                type="number"
                value={editData.weight || ""}
                onChange={(e) => setEditData({ ...editData, weight: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">키 (cm)</label>
              <input
                type="number"
                value={editData.height || ""}
                onChange={(e) => setEditData({ ...editData, height: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 border border-zinc-700 rounded-xl text-zinc-400 text-sm font-bold transition"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex-1 py-2.5 bg-[#E63946] rounded-xl text-white text-sm font-black disabled:opacity-50 transition"
              >
                {submitting ? "저장 중..." : "저장"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── 체육관 섹션 ── */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">🏋️ 체육관</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          {/* 체육관 목록 */}
          {gymsLoading ? (
            <div className="text-zinc-500 text-sm text-center py-4">불러오는 중...</div>
          ) : gyms.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-2">가입된 체육관이 없어요</p>
          ) : (
            gyms.map((gym) => {
              const isActive = gym.id === userInfo?.currentGymId;
              const isPublic = gym.id === PUBLIC_GYM_ID;
              return (
                <div
                  key={gym.id}
                  className={`rounded-xl border p-3 transition ${isActive ? "border-[#E63946] bg-[#E63946]/10" : "border-zinc-700 bg-zinc-800"}`}
                >
                  {/* 체육관 기본 정보 */}
                  <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => handleSwitch(gym.id)} className="flex items-center gap-3 flex-1">
                      {gym.imageUrl ? (
                        <img src={gym.imageUrl} alt={gym.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">{isPublic ? "🌐" : "🏋️"}</span>
                        </div>
                      )}
                      <div className="text-left">
                        <p className={`text-sm font-black ${isActive ? "text-white" : "text-zinc-400"}`}>{gym.name}</p>
                        <p className="text-xs text-zinc-600">코드: {gym.code}</p>
                      </div>
                    </button>
                    {isActive && <span className="text-xs text-[#E63946] font-bold bg-[#E63946]/10 px-2 py-1 rounded-lg">현재</span>}
                  </div>

                  {/* role별 액션 버튼 */}
                  {!isPublic && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-zinc-700">
                      {/* user: 탈퇴 */}
                      {role === "user" && (
                        <button
                          onClick={() => handleLeave(gym.id, gym.name)}
                          className="flex-1 py-1.5 border border-zinc-600 rounded-lg text-zinc-500 text-xs font-bold hover:border-red-500 hover:text-red-500 transition"
                        >
                          탈퇴
                        </button>
                      )}
                      {/* admin: 멤버 관리 */}
                      {role === "admin" && (
                        <button
                          onClick={() => handleOpenMembers(gym)}
                          className="flex-1 py-1.5 border border-zinc-600 rounded-lg text-zinc-400 text-xs font-bold hover:border-[#E63946] hover:text-[#E63946] transition"
                        >
                          멤버 관리
                        </button>
                      )}
                      {/* master: 수정 + 삭제 */}
                      {role === "master" && (
                        <>
                          <button
                            onClick={() => handleLeave(gym.id, gym.name)}
                            className="flex-1 py-1.5 border border-zinc-600 rounded-lg text-zinc-500 text-xs font-bold hover:border-red-500 hover:text-red-500 transition"
                          >
                            탈퇴
                          </button>
                          <button
                            onClick={() => handleOpenEdit(gym)}
                            className="flex-1 py-1.5 border border-zinc-600 rounded-lg text-zinc-400 text-xs font-bold hover:border-[#E63946] hover:text-[#E63946] transition"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteGym(gym.id, gym.name)}
                            className="flex-1 py-1.5 border border-red-900 rounded-lg text-red-600 text-xs font-bold hover:border-red-500 hover:text-red-400 transition"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* 가입 폼 */}
          {gymMode === "join" && (
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <label className="text-xs text-zinc-500 uppercase tracking-widest block">체육관 코드 입력</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={GYM_CODE_LENGTH}
                placeholder={`${GYM_CODE_LENGTH}자리 코드`}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white uppercase tracking-widest text-center text-lg font-black placeholder-zinc-600 focus:outline-none focus:border-[#E63946] transition"
              />
              <div className="flex gap-2">
                <button onClick={cancelMode} className="flex-1 py-2.5 border border-zinc-700 rounded-xl text-zinc-400 text-sm font-bold transition">
                  취소
                </button>
                <button
                  onClick={handleJoin}
                  disabled={joinLoading || joinCode.length !== GYM_CODE_LENGTH}
                  className="flex-1 py-2.5 bg-[#E63946] rounded-xl text-white text-sm font-black disabled:opacity-30 transition"
                >
                  {joinLoading ? "가입 중..." : "가입하기"}
                </button>
              </div>
            </div>
          )}

          {/* 생성 폼 (master만) */}
          {gymMode === "create" && role === "master" && (
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">체육관 로고 (선택)</label>
                <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)} className="hidden" />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center hover:border-[#E63946] transition overflow-hidden"
                >
                  {newGymImagePreview ? (
                    <img src={newGymImagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">📷</span>
                      <span className="text-zinc-500 text-xs">이미지 선택</span>
                    </div>
                  )}
                </button>
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">체육관 이름</label>
                <input
                  type="text"
                  value={newGymName}
                  onChange={(e) => setNewGymName(e.target.value)}
                  placeholder="ex) CrossFit 강남"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946] transition"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">초대 코드 ({GYM_CODE_LENGTH}자리)</label>
                <input
                  type="text"
                  value={newGymCode}
                  onChange={(e) => setNewGymCode(e.target.value.toUpperCase())}
                  maxLength={GYM_CODE_LENGTH}
                  placeholder="ex) ABC123"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white uppercase tracking-widest text-center text-lg font-black placeholder-zinc-600 focus:outline-none focus:border-[#E63946] transition"
                />
                <p className="text-xs text-zinc-600 mt-1">멤버들이 이 코드로 가입해요</p>
              </div>
              <div className="flex gap-2">
                <button onClick={cancelMode} className="flex-1 py-2.5 border border-zinc-700 rounded-xl text-zinc-400 text-sm font-bold transition">
                  취소
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createLoading || !newGymName.trim() || newGymCode.length !== GYM_CODE_LENGTH}
                  className="flex-1 py-2.5 bg-[#E63946] rounded-xl text-white text-sm font-black disabled:opacity-30 transition"
                >
                  {createLoading ? "생성 중..." : "생성하기"}
                </button>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          {gymMode === "idle" && (
            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              {isGuest ? (
                // 게스트 일때
                <div className="w-full py-2.5 text-center text-zinc-500 text-sm">체육관 가입은 회원가입 후 이용이 가능합니다.</div>
              ) : (
                // 일반 유저

                <>
                  <button
                    onClick={() => setGymMode("join")}
                    className="flex-1 py-2.5 border border-zinc-700 rounded-xl text-zinc-400 text-sm font-bold hover:border-[#E63946] hover:text-[#E63946] transition"
                  >
                    + 체육관 가입
                  </button>
                  {role === "master" && (
                    <button
                      onClick={() => setGymMode("create")}
                      className="flex-1 py-2.5 border border-zinc-700 rounded-xl text-zinc-400 text-sm font-bold hover:border-[#E63946] hover:text-[#E63946] transition"
                    >
                      + 체육관 생성
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── admin: 멤버 관리 모달 ── */}
      {memberGym && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setMemberGym(null)} />
          <div className="fixed bottom-0 left-0 right-0 bg-[#111] rounded-t-2xl z-50 p-5 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black text-lg">{memberGym.name} 멤버</h3>
              <button onClick={() => setMemberGym(null)} className="text-zinc-400 hover:text-white transition">
                ✕
              </button>
            </div>
            {membersLoading ? (
              <p className="text-zinc-500 text-sm text-center py-6">불러오는 중...</p>
            ) : members.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-6">멤버가 없어요</p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      {member.profileImage ? (
                        <img src={member.profileImage} alt={member.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-700" />
                      )}
                      <div>
                        <p className="text-white text-sm font-bold">{member.name}</p>
                        <p className="text-zinc-500 text-xs">{member.role}</p>
                      </div>
                    </div>
                    {member.id !== user?.uid && (
                      <button
                        onClick={() => handleKickMember(member.id, member.name)}
                        className="text-xs text-red-500 border border-red-900 rounded-lg px-3 py-1.5 hover:border-red-500 transition font-bold"
                      >
                        강퇴
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── master: 체육관 수정 모달 ── */}
      {editingGym && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setEditingGym(null)} />
          <div className="fixed bottom-0 left-0 right-0 bg-[#111] rounded-t-2xl z-50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black text-lg">체육관 수정</h3>
              <button onClick={() => setEditingGym(null)} className="text-zinc-400 hover:text-white transition">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">체육관 이름</label>
                <input
                  type="text"
                  value={editGymName}
                  onChange={(e) => setEditGymName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">초대 코드 ({GYM_CODE_LENGTH}자리)</label>
                <input
                  type="text"
                  value={editGymCode}
                  onChange={(e) => setEditGymCode(e.target.value.toUpperCase())}
                  maxLength={GYM_CODE_LENGTH}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white uppercase tracking-widest text-center text-lg font-black focus:outline-none focus:border-[#E63946]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingGym(null)}
                  className="flex-1 py-2.5 border border-zinc-700 rounded-xl text-zinc-400 text-sm font-bold transition"
                >
                  취소
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={editLoading}
                  className="flex-1 py-2.5 bg-[#E63946] rounded-xl text-white text-sm font-black disabled:opacity-50 transition"
                >
                  {editLoading ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 로그아웃 */}
      <button
        onClick={handleLogout}
        className="w-full py-3 border border-zinc-800 rounded-xl text-zinc-600 text-sm font-bold hover:text-red-500 hover:border-red-500 transition"
      >
        로그아웃
      </button>
    </main>
  );
}
