export interface WeightRecord {
  date: string;
  weight: number;
}

export type PhysicalLevel = 'beginner' | 'intermediate' | 'advanced';

export type FitnessGoal =
  | 'weight-loss'
  | 'endurance'
  | 'speed'
  | 'active'
  | 'health';

export type FavoriteWorkout = 'treadmill' | 'bike' | 'gps' | 'mixed';

export interface UserPermissions {
  gps: boolean;
  bluetooth: boolean;
  notifications: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other' | 'none';
  level: PhysicalLevel;
  goal: FitnessGoal;
  favoriteWorkout: FavoriteWorkout;
  streak: number;
  lastWorkoutDate: string | null;
  experience: number;
  userLevel: number;
  permissions: UserPermissions;
  weightHistory: WeightRecord[];
  coins: number; // Virtual currency earned from training to buy clothes/skins
}
