import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, WeightRecord, FitnessGoal, FavoriteWorkout, PhysicalLevel } from '../types/user';

interface UserState {
  profile: UserProfile | null;
  theme: 'light' | 'dark';
  isOnboarded: boolean;
  
  // Actions
  onboardUser: (profile: Omit<UserProfile, 'streak' | 'lastWorkoutDate' | 'experience' | 'userLevel' | 'coins' | 'weightHistory'>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addWeightRecord: (weight: number) => void;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  addXP: (xp: number) => { leveledUp: boolean; newLevel: number };
  togglePermission: (permission: 'gps' | 'bluetooth' | 'notifications') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  checkStreakValidity: () => void;
  resetAllData: () => void;
}

const DEFAULT_PROFILE = {
  streak: 0,
  lastWorkoutDate: null,
  experience: 0,
  userLevel: 1,
  coins: 100, // Starting coins to shop early
  weightHistory: [],
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      theme: 'light',
      isOnboarded: false,

      onboardUser: (newProfile) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const initialWeightRecord: WeightRecord = {
          date: todayStr,
          weight: newProfile.weight,
        };

        set({
          profile: {
            ...newProfile,
            ...DEFAULT_PROFILE,
            weightHistory: [initialWeightRecord],
          },
          isOnboarded: true,
        });
      },

      updateProfile: (updates) => {
        set((state) => {
          if (!state.profile) return {};
          
          let newWeightHistory = [...state.profile.weightHistory];
          if (updates.weight !== undefined) {
            const todayStr = new Date().toISOString().split('T')[0];
            const lastRecord = newWeightHistory[newWeightHistory.length - 1];
            
            if (lastRecord && lastRecord.date === todayStr) {
              newWeightHistory[newWeightHistory.length - 1] = {
                ...lastRecord,
                weight: updates.weight,
              };
            } else {
              newWeightHistory.push({
                date: todayStr,
                weight: updates.weight,
              });
            }
          }

          return {
            profile: {
              ...state.profile,
              ...updates,
              weightHistory: newWeightHistory,
            },
          };
        });
      },

      addWeightRecord: (weight) => {
        set((state) => {
          if (!state.profile) return {};
          const todayStr = new Date().toISOString().split('T')[0];
          const newWeightHistory = [...state.profile.weightHistory];
          
          const index = newWeightHistory.findIndex(r => r.date === todayStr);
          if (index !== -1) {
            newWeightHistory[index].weight = weight;
          } else {
            newWeightHistory.push({ date: todayStr, weight });
          }

          return {
            profile: {
              ...state.profile,
              weight: weight,
              weightHistory: newWeightHistory,
            },
          };
        });
      },

      addCoins: (amount) => {
        set((state) => {
          if (!state.profile) return {};
          return {
            profile: {
              ...state.profile,
              coins: state.profile.coins + amount,
            },
          };
        });
      },

      deductCoins: (amount) => {
        const { profile } = get();
        if (!profile || profile.coins < amount) return false;
        
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, coins: state.profile.coins - amount }
            : null,
        }));
        return true;
      },

      addXP: (xp) => {
        const { profile } = get();
        if (!profile) return { leveledUp: false, newLevel: 1 };

        const currentXP = profile.experience + xp;
        // XP Formula: Level * 1000 = XP required to level up from Level to Level+1
        let currentLevel = profile.userLevel;
        let nextLevelXP = currentLevel * 1000;
        let remainingXP = currentXP;
        let leveledUp = false;

        // Loop to calculate potential multi-level-ups
        while (remainingXP >= nextLevelXP) {
          remainingXP -= nextLevelXP;
          currentLevel += 1;
          nextLevelXP = currentLevel * 1000;
          leveledUp = true;
        }

        set((state) => {
          if (!state.profile) return {};
          return {
            profile: {
              ...state.profile,
              experience: currentXP,
              userLevel: currentLevel,
            },
          };
        });

        return { leveledUp, newLevel: currentLevel };
      },

      togglePermission: (permission) => {
        set((state) => {
          if (!state.profile) return {};
          return {
            profile: {
              ...state.profile,
              permissions: {
                ...state.profile.permissions,
                [permission]: !state.profile.permissions[permission],
              },
            },
          };
        });
      },

      setTheme: (theme) => {
        set({ theme });
        // Dom sync
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      incrementStreak: () => {
        set((state) => {
          if (!state.profile) return {};
          const todayStr = new Date().toISOString().split('T')[0];
          
          // If already trained today, don't increment streak
          if (state.profile.lastWorkoutDate === todayStr) return {};
          
          let newStreak = state.profile.streak;
          
          if (state.profile.lastWorkoutDate) {
            const lastDate = new Date(state.profile.lastWorkoutDate + 'T00:00:00');
            const today = new Date(todayStr + 'T00:00:00');
            const diffTime = today.getTime() - lastDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              newStreak += 1;
            } else {
              newStreak = 1; // streak broken, reset to 1
            }
          } else {
            newStreak = 1; // first workout
          }

          return {
            profile: {
              ...state.profile,
              streak: newStreak,
              lastWorkoutDate: todayStr,
            },
          };
        });
      },

      resetStreak: () => {
        set((state) => {
          if (!state.profile) return {};
          return {
            profile: {
              ...state.profile,
              streak: 0,
            },
          };
        });
      },

      checkStreakValidity: () => {
        set((state) => {
          if (!state.profile || !state.profile.lastWorkoutDate) return {};
          
          const todayStr = new Date().toISOString().split('T')[0];
          if (state.profile.lastWorkoutDate === todayStr) return {};
          
          const lastDate = new Date(state.profile.lastWorkoutDate + 'T00:00:00');
          const today = new Date(todayStr + 'T00:00:00');
          const diffTime = today.getTime() - lastDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1) {
            // Streak broken! Reset to 0
            return {
              profile: {
                ...state.profile,
                streak: 0,
              }
            };
          }
          return {};
        });
      },

      resetAllData: () => {
        set({
          profile: null,
          isOnboarded: false,
          theme: 'light',
        });
        document.documentElement.classList.remove('dark');
        localStorage.clear();
      },
    }),
    {
      name: 'fitmora-user-store',
    }
  )
);
