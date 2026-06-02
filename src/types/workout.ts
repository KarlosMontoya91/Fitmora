export type WorkoutType = 'treadmill' | 'bike' | 'gps' | 'free';

export interface WorkoutStep {
  minuteStart: number;
  minuteEnd: number;
  targetSpeed: number; // in km/h or level (rpm)
  targetIncline?: number; // percent incline for treadmill
  targetCadence?: number; // RPM for bike
  intensity: 'warmup' | 'moderate' | 'high' | 'cooldown';
  label: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  type: 'treadmill' | 'bike' | 'gps';
  durationDays: number; // 7, 15, 30
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: WorkoutStep[];
  goalDistance?: number;
  goalCalories?: number;
}

export interface WorkoutSession {
  id: string;
  type: WorkoutType;
  date: string;
  duration: number; // in seconds
  distance: number; // in km
  calories: number; // in kcal
  avgSpeed: number; // in km/h
  maxSpeed: number; // in km/h
  avgCadence?: number; // for bike
  avgHeartRate?: number;
  route?: { lat: number; lng: number }[]; // for GPS
  completed: boolean;
  planId?: string;
  planName?: string;
  xpEarned: number;
  coinsEarned: number;
}
