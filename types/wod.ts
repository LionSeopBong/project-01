export interface Movement {
  name: string;
  reps: number;
  distance: number;
  unit: string;
  noReps: boolean;
}

export interface WodPart {
  part: "A" | "B" | "C";
  label: string;
  type: string; // AMRAP / For Time / EMOM / Every / Strength
  rounds: number;
  timeCap: number;
  movements: Movement[];
  note: string; // 메모란
  noRounds: boolean;
  noTimeCap: boolean;
  weights: WodWeight[];
  isTeam: boolean;
  teamSize: number;
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
  likes: number; // 댓글 좋아요
  likedBy: string[]; // 좋아요 누른 유저 uid 배열
  createdAt: any;
}

export interface WodWeight {
  tool: string; // "Barbell" | "Dumbbell" | "Kettlebell" | "Other"
  maleWeight: number;
  femaleWeight: number;
  unit: string; // "kg" | "lb"
}
export type RecordLevel = "Beginner" | "Scale" | "R'xd" | "Athlete";
export interface RecordWeight {
  tool: string; // 사용 도구
  weight: number; // 무게 숫자
  unit: string; //lb or kg
}
//"emomWeight" | "amrapWeight" | "forTimeWeight"
export interface WorkoutRecord {
  // 공통
  id: string;
  userId: string;
  userName: string;
  gender?: string;
  wodId: string;
  wodName: string;
  wodPart: string; // "A" | "B" | "C"
  wodType: string; // "For Time" | "AMRAP" | "EMOM" 등
  level: RecordLevel;
  completedAt: string; // YYYY-MM-DD
  isDNF: boolean; // 완주여부
  weights: RecordWeight[]; // 진행 무게 (lb or kg)

  // 공통 기록 제출 항목
  totalReps?: number; // 와드 합산 Reps
  hasRepsOnly?: boolean; // Reps만 제출 여부

  // For Time
  finishTime?: number; // 완료 시간 (초)

  // EMOM
  failCount?: number; // 실패 횟수
  // 총합 랩수도 사용할떄 있음

  // AMRAP
  reps?: number; // 최대 Reps
  rounds?: number; // 최대 Round
  hasTotalRepsOnly?: boolean; // 총 Reps만 제출 여부

  // 팀 WOD
  wodTeam: boolean;
  partnerName: string;
  partnerWeight: number;
  partnerDifferentWeight: boolean;

  // Every
  memo?: string;

  createdAt: any;
}
// PR data
export interface PrRecord {
  id: string;
  userId: string;
  category: string;
  exercise: string;
  weight?: number;
  time?: number;
  reps?: number;
  unit: string;
  recordedAt: string;
  createdAt: any;
}
// 알림타입
export interface Notification {
  id: string;
  userId: string; // 받는 사람
  type: "wod_registered" | "comment_like" | "comment_reply";
  message: string;
  isRead: boolean;
  createdAt?: any;
  link?: string; // 클릭 시 이동할 경로
}
