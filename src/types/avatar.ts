export type SkinTone = 'fair' | 'peach' | 'olive' | 'bronze' | 'dark';
export type HairStyle = 'short' | 'long' | 'spiky' | 'curly' | 'bald' | 'ponytail';
export type HairColor = 'black' | 'brown' | 'blonde' | 'red' | 'silver';
export type FaceExpression = 'happy' | 'smile' | 'determined' | 'energetic' | 'cool';
export type ClothingType = 'tshirt' | 'tanktop' | 'jacket' | 'hoodie' | 'jersey';
export type ClothingColor = 'indigo' | 'cyan' | 'green' | 'orange' | 'yellow' | 'red' | 'purple' | 'gold';
export type AccessoryType = 'none' | 'headphones' | 'cap' | 'sweatband' | 'glasses' | 'medal';

export interface AvatarConfig {
  gender: 'male' | 'female' | 'unisex';
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: HairColor;
  expression: FaceExpression;
  clothingType: ClothingType;
  clothingColor: ClothingColor;
  accessory: AccessoryType;
  shoesColor: 'white' | 'black' | 'red' | 'cyan' | 'gold';
}

export interface AvatarCatalogItem {
  id: string;
  name: string;
  category: 'clothing' | 'hairStyle' | 'accessory' | 'shoes';
  type: string; // e.g. 'headphones', 'jacket', 'gold'
  color?: string; // if applicable
  coinsCost: number; // Cost to unlock in shop (if not free)
  isUnlocked: boolean;
  requiredMetric?: {
    metric: 'distance' | 'streak' | 'workoutCount';
    value: number;
    description: string;
  };
}
