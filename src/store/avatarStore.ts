import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AvatarConfig, AvatarCatalogItem } from '../types/avatar';
import { AVATAR_CATALOG } from '../data/avatarItems';
import { useUserStore } from './userStore';

interface AvatarState {
  config: AvatarConfig;
  unlockedItemIds: string[];
  
  // Actions
  updateConfig: (updates: Partial<AvatarConfig>) => void;
  buyItem: (itemId: string) => boolean;
  unlockAchievementItem: (itemId: string) => void;
  isUnlocked: (itemId: string) => boolean;
  getEquippedItem: (category: 'clothing' | 'hairStyle' | 'accessory' | 'shoes') => AvatarCatalogItem | undefined;
}

const DEFAULT_CONFIG: AvatarConfig = {
  gender: 'unisex',
  skinTone: 'peach',
  hairStyle: 'short',
  hairColor: 'brown',
  expression: 'happy',
  clothingType: 'tshirt',
  clothingColor: 'indigo',
  accessory: 'none',
  shoesColor: 'white',
};

const INITIAL_UNLOCKED_ITEMS = AVATAR_CATALOG.filter(item => item.isUnlocked).map(item => item.id);

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      unlockedItemIds: INITIAL_UNLOCKED_ITEMS,

      updateConfig: (updates) => {
        set((state) => ({
          config: {
            ...state.config,
            ...updates,
          },
        }));
      },

      buyItem: (itemId) => {
        const { unlockedItemIds } = get();
        if (unlockedItemIds.includes(itemId)) return true;

        const item = AVATAR_CATALOG.find(i => i.id === itemId);
        if (!item) return false;

        const userStore = useUserStore.getState();
        const success = userStore.deductCoins(item.coinsCost);

        if (success) {
          set((state) => ({
            unlockedItemIds: [...state.unlockedItemIds, itemId],
          }));
          return true;
        }

        return false;
      },

      unlockAchievementItem: (itemId) => {
        set((state) => {
          if (state.unlockedItemIds.includes(itemId)) return {};
          return {
            unlockedItemIds: [...state.unlockedItemIds, itemId],
          };
        });
      },

      isUnlocked: (itemId) => {
        return get().unlockedItemIds.includes(itemId);
      },

      getEquippedItem: (category) => {
        const { config } = get();
        // Finds matching item from catalog based on category and config state
        return AVATAR_CATALOG.find(item => {
          if (item.category !== category) return false;
          
          if (category === 'clothing') {
            return item.type === config.clothingType && item.color === config.clothingColor;
          }
          if (category === 'hairStyle') {
            return item.type === config.hairStyle;
          }
          if (category === 'accessory') {
            return item.type === config.accessory;
          }
          if (category === 'shoes') {
            return item.type === config.shoesColor;
          }
          return false;
        });
      }
    }),
    {
      name: 'trainier-avatar-store',
    }
  )
);
