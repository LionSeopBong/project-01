"use client";
import BottomNav from "@/app/components/ui/BottomNav";
import { usePathname } from "next/navigation";

const hideNavPaths = ["/", "/login", "/onboarding/profile"];

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !hideNavPaths.includes(pathname);

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {children}
      {showNav && <BottomNav />}
    </div>
  );
}
