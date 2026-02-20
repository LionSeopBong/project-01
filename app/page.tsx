import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen ">
      <div className="relative w-full min-w-[340px] h-screen">
        <Image src="/bg/begin.jpg" alt="" fill className="object-cover opacity-70" quality={100} priority />
        <div className="absolute justify-center top-10 left-0 right-0 flex ">
          <Image src="/bg/logo1.png" alt="" className="" width={350} height={50} quality={100} priority />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16">
          <Link href="/login" className="my-5 bg-[#E10600] text-white p-5 rounded-2xl font-bold text-2xl">
            시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}
