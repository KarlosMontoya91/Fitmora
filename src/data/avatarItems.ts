import { AvatarCatalogItem } from '../types/avatar';

export const AVATAR_CATALOG: AvatarCatalogItem[] = [
  // Clothing
  { id: 'clothing_tshirt_indigo', name: 'Camiseta Índigo', category: 'clothing', type: 'tshirt', color: 'indigo', coinsCost: 0, isUnlocked: true },
  { id: 'clothing_tshirt_cyan', name: 'Camiseta Cyan', category: 'clothing', type: 'tshirt', color: 'cyan', coinsCost: 50, isUnlocked: true },
  { id: 'clothing_tanktop_orange', name: 'Esqueleto Naranja', category: 'clothing', type: 'tanktop', color: 'orange', coinsCost: 100, isUnlocked: false },
  { id: 'clothing_hoodie_purple', name: 'Hoodie Morado', category: 'clothing', type: 'hoodie', color: 'purple', coinsCost: 200, isUnlocked: false },
  
  // Unlocked through achievements
  {
    id: 'clothing_jersey_green',
    name: 'Jersey de Campeón Verde',
    category: 'clothing',
    type: 'jersey',
    color: 'green',
    coinsCost: 0,
    isUnlocked: false,
    requiredMetric: { metric: 'workoutCount', value: 1, description: 'Completa tu primer entrenamiento en caminadora' }
  },
  {
    id: 'clothing_hoodie_cyan',
    name: 'Sudadera Cyan Pro',
    category: 'clothing',
    type: 'hoodie',
    color: 'cyan',
    coinsCost: 0,
    isUnlocked: false,
    requiredMetric: { metric: 'workoutCount', value: 1, description: 'Completa tu primer entrenamiento en bicicleta fija' }
  },
  {
    id: 'clothing_jacket_gold',
    name: 'Chaqueta Dorada Real',
    category: 'clothing',
    type: 'jacket',
    color: 'gold',
    coinsCost: 0,
    isUnlocked: false,
    requiredMetric: { metric: 'workoutCount', value: 1, description: 'Completa 1 plan guiado de entrenamiento' }
  },

  // HairStyles (mostly free or low cost)
  { id: 'hair_short', name: 'Cabello Corto', category: 'hairStyle', type: 'short', coinsCost: 0, isUnlocked: true },
  { id: 'hair_long', name: 'Cabello Largo', category: 'hairStyle', type: 'long', coinsCost: 0, isUnlocked: true },
  { id: 'hair_spiky', name: 'Cabello Spiky', category: 'hairStyle', type: 'spiky', coinsCost: 50, isUnlocked: true },
  { id: 'hair_curly', name: 'Cabello Rizado', category: 'hairStyle', type: 'curly', coinsCost: 50, isUnlocked: true },
  { id: 'hair_ponytail', name: 'Cabello Cola de Caballo', category: 'hairStyle', type: 'ponytail', coinsCost: 50, isUnlocked: true },
  { id: 'hair_bald', name: 'Rapado', category: 'hairStyle', type: 'bald', coinsCost: 0, isUnlocked: true },

  // Accessories
  { id: 'accessory_none', name: 'Sin Accesorio', category: 'accessory', type: 'none', coinsCost: 0, isUnlocked: true },
  { id: 'accessory_sweatband_blue', name: 'Banda Sudor Azul', category: 'accessory', type: 'sweatband', color: 'cyan', coinsCost: 80, isUnlocked: false },
  { id: 'accessory_cap_orange', name: 'Gorra Naranja de Explorador', category: 'accessory', type: 'cap', color: 'orange', coinsCost: 0, isUnlocked: false, requiredMetric: { metric: 'workoutCount', value: 1, description: 'Completa tu primer entrenamiento al aire libre con GPS' } },
  { id: 'accessory_headphones_gold', name: 'Audífonos Pro Dorados', category: 'accessory', type: 'headphones', color: 'gold', coinsCost: 0, isUnlocked: false, requiredMetric: { metric: 'streak', value: 7, description: 'Obtén una racha de entrenamiento de 7 días' } },
  { id: 'accessory_glasses_gold', name: 'Gafas de Sol Premium', category: 'accessory', type: 'glasses', color: 'gold', coinsCost: 0, isUnlocked: false, requiredMetric: { metric: 'distance', value: 20, description: 'Acumula 20 km recorridos en total' } },

  // Shoes
  { id: 'shoes_white', name: 'Tenis Clásicos Blancos', category: 'shoes', type: 'white', coinsCost: 0, isUnlocked: true },
  { id: 'shoes_black', name: 'Tenis de Asfalto Negros', category: 'shoes', type: 'black', coinsCost: 80, isUnlocked: false },
  { id: 'shoes_red', name: 'Tenis de Pista Rojos', category: 'shoes', type: 'red', coinsCost: 0, isUnlocked: false, requiredMetric: { metric: 'distance', value: 5, description: 'Acumula 5 km recorridos en total' } }
];
