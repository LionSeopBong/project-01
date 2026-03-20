import { useAuth } from "@/context/AuthContext";
import { useUserInfo } from "@/hooks/user/useUserInfo";
import { logOut } from "@/lib/auth";
import { getUser } from "@/lib/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faFilePen, faHandFist, faUser, faGear, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useNotifications } from "@/hooks/user/useNotifications";
import { getTimeAgo } from "@/lib/utils";
const menuItems = [
  { href: "/wod", label: "WOD", icon: faDumbbell },
  { href: "/record", label: "Record", icon: faFilePen },
  { href: "/prdata", label: "PR Board", icon: faHandFist },
  { href: "/profile", label: "Profile", icon: faUser },
];

export default function HomeHeader() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { userInfo } = useUserInfo(user?.uid ?? "");

  // 훅 추가
  const { notifications, notificationsLoading, unreadCount, readAll } = useNotifications(user?.uid ?? "");
  const [notifOpen, setNotifOpen] = useState(false);
  const handleLogout = async () => {
    await logOut();
    router.push("/");
  };
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const userData = await getUser(user.uid);
      setIsAdmin(userData?.role === "admin");
    };
    checkAdmin();
  }, [user]);
  return (
    <>
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 pt-10 pb-4">
        {/* 좌측 로고 */}
        <Image src="/bg/logo4.png" alt="WODX" className="p-0" width={150} height={28} priority />

        {/* 우측 아이콘들 */}
        <div className="flex items-center gap-4">
          {/* 알림 아이콘 */}
          <button
            onClick={() => {
              setNotifOpen(true);
              readAll();
            }}
            className="text-zinc-400 hover:text-white transition relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* 읽지 않은 알림 뱃지 */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E63946] text-white text-xs font-black rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {/* 알림 오버레이 */}
          {notifOpen && <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setNotifOpen(false)} />}

          {/* 알림 패널 */}
          <div
            className={`fixed top-0 right-0 h-full w-72 bg-[#111111] z-50 transform transition-transform duration-300 ${
              notifOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* 패널 헤더 */}
            <div className="flex items-center justify-between px-6 pt-10 pb-4 border-b border-zinc-800">
              <h2 className="text-white font-black text-lg">알림</h2>
              <button onClick={() => setNotifOpen(false)} className="text-zinc-400 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 알림 목록 */}
            <div className="flex flex-col px-4 pt-4 gap-2 overflow-y-auto h-[calc(100%-80px)]">
              {notificationsLoading && <p className="text-zinc-500 text-sm text-center py-10">불러오는 중...</p>}
              {!notificationsLoading && notifications.length === 0 && <p className="text-zinc-500 text-sm text-center py-10">알림이 없어요</p>}
              {notifications.map((notif) => (
                <div key={notif.id} className={`p-3 rounded-xl text-sm transition ${notif.isRead ? "bg-zinc-900 text-zinc-500" : "bg-zinc-800 text-white"}`}>
                  <p className="font-bold">{notif.message}</p>
                  {/* {notif.createdAt?.seconds != null ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString("ko-KR") : "방금 전"} */}
                  <p className="text-xs text-zinc-600 mt-1">{notif.createdAt?.seconds ? getTimeAgo(notif.createdAt.seconds) : "방금 전"}</p>{" "}
                </div>
              ))}
            </div>
          </div>
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
          <h1 className="text-white font-bold tracking-wider uppercase text-sm">
            반가워요 <span className="text-blue-400">{userInfo?.name}</span> 님!
          </h1>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-4 px-4 py-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <FontAwesomeIcon icon={item.icon} size="xl" />
              <span className="font-bold tracking-wider uppercase text-sm">{item.label}</span>
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/wod"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-4 px-4 py-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <FontAwesomeIcon icon={faGear} size="xl" className="text-[#FF3B30]" />
              <span className="font-bold tracking-wider uppercase text-sm">WOD 관리</span>
            </Link>
          )}
          {/* 로그아웃 */}
          <div className="absolute bottom-17 left-0 right-0 px-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-[#E63946] hover:bg-zinc-800 transition font-bold tracking-wider uppercase text-sm"
            >
              <FontAwesomeIcon icon={faRightFromBracket} size="xl" className="text-[#FF3B30]" />
              {/* <span className="text-xl">🚪</span> */}
              로그아웃
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
