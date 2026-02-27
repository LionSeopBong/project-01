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
