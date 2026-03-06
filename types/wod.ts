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
  wodType: string; // "For Time" | "AMRAP" | "EMOM" | "Every" | "Strength"
  level: string; // "Beginner" | "Rxd" | "Athlete"
  completedAt: string; // YYYY-MM-DD
  wodPart: string; // A,B,C Part

  // 팀 WOD (공통 옵션)
  isTeam: boolean;
  partnerName: string;
  partnerWeight: number;
  partnerDifferentWeight: boolean; // 파트너 무게 다를 때 체크

  // For Time
  timeCap: number; // 제한 시간 (초) - 불러오기
  finishTime: number; // 완료 시간 (초)
  weight: number; // 진행 무게
  isDNF: boolean; // Did Not Finish
  rounds: number; // 완료 라운드
  reps: number; // 완료 렙수
  maxCal: number; // Max Cal
  maxReps: number; // Max Reps

  // EMOM
  // timeCap 공통 사용
  failedRounds: number; // 실패 라운드 수

  // Every
  interval: number; // 몇 분마다 (초)
  totalSets: number; // 총 세트수
  sets: EverySet[]; // 세트별 무게/횟수

  // AMRAP
  // timeCap 공통 사용
  isCompleted: boolean; // 완주 여부
  completedTime: number; // 완주 시간 (초)
  // rounds, reps 공통 사용
  amrapRounds: number; // ← 추가
  amrapReps: number; // ← 추가
  amrapWeight: number; // 진행 무게

  createdAt: any;
}
