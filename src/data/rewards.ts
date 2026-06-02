import { Achievement } from '../types/reward';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_treadmill',
    title: 'Pionero de la Banda',
    description: 'Completa tu primer entrenamiento en caminadora.',
    type: 'treadmill_first',
    targetValue: 1,
    badgeIcon: 'Activity',
    coinsReward: 100,
    xpReward: 150,
    isUnlocked: false,
    unlockedAvatarItemId: 'clothing_jersey_green' // Unlocks green jersey
  },
  {
    id: 'first_gps',
    title: 'Explorador Urbano',
    description: 'Completa tu primer entrenamiento al aire libre usando GPS.',
    type: 'gps_first',
    targetValue: 1,
    badgeIcon: 'MapPin',
    coinsReward: 100,
    xpReward: 150,
    isUnlocked: false,
    unlockedAvatarItemId: 'accessory_cap_orange' // Unlocks orange cap
  },
  {
    id: 'first_bike',
    title: 'Rey del Pedaleo',
    description: 'Completa tu primer entrenamiento en bicicleta fija.',
    type: 'bike_first',
    targetValue: 1,
    badgeIcon: 'Compass',
    coinsReward: 100,
    xpReward: 150,
    isUnlocked: false,
    unlockedAvatarItemId: 'clothing_hoodie_cyan' // Unlocks cyan hoodie
  },
  {
    id: 'streak_7',
    title: 'Imparable',
    description: 'Alcanza una racha activa de 7 días entrenando.',
    type: 'streak_days',
    targetValue: 7,
    badgeIcon: 'Flame',
    coinsReward: 350,
    xpReward: 400,
    isUnlocked: false,
    unlockedAvatarItemId: 'accessory_headphones_gold' // Unlocks golden headphones
  },
  {
    id: 'distance_5k',
    title: 'Primer Gran Hito',
    description: 'Acumula 5 km de entrenamiento total.',
    type: 'distance_accumulated',
    targetValue: 5,
    badgeIcon: 'Award',
    coinsReward: 200,
    xpReward: 250,
    isUnlocked: false,
    unlockedAvatarItemId: 'shoes_red' // Unlocks red sneakers
  },
  {
    id: 'distance_20k',
    title: 'Maratonista Virtual',
    description: 'Acumula 20 km de entrenamiento total.',
    type: 'distance_accumulated',
    targetValue: 20,
    badgeIcon: 'Trophy',
    coinsReward: 500,
    xpReward: 600,
    isUnlocked: false,
    unlockedAvatarItemId: 'accessory_glasses_gold' // Unlocks golden sunglasses
  },
  {
    id: 'plan_completed_1',
    title: 'Graduado del Esfuerzo',
    description: 'Completa tu primer plan guiado de entrenamiento completo.',
    type: 'plan_completed',
    targetValue: 1,
    badgeIcon: 'Crown',
    coinsReward: 400,
    xpReward: 500,
    isUnlocked: false,
    unlockedAvatarItemId: 'clothing_jacket_gold' // Unlocks golden premium jacket
  }
];
