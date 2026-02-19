import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>시작 화면</h1>
      <Link href="/login">시작하기</Link>
    </div>
  );
}
