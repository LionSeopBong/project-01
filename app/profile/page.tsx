"use client";

import HomeHeader from "@/app/components/ui/HomeHeader";
import { useAuthGuard } from "@/hooks/auth/useAuthGuard";
import { useUserInfo } from "@/hooks/user/useUserInfo";
import { updateUser } from "@/lib/firestore";
import { logOut } from "@/lib/auth";
import { User } from "@/types/wod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function ProfilePage() {
  const { user, loading } = useAuthGuard();
  const { userInfo, userLoading, refetch } = useUserInfo(user?.uid ?? "");
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [submitting, setSubmitting] = useState(false);

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
      console.error("저장 실패 오류", error); // ← error 내용 확인

      alert("저장 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
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

      {/* 정보 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 mb-6">
        {!isEditing ? (
          <>
            {/* 프로필 이미지 + 이름 */}
            <div className="flex items-center gap-4 mb-8">
              {user?.photoURL && <Image src={user.photoURL} alt="profile" width={64} height={64} className="rounded-full" />}
              <div>
                <p className="text-white font-black text-lg">{userInfo?.name}</p>
                <p className="text-zinc-500 text-sm">{user?.email}</p>
              </div>
            </div>
            {/* 보기 모드 */}
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
            {/* 수정 모드 */}
            {/* 이름 */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">닉네임</label>
              <input
                type="text"
                value={editData.name ?? ""}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
              />
            </div>
            {/* 성별 */}
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
                    className={`px-8 py-2 rounded-xl text-sm font-black border transition ${
                      editData.gender === g.key ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 단위 */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">단위</label>
              <div className="flex gap-2">
                {["kg", "lb"].map((u) => (
                  <button
                    key={u}
                    onClick={() => setEditData({ ...editData, unit: u })}
                    className={`px-8 py-2 rounded-xl text-sm font-black border transition ${
                      editData.unit === u ? "bg-[#E63946] border-[#E63946] text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* 몸무게 */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">몸무게 ({editData.unit})</label>
              <input
                type="number"
                value={editData.weight}
                onChange={(e) => setEditData({ ...editData, weight: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E63946]"
              />
            </div>

            {/* 키 */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">키 (cm)</label>
              <input
                type="number"
                value={editData.height}
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
