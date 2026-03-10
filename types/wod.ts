export interface Movement {
  name: string;
  reps: number;
  distance: number;
  unit: string;
  noReps: boolean;
}
// 관리자가 파트별로 설정하는 기록 폼 스펙
export interface RecordConfig {
  enabled: boolean; // 이 파트 기록 받을지 여부
  fields: {
    finishTime: boolean; // 완료 시간 (For Time)
    weight: boolean; // 무게 (Strength / Every)
    rounds: boolean; // 라운드 + 렙수 (AMRAP)
    isCompleted: boolean; // 완주 여부
    isDNF: boolean; // Did Not Finish
    memo: boolean; // 자유 메모
  };
}
export interface WodPart {
  part: "A" | "B" | "C";
  label: string;
  type: string; // AMRAP / For Time / EMOM / Every / Strength
  recordType: string; // "For Time" | "EMOM" | "AMRAP" | "none"
  rounds: number;
  timeCap: number;
  interval: string; // Every 1:30 같은 인터벌
  movements: Movement[];
  note: string; // 메모란
  isLadder: boolean; // 3-6-9 ladder 여부
  ladderStart: number; // 시작 렙수
  ladderIncrement: number; // 증가 단위
  noRounds: boolean;
  noTimeCap: boolean;
  weights: WodWeight[];
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
// Every 세트별 무게 기록
export interface EverySet {
  set: number; // 세트 번호
  weight: number; // 무게 (kg)
  reps: number; // 횟수
}
export interface WorkoutRecord {
  id: string;
  userId: string;
  userName: string;
  gender: string;
  wodId: string;
  wodName: string;
  wodPart: string; // "A" | "B" | "C"
  recordType: string; // "For Time" | "EMOM" | "AMRAP"
  level: string; // "Beginner" | "Rxd" | "Athlete"
  completedAt: string; // YYYY-MM-DD

  // For Time
  finishTime: number; // 완료 시간 (초)
  weight: number; // 진행 무게 (kg)

  // EMOM
  failedRounds: number; // 실패 라운드 수
  emomWeight: number; // 진행 무게 (kg)

  // AMRAP
  reps: number; // 최대 Reps
  amrapWeight: number; // 진행 무게 (kg)

  // 팀 WOD
  isTeam: boolean;
  partnerName: string;
  partnerWeight: number;
  partnerDifferentWeight: boolean;

  createdAt: any;
}
export interface WodWeight {
  tool: string; // "Barbell" | "Dumbbell" | "Kettlebell" | "Other"
  maleWeight: number;
  femaleWeight: number;
  unit: string; // "kg" | "lb"
}
