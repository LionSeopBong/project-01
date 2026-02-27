import { logOut } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { href: "/wod", label: "WOD", icon: "💪" },
  { href: "/record", label: "Record", icon: "📊" },
  { href: "/timer", label: "Timer", icon: "⏱" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logOut();
    router.push("/");
  };
  return (
    <>
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 pt-10 pb-4">
        {/* 좌측 로고 */}
        <Image src="/bg/logo4.png" alt="WODX" className="p-0" width={150} height={28} priority />

        {/* 우측 아이콘들 */}
        <div className="flex items-center gap-4">
          {/* 알림 아이콘 */}
          <button className="text-zinc-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {/* 버거 메뉴 */}
          <button onClick={() => setMenuOpen(true)} className="text-zinc-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* 메뉴 오버레이 */}
      {menuOpen && <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setMenuOpen(false)} />}

      {/* 슬라이드 메뉴 */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-[#111111] z-50 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 메뉴 헤더 */}
        <div className="flex items-center justify-between px-6 pt-10 pb-8 border-b border-zinc-800">
          <Image src="/bg/logo3.png" alt="WODX" width={80} height={22} />
          <button onClick={() => setMenuOpen(false)} className="text-zinc-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 메뉴 항목 */}
        <nav className="flex flex-col px-4 pt-6 gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-4 px-4 py-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold tracking-wider uppercase text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* 로그아웃 */}
        <div className="absolute bottom-10 left-0 right-0 px-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-[#E63946] hover:bg-zinc-800 transition font-bold tracking-wider uppercase text-sm"
          >
            <span className="text-xl">🚪</span>
            로그아웃
          </button>
        </div>
      </div>
    </>
  );
}
