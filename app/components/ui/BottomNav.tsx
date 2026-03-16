import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faDumbbell, faFilePen, faHandFist, faUser } from "@fortawesome/free-solid-svg-icons";

const navItems = [
  { href: "/home", label: "Home", icon: faHouse },
  { href: "/wod", label: "WOD", icon: faDumbbell },
  { href: "/record", label: "Record", icon: faFilePen },
  { href: "/prdata", label: "PR Data", icon: faHandFist },
  { href: "/profile", label: "Profile", icon: faUser },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-zinc-800 flex justify-around items-center h-16 z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 text-xs transition ${isActive ? "text-[#E63946]" : "text-zinc-500"}`}
          >
            {/* <span className="text-xl">{item.icon}</span> */}
            <FontAwesomeIcon icon={item.icon} size="xl" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
