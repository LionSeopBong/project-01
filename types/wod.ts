export interface Movement {
  name: string;
  reps: number;
  distance: number;
  unit: string;
}

export interface WodPart {
  part: "A" | "B" | "C";
  label: string;
  type: string; // AMRAP / For Time / EMOM / Every / Strength
  rounds: number;
  timeCap: number;
  interval: string; // Every 1:30 같은 인터벌
  movements: Movement[];
  note: string; // 메모란
  isLadder: boolean; // 3-6-9 ladder 여부
  ladderStart: number; // 시작 렙수
  ladderIncrement: number; // 증가 단위
}
export interface Wod {
  id: string;
  date: string;
  title: string;
  parts: WodPart[]; // A, B 파트 배열
  note: string;
  createdAt: any;
}

export interface User {
  id: string;
  name: string;
  gender: string;
  weight: number;
  height: number;
  profileImage: string;
  unit: string;
  role: "admin" | "user";
  createdAt: any;
}

export interface WodComment {
  id: string;
  wodId: string;
  userId: string;
  userName: string;
  profileImage: string;
  content: string;
  createdAt: any;
}
