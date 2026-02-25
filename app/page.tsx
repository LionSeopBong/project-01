"use client";

import GlowButton from "@/app/components/ui/GlowButton";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen ">
      <div className="relative w-full min-w-[340px] h-screen">
        <Image src="/bg/start-bg.png" alt="" fill className="object-cover" quality={100} priority />
        <div className="absolute justify-center top-10 left-0 right-0 flex ">
          <Image src="/bg/logo3.png" alt="" className="" width={350} height={50} quality={100} priority />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16">
          <Link href="/login">
            <GlowButton onClick={() => console.log("시작")}>START</GlowButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
