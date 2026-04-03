import { RecordLevel } from "@/types/wod";

// 사용자 레벨
export const LEVELS: RecordLevel[] = ["Beginner", "Scale", "R'xd", "Athlete"];

// 와드 타입
export const WOD_TYPES = ["For Time", "AMRAP", "EMOM", "Every", "Strength", "Accessory"];

// 운동 기구 종류
export const WEIGHT_TOOLS = ["Barbell", "Dumbbell", "Kettlebell", "Medicine Ball", "Other"];

export const GYMNASTICS = ["Jumping Pull Up", "Band Pull Up", "Pull Up", "Chest to Bar", "Bar Muscle Up", "Ring Muscle Up", "Pull Over"];
export const GYMNASTICS_TTB = [""];
// PR 운동 목록
export const PR_EXERCISES = [
  // Power
  { category: "Power", name: "Snatch", valueType: "weight" },
  { category: "Power", name: "Clean", valueType: "weight" },
  { category: "Power", name: "Push Press", valueType: "weight" },
  { category: "Power", name: "Hang Clean", valueType: "weight" },
  { category: "Power", name: "Hang Snatch", valueType: "weight" },
  { category: "Power", name: "Jerk", valueType: "weight" },
  // Strength
  { category: "Strength", name: "Back Squat", valueType: "weight" },
  { category: "Strength", name: "Deadlift", valueType: "weight" },
  { category: "Strength", name: "Front Squat", valueType: "weight" },
  { category: "Strength", name: "Banch Press", valueType: "weight" },
  { category: "Strength", name: "Shoulder Press", valueType: "weight" },
  // Skill
  { category: "Skill", name: "Ring Muscle-Up", valueType: "reps" },
  { category: "Skill", name: "Bar Muscle-Up", valueType: "reps" },
  { category: "Skill", name: "Chest-to-Bar", valueType: "reps" },
  { category: "Skill", name: "Pull-Up", valueType: "reps" },
  { category: "Skill", name: "Hand Stand Push-Up", valueType: "reps" },
  { category: "Skill", name: "Wall Walk", valueType: "reps" },
  { category: "Skill", name: "Hand Stand Walk", valueType: "distance" },
  // Endurance
  { category: "Endurance", name: "5km Run", valueType: "time" },
  { category: "Endurance", name: "10km Run", valueType: "time" },
  { category: "Endurance", name: "21km Run", valueType: "time" },
  // Conditioning (Hero WOD)
  { category: "Conditioning", name: "Murph", valueType: "time" },
  { category: "Conditioning", name: "Grace", valueType: "time" },
  { category: "Conditioning", name: "Chelsea", valueType: "time" },
  { category: "Conditioning", name: "Isabel", valueType: "time" },
  { category: "Conditioning", name: "Fran", valueType: "time" },
  { category: "Conditioning", name: "Helen", valueType: "time" },
  { category: "Conditioning", name: "Jeckie", valueType: "time" },
];

// 가중치 max 값은 kg으로 설정됨
export const PR_RADAR_CONFIG = [
  {
    subject: "Power",
    exercises: ["Snatch", "Clean", "Push Press", "Jerk", "Hang Clean", "Hang Snatch"],
    maleMax: 250,
    femaleMax: 100,
    inverse: false,
    valueType: "weight",
  },
  {
    subject: "Strength",
    exercises: ["Back Squat", "Deadlift", "Front Squat", "Banch Press", "Shoulder Press"],
    maleMax: 250,
    femaleMax: 150,
    inverse: false,
    valueType: "weight",
  },
  {
    subject: "Endurance",
    exercises: ["5km Run", "10km Run", "21km Run"],
    maleMax: 1080,
    femaleMax: 1500,
    inverse: true,
    valueType: "time",
  },
  {
    subject: "Skill",
    exercises: ["Pull-Up", "Chest-to-Bar", "Bar Muscle-Up", "Ring Muscle-Up", "Hand Stand Push-Up", "Wall Walk", "Hand Stand Walk"],
    maleMax: 30,
    femaleMax: 20,
    inverse: false,
    valueType: "reps",
  },
  { subject: "Conditioning", exercises: ["Fran", "Grace", "Helen", "Isabel", "Jeckie"], maleMax: 360, femaleMax: 480, inverse: true, valueType: "time" },
];

export const POWER_WEIGHTS: Record<string, number> = {
  Snatch: 1.9,
  Clean: 1.4,
  "Push Press": 2.0,
  "Hang Clean": 1.5,
  "Hang Snatch": 1.8,
  Jerk: 2.0,
};
export const STRENGTH_WEIGHTS: Record<string, number> = {
  "Back Squat": 0.4,
  Deadlift: 0.4,
  "Front Squat": 0.6,
  "Banch Press": 1,
  "Shoulder Press": 1,
};
export const SKILL_WEIGHTS: Record<string, number> = {
  "Pull-Up": 0.6,
  "Chest-to-Bar": 0.8,
  "Bar Muscle-Up": 1,
  "Ring Muscle-Up": 1.5,
  "Hand Stand Push-Up": 0.6,
  "Wall Walk": 0.6,
  "Hand Stand Walk": 1.5,
};

export const ENDURANCE_WIGHTS: Record<string, number> = {
  "5km Run": 1,
  "10km Run": 2,
  "21km Run": 4,
};
// 박스초대 코드 자릿수
export const GYM_CODE_LENGTH = 6;
// 박스 미가입 유저 Solo Athlete
export const PUBLIC_GYM_ID = "public";
