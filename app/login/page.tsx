"use client";
import { signInWithGoogle } from "@/lib/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const { isNewUser } = await signInWithGoogle();
      if (isNewUser) {
        router.push("/onboarding/profile");
      } else {
        router.push("/home");
      }
    } catch (error) {
      console.log("로그인 실패", error);
    }
  };
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-8">
      <Image src="/bg/logo3.png" alt="WODX" width={200} height={40} priority />

      <button onClick={handleLogin} className="flex items-center gap-3 bg-white text-black font-bold px-9 py-3 rounded-full hover:bg-zinc-200 transition">
        {/* <Image src="/icons/google.svg" alt="Google" width={20} height={20} /> */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path d="M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z" />
        </svg>
        Google로 시작하기
      </button>
    </main>
  );
}
