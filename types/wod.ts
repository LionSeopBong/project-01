export interface Movement {
  name: string;
  reps: number;
  distance: number;
  unit: string;
}

export interface Wod {
  id: string;
  title: string;
  date: string;
  type: string;
  rounds: number;
  timeCap: number;
  movements: Movement[];
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
