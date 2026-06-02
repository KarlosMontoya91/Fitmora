export type AchievementType =
  | 'distance_accumulated'
  | 'weekly_distance'
  | 'streak_days'
  | 'gps_first'
  | 'treadmill_first'
  | 'bike_first'
  | 'plan_completed'
  | 'level_reached';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  targetValue: number;
  badgeIcon: string; // Name of lucide icon
  coinsReward: number;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  unlockedAvatarItemId?: string; // Optional clothing/accessory unlocked
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'achievement' | 'streak' | 'reminder' | 'motivation' | 'system';
}
