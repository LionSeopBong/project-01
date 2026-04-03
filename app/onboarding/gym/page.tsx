"use client";

import { useAuthGuard } from "@/hooks/auth/useAuthGuard";
import { createGym, getGymByCode, joinGymByCode, updateUser, updateGym } from "@/lib/firestore";
import { uploadGymImage } from "@/lib/storage";
import { Gym } from "@/types/wod";
import { GYM_CODE_LENGTH, PUBLIC_GYM_ID } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Role = "idle" | "coach" | "member" | "nomad";

export default function OnboardingGymPage() {
  const { user, loading } = useAuthGuard();
  const router = useRouter();

  const [role, setRole] = useState<Role>("idle");
  const [submitting, setSubmitting] = useState(false);

  // 멤버 - 코드 입력
  const [digits, setDigits] = useState<string[]>(Array(GYM_CODE_LENGTH).fill(""));
  const [preview, setPreview] = useState<Gym | null>(null);
  const [previewError, setPreviewError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const code = digits.join("");

  // 코치 - 체육관 생성
  const [gymName, setGymName] = useState("");
  const [gymCode, setGymCode] = useState("");
  const [gymCodeError, setGymCodeError] = useState("");
  const [gymImage, setGymImage] = useState<File | null>(null);
  const [gymImagePreview, setGymImagePreview] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, "", window.location.href);
    };
  }, []);

  // 멤버 - 6자리 완성 시 자동 체육관 조회
  useEffect(() => {
    if (role !== "member") return;
    if (digits.some((d) => d === "")) return;
    const lookup = async () => {
      setPreviewError("");
      setPreview(null);
      const gym = await getGymByCode(code.toUpperCase());
      if (gym) setPreview(gym);
      else setPreviewError("존재하지 않는 코드입니다.");
    };
    lookup();
  }, [code, role]);

  // 코치 - 코드 중복 확인 (입력 완료 시)
  useEffect(() => {
    if (role !== "coach") return;
    if (gymCode.length !== GYM_CODE_LENGTH) {
      setGymCodeError("");
      return;
    }
    const check = async () => {
      const existing = await getGymByCode(gymCode.toUpperCase());
      if (existing) setGymCodeError("이미 사용 중인 코드입니다.");
      else setGymCodeError("");
    };
    check();
  }, [gymCode, role]);

  // 멤버 - 코드 입력 핸들러
  const handleDigitChange = (index: number, value: string) => {
    const char = value
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(-1)
      .toUpperCase();
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < GYM_CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, GYM_CODE_LENGTH);
    const next = Array(GYM_CODE_LENGTH).fill("");
    pasted.split("").forEach((c, i) => (next[i] = c));
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, GYM_CODE_LENGTH - 1)]?.focus();
  };

  // 멤버 - 가입
  const handleJoin = async () => {
    if (!user || !preview) return;
    setSubmitting(true);
    try {
      await joinGymByCode(code.toUpperCase(), user.uid);
      router.push("/home");
    } catch (error: any) {
      alert(error.message ?? "가입 실패");
    } finally {
      setSubmitting(false);
    }
  };
  // 가입 박스 없음
  const handleNoGym = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await updateUser(user.uid, { currentGymId: PUBLIC_GYM_ID });
      router.push("/home");
    } catch (error: any) {
      alert(error.message ?? "오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };
  // 코치 - 체육관 생성
  const handleCreate = async () => {
    if (!user) return;
    if (!gymName.trim()) return alert("체육관 이름을 입력해주세요.");
    if (gymCode.length !== GYM_CODE_LENGTH) return alert(`코드는 ${GYM_CODE_LENGTH}자리여야 합니다.`);
    if (gymCodeError) return alert(gymCodeError);
    setSubmitting(true);
    try {
      // createGym 내부에서 admin 멤버 등록 + currentGymId 업데이트 처리
      const gymId = await createGym(user.uid, {
        name: gymName.trim(),
        code: gymCode.toUpperCase(),
      });
      // 이미지 있으면 업로드
      if (gymImage) {
        const imageUrl = await uploadGymImage(gymId, gymImage);
        await updateGym(gymId, { imageUrl } as any);
      }
      // role을 admin으로 업데이트
      await updateUser(user.uid, { role: "admin" });
      router.push("/home");
    } catch (error: any) {
      alert(error.message ?? "생성 실패");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pt-10 pb-24">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-1 w-8 rounded-full bg-zinc-600" />
        <div className="h-1 w-8 rounded-full bg-[#E63946]" />
      </div>

      <div className="mb-10">
        <p className="text-xs text-[#E63946] uppercase tracking-widest font-bold mb-1">Step 2 / 2</p>
        <h1 className="text-2xl font-black text-white">
          체육관 <span className="text-[#E63946]">{role === "coach" ? "생성" : role === "member" ? "가입" : "설정"}</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {role === "idle" && "코치이신가요, 멤버이신가요?"}
          {role === "coach" && "체육관 정보를 입력해주세요"}
          {role === "member" && "코치에게 받은 6자리 코드를 입력해주세요"}
        </p>
      </div>

      {/* ── 역할 선택 ── */}
      {role === "idle" && (
        <div className="space-y-3">
          <button
            onClick={() => setRole("coach")}
            className="w-full flex items-center gap-4 px-5 py-5 bg-zinc-900 border border-zinc-700 rounded-2xl hover:border-[#E63946] transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E63946]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🏋️</span>
            </div>
            <div className="text-left">
              <p className="text-white font-black text-base group-hover:text-[#E63946] transition">코치예요</p>
              <p className="text-zinc-500 text-xs mt-0.5">체육관을 새로 만들게요</p>
            </div>
            <span className="ml-auto text-zinc-600 group-hover:text-[#E63946] transition">→</span>
          </button>

          <button
            onClick={() => setRole("member")}
            className="w-full flex items-center gap-4 px-5 py-5 bg-zinc-900 border border-zinc-700 rounded-2xl hover:border-[#E63946] transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💪</span>
            </div>
            <div className="text-left">
              <p className="text-white font-black text-base group-hover:text-[#E63946] transition">멤버예요</p>
              <p className="text-zinc-500 text-xs mt-0.5">코치에게 코드를 받았어요</p>
            </div>
            <span className="ml-auto text-zinc-600 group-hover:text-[#E63946] transition">→</span>
          </button>

          <button
            // onClick={() => setRole("nomad")}
            onClick={handleNoGym}
            disabled={submitting}
            className="w-full flex items-center gap-4 px-5 py-5 bg-zinc-900 border border-zinc-700 rounded-2xl hover:border-[#E63946] transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🌐</span>
            </div>
            <div className="text-left">
              <p className="text-white font-black text-base group-hover:text-[#E63946] transition">아직 가입하지 않았어요</p>
              <p className="text-zinc-500 text-xs mt-0.5">Solo Athlete으로 시작할게요</p>
            </div>
            <span className="ml-auto text-zinc-600 group-hover:text-[#E63946] transition">→</span>
          </button>
        </div>
      )}

      {/* ── 코치 - 체육관 생성 ── */}
      {role === "coach" && (
        <div className="space-y-5">
          {/* 체육관 로고 */}
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">체육관 로고 (선택)</label>
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setGymImage(file);
                if (file) setGymImagePreview(URL.createObjectURL(file));
              }}
              className="hidden"
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center hover:border-[#E63946] transition overflow-hidden"
            >
              {gymImagePreview ? (
                <img src={gymImagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
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
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              placeholder="ex) CrossFit 강남"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946] transition"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">초대 코드 ({GYM_CODE_LENGTH}자리)</label>
            <input
              type="text"
              value={gymCode}
              onChange={(e) => setGymCode(e.target.value.toUpperCase())}
              maxLength={GYM_CODE_LENGTH}
              placeholder="ex) ABC123"
              className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 text-white uppercase tracking-widest text-center text-lg font-black placeholder-zinc-600 focus:outline-none transition ${
                gymCodeError ? "border-red-500" : gymCode.length === GYM_CODE_LENGTH ? "border-[#E63946]" : "border-zinc-700 focus:border-[#E63946]"
              }`}
            />
            {gymCodeError ? (
              <p className="text-xs text-red-400 mt-1">⚠ {gymCodeError}</p>
            ) : (
              <p className="text-xs text-zinc-600 mt-1">멤버들이 이 코드로 가입해요</p>
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={submitting || !gymName.trim() || gymCode.length !== GYM_CODE_LENGTH || !!gymCodeError}
            className="w-full py-4 bg-[#E63946] rounded-xl text-white font-black text-lg tracking-wider uppercase disabled:opacity-30 transition"
          >
            {submitting ? "생성 중..." : "체육관 만들기"}
          </button>

          <button onClick={() => setRole("idle")} className="w-full text-zinc-600 text-sm text-center hover:text-zinc-400 transition">
            ← 뒤로
          </button>
        </div>
      )}

      {/* ── 멤버 - 코드 입력 ── */}
      {role === "member" && (
        <div>
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="text"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-11 h-14 text-center text-xl font-black rounded-xl border bg-zinc-900 text-white uppercase transition focus:outline-none ${
                  d ? "border-[#E63946] text-[#E63946]" : "border-zinc-700 focus:border-zinc-500"
                }`}
              />
            ))}
          </div>

          {/* 체육관 프리뷰 */}
          <div className="min-h-[72px] mb-8">
            {preview && (
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4">
                {preview.imageUrl ? (
                  <img src={preview.imageUrl} alt={preview.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#E63946]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#E63946] text-lg">🏋️</span>
                  </div>
                )}
                <div>
                  <p className="text-white font-black text-sm">{preview.name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">코드: {preview.code}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs text-[#E63946] font-bold bg-[#E63946]/10 px-2 py-1 rounded-lg">확인됨</span>
                </div>
              </div>
            )}
            {previewError && (
              <div className="flex items-center gap-2 text-red-400 text-sm px-1">
                <span>⚠</span>
                <span>{previewError}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleJoin}
            disabled={!preview || submitting}
            className="w-full py-4 bg-[#E63946] rounded-xl text-white font-black text-lg tracking-wider uppercase disabled:opacity-30 transition"
          >
            {submitting ? "가입 중..." : "가입하기"}
          </button>

          <button
            onClick={() => {
              setRole("idle");
              setDigits(Array(GYM_CODE_LENGTH).fill(""));
              setPreview(null);
              setPreviewError("");
            }}
            className="w-full text-zinc-600 text-sm text-center mt-4 hover:text-zinc-400 transition"
          >
            ← 뒤로
          </button>
        </div>
      )}
    </main>
  );
}
