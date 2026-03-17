import { RecordLevel } from "@/types/wod";

// 사용자 레벨
export const LEVELS: RecordLevel[] = ["Beginner", "Scale", "R'xd", "Athlete"];

// 와드 타입
export const WOD_TYPES = ["For Time", "AMRAP", "EMOM", "Every", "Strength", "Accessory"];

// 운동 기구 종류
export const WEIGHT_TOOLS = ["Barbell", "Dumbbell", "Kettlebell", "Other"];

// PR 운동 목록
export const PR_EXERCISES = [
  { category: "Strength", name: "Back Squat" },
  { category: "Strength", name: "Snatch" },
  { category: "Strength", name: "Clean" },
  { category: "Strength", name: "Push Press" },
  { category: "Strength", name: "Deadlift" },
  { category: "Strength", name: "Front Squat" },
  { category: "Strength", name: "Banch Press" },
  { category: "Strength", name: "Hang Clean" },
  { category: "Strength", name: "Hang Snatch" },
  { category: "Strength", name: "Jerk" },
  // Skill
  { category: "Skill", name: "Ring Muscle-Up" },
  { category: "Skill", name: "Bar Muscle-Up" },
  { category: "Skill", name: "Chest-to-Bar" },
  { category: "Skill", name: "Pull-Up" },
  // Endurance
  { category: "Endurance", name: "5km Run" },
  { category: "Endurance", name: "10km Run" },
  { category: "Endurance", name: "21km Run" },
  // Conditioning (Hero WOD)
  { category: "Conditioning", name: "Murph" },
  { category: "Conditioning", name: "Grace" },
  { category: "Conditioning", name: "Chelsea" },
  { category: "Conditioning", name: "Isabel" },
  { category: "Conditioning", name: "Fran" },
  { category: "Conditioning", name: "Helen" },
  { category: "Conditioning", name: "Jeckie" },
];
// 레이더 차트
// export const PR_RADAR_CONFIG = [
//   { subject: "Strength", exercise: "Back Squat", max: 250 }, // 250lb 목표
//   { subject: "Power", exercise: "Clean", max: 200 }, // 200lb 목표
//   { subject: "Endurance", exercise: "5km Run", max: 1200, inverse: true }, // 20분 목표 (낮을수록 좋음)
//   { subject: "Skill", exercise: "Pull-Up", max: 50 }, // 50reps 목표
//   { subject: "Conditioning", exercise: "Jeckie", max: 360, inverse: true }, // 6분 목표
// ];

// constants.ts 에 type 추가
export const PR_RADAR_CONFIG = [
  { subject: "Strength", exercises: ["Back Squat", "Deadlift", "Push Press"], max: 350, inverse: false, valueType: "weight" },
  { subject: "Power", exercises: ["Snatch", "Clean"], max: 300, inverse: false, valueType: "weight" },
  { subject: "Endurance", exercises: ["5km Run", "10km Run", "21km Run"], max: 1200, inverse: true, valueType: "time" },
  { subject: "Skill", exercises: ["Pull-Up", "Ring Muscle-Up"], max: 50, inverse: false, valueType: "reps" },
  { subject: "Conditioning", exercises: ["Fran", "Grace", "Helen", "Isabel", "Jeckie"], max: 360, inverse: true, valueType: "time" },
];
