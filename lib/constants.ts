import { RecordLevel } from "@/types/wod";

// 사용자 레벨
export const LEVELS: RecordLevel[] = ["Beginner", "Scale", "R'xd", "Athlete"];

// 와드 타입
export const WOD_TYPES = ["For Time", "AMRAP", "EMOM", "Every", "Strength", "Accessory"];

// 운동 기구 종류
export const WEIGHT_TOOLS = ["Barbell", "Dumbbell", "Kettlebell", "Other"];

// PR 운동 목록
export const PR_EXERCISES = [
  // Power
  { category: "Power", name: "Snatch" },
  { category: "Power", name: "Clean" },
  { category: "Power", name: "Push Press" },
  { category: "Power", name: "Hang Clean" },
  { category: "Power", name: "Hang Snatch" },
  { category: "Power", name: "Jerk" },
  // Strength
  { category: "Strength", name: "Back Squat" },
  { category: "Strength", name: "Deadlift" },
  { category: "Strength", name: "Front Squat" },
  { category: "Strength", name: "Banch Press" },
  { category: "Strength", name: "Shoulder Press" },
  // Skill
  { category: "Skill", name: "Ring Muscle-Up" },
  { category: "Skill", name: "Bar Muscle-Up" },
  { category: "Skill", name: "Chest-to-Bar" },
  { category: "Skill", name: "Pull-Up" },
  { category: "Skill", name: "Hand Stand Push-Up" },
  { category: "Skill", name: "Wall Walk" },
  { category: "Skill", name: "Hand Stand Walk" },
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

// 가중치 max 값은 kg으로 설정됨
export const PR_RADAR_CONFIG = [
  {
    subject: "Power",
    exercises: ["Snatch", "Clean", "Push Press", "Jerk", "Hang Clean", "Hang Snatch"],
    maleMax: 450,
    femaleMax: 300,
    inverse: false,
    valueType: "weight",
  },
  {
    subject: "Strength",
    exercises: ["Back Squat", "Deadlift", "Front Squat", "Banch Press", "Shoulder Press"],
    maleMax: 300,
    femaleMax: 200,
    inverse: false,
    valueType: "weight",
  },
  {
    subject: "Endurance",
    exercises: ["5km Run", "10km Run", "21km Run"],
    maleMax: 1200,
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
