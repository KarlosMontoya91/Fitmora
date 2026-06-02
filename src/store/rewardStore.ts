import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Achievement, AppNotification } from '../types/reward';
import { INITIAL_ACHIEVEMENTS } from '../data/rewards';
import { useAvatarStore } from './avatarStore';
import { useUserStore } from './userStore';
import confetti from 'canvas-confetti';

interface RewardState {
  achievements: Achievement[];
  notifications: AppNotification[];
  
  // Actions
  checkAchievements: (stats: {
    totalDistance: number;
    weeklyDistance: number;
    streakDays: number;
    workoutCount: number;
    completedPlansCount: number;
    latestWorkoutType?: 'treadmill' | 'bike' | 'gps' | 'free';
  }) => { unlockedCount: number; unlockedList: Achievement[] };
  
  addNotification: (title: string, message: string, type: AppNotification['type']) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      achievements: INITIAL_ACHIEVEMENTS,
      notifications: [
        {
          id: 'welcome',
          title: '¡Te damos la bienvenida a Fitmora! 🌟',
          message: 'Personaliza tu avatar, selecciona tus metas e inicia tu camino fitness divertido.',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'system',
        }
      ],

      checkAchievements: (stats) => {
        const { achievements } = get();
        const unlockedList: Achievement[] = [];
        let unlockedCount = 0;

        const updatedAchievements = achievements.map(ach => {
          if (ach.isUnlocked) return ach;

          let shouldUnlock = false;

          switch (ach.type) {
            case 'distance_accumulated':
              shouldUnlock = stats.totalDistance >= ach.targetValue;
              break;
            case 'weekly_distance':
              shouldUnlock = stats.weeklyDistance >= ach.targetValue;
              break;
            case 'streak_days':
              shouldUnlock = stats.streakDays >= ach.targetValue;
              break;
            case 'gps_first':
              shouldUnlock = stats.latestWorkoutType === 'gps' && stats.workoutCount >= 1;
              break;
            case 'treadmill_first':
              shouldUnlock = stats.latestWorkoutType === 'treadmill' && stats.workoutCount >= 1;
              break;
            case 'bike_first':
              shouldUnlock = stats.latestWorkoutType === 'bike' && stats.workoutCount >= 1;
              break;
            case 'plan_completed':
              shouldUnlock = stats.completedPlansCount >= ach.targetValue;
              break;
            default:
              break;
          }

          if (shouldUnlock) {
            unlockedCount += 1;
            unlockedList.push(ach);
            
            // 1. Notify Avatar store to unlock item if linked
            if (ach.unlockedAvatarItemId) {
              const avatarStore = useAvatarStore.getState();
              avatarStore.unlockAchievementItem(ach.unlockedAvatarItemId);
            }

            // 2. Award User coins and XP
            const userStore = useUserStore.getState();
            userStore.addCoins(ach.coinsReward);
            userStore.addXP(ach.xpReward);

            // 3. Create confetti explosion!
            setTimeout(() => {
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
              });
            }, 300);

            return {
              ...ach,
              isUnlocked: true,
              unlockedAt: new Date().toISOString(),
            };
          }

          return ach;
        });

        // Add notifications for each unlocked achievement
        if (unlockedCount > 0) {
          set({ achievements: updatedAchievements });
          
          unlockedList.forEach(ach => {
            get().addNotification(
              `🏆 ¡Logro Desbloqueado: ${ach.title}!`,
              `Completaste la meta "${ach.description}". Recibes +${ach.coinsReward} monedas y +${ach.xpReward} XP.`,
              'achievement'
            );
          });
        }

        return { unlockedCount, unlockedList };
      },

      addNotification: (title, message, type) => {
        const newNotif: AppNotification = {
          id: Math.random().toString(36).substring(2, 9),
          title,
          message,
          timestamp: new Date().toISOString(),
          read: false,
          type,
        };

        set((state) => ({
          notifications: [newNotif, ...state.notifications].slice(0, 50), // keep last 50
        }));
      },

      markAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'fitmora-reward-store',
    }
  )
);
