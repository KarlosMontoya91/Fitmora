import React from 'react';
import { AvatarConfig, SkinTone, HairStyle, HairColor, FaceExpression, ClothingType, ClothingColor, AccessoryType } from '../../types/avatar';

interface AvatarVisualProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
  animate?: boolean;
}

// Skin colors hex values matching accessible contrast
const SKIN_COLORS: Record<SkinTone, string> = {
  fair: '#FFDBAC',
  peach: '#F1C27D',
  olive: '#E0AC69',
  bronze: '#C68642',
  dark: '#8D5524',
};

// Hair colors hex values
const HAIR_COLORS: Record<HairColor, string> = {
  black: '#111827',
  brown: '#5C3A21',
  blonde: '#F59E0B',
  red: '#DC2626',
  silver: '#9CA3AF',
};

// Clothing colors hex values
const CLOTHING_COLORS: Record<ClothingColor, string> = {
  indigo: '#4F46E5',
  cyan: '#06B6D4',
  green: '#22C55E',
  orange: '#F97316',
  yellow: '#FACC15',
  red: '#EF4444',
  purple: '#A855F7',
  gold: '#EAB308',
};

export const AvatarVisual: React.FC<AvatarVisualProps> = ({
  config,
  size = 120,
  className = '',
  animate = true,
}) => {
  const skin = SKIN_COLORS[config.skinTone] || SKIN_COLORS.peach;
  const hair = HAIR_COLORS[config.hairColor] || HAIR_COLORS.brown;
  const clothes = CLOTHING_COLORS[config.clothingColor] || CLOTHING_COLORS.indigo;

  // CSS class for idle bounce animation (Duolingo style)
  const animationClass = animate ? 'animate-bounce-slow' : '';

  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden rounded-full border-4 border-brand-primary/20 bg-gradient-to-br from-brand-secondary/10 via-brand-primary/10 to-brand-energy/10 p-2 dark:border-brand-primaryDark/30 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full transition-all duration-300 ${animationClass}`}
        aria-hidden="true"
      >
        {/* Shadow under Avatar */}
        <ellipse cx="50" cy="94" rx="30" ry="4" fill="rgba(0, 0, 0, 0.12)" />

        {/* 1. Body & Base Neck */}
        <path d="M44 65h12v15H44z" fill={skin} opacity="0.9" />
        <path d="M44 72a6 6 0 0 0 12 0" fill="rgba(0, 0, 0, 0.15)" /> {/* Neck shadow */}

        {/* 2. Clothes Base & Body */}
        {config.clothingType === 'tanktop' ? (
          <>
            {/* Shoulders */}
            <path d="M22 80c0-10 12-14 28-14s28 4 28 14v16H22V80z" fill={clothes} />
            {/* Straps */}
            <path d="M35 66h7v14h-7zM58 66h7v14h-7z" fill={clothes} />
            {/* Neck cutout */}
            <path d="M42 66c0 6 16 6 16 0" fill={skin} />
          </>
        ) : config.clothingType === 'hoodie' ? (
          <>
            {/* Shoulders */}
            <path d="M20 78c0-12 12-14 30-14s30 2 30 14v18H20V78z" fill={clothes} />
            {/* Hood outline */}
            <path d="M30 65c0-4 8-7 20-7s20 3 20 7v9c0 4-8 7-20 7s-20-3-20-7v-9z" fill={clothes} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
            {/* Inner neck opening */}
            <path d="M44 64h12l-6 10z" fill="rgba(0,0,0,0.2)" />
            {/* Strings */}
            <path d="M47 70v10M53 70v10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </>
        ) : config.clothingType === 'jacket' ? (
          <>
            {/* Base shirt underneath */}
            <path d="M22 80c0-10 12-14 28-14s28 4 28 14v16H22V80z" fill="#FFFFFF" />
            {/* Jacket body */}
            <path d="M20 78c0-12 12-14 30-14s30 2 30 14v18H20V78z" fill={clothes} />
            {/* Open lapels */}
            <path d="M35 64l15 16L65 64" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
            <path d="M42 66c0 6 16 6 16 0" fill={skin} />
            {/* Zipper detailing */}
            {config.clothingColor === 'gold' && (
              <path d="M50 72v18" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="2,2" />
            )}
          </>
        ) : config.clothingType === 'jersey' ? (
          <>
            {/* Jersey Body */}
            <path d="M22 80c0-10 12-14 28-14s28 4 28 14v16H22V80z" fill={clothes} />
            {/* V neck collar */}
            <path d="M40 66l10 7 10-7" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Number on chest */}
            <text x="50" y="85" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" opacity="0.9">
              01
            </text>
          </>
        ) : (
          // Standard T-Shirt
          <>
            {/* Shoulders */}
            <path d="M22 80c0-10 12-14 28-14s28 4 28 14v16H22V80z" fill={clothes} />
            {/* Collar line */}
            <path d="M42 66c0 4 16 4 16 0" fill="none" stroke="rgba(0, 0, 0, 0.15)" strokeWidth="2" />
          </>
        )}

        {/* 3. Head & Ears */}
        <circle cx="34" cy="46" r="4.5" fill={skin} /> {/* Left Ear */}
        <circle cx="66" cy="46" r="4.5" fill={skin} /> {/* Right Ear */}
        <rect x="35" y="26" width="30" height="34" rx="14" fill={skin} /> {/* Face base */}

        {/* 4. Eyes & Eyebrows */}
        {config.expression === 'happy' ? (
          <>
            {/* Happy Curved Eyes */}
            <path d="M40 43c0-2 4-2 4 0M56 43c0-2 4-2 4 0" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
            {/* Eyebrows */}
            <path d="M38 38c2-2 6-1 6 0M56 38c2-2 6-1 6 0" fill="none" stroke={hair} strokeWidth="2" strokeLinecap="round" />
          </>
        ) : config.expression === 'determined' ? (
          <>
            {/* Focused / Determined Eyes */}
            <circle cx="42" cy="42" r="2.5" fill="#1E293B" />
            <circle cx="58" cy="42" r="2.5" fill="#1E293B" />
            <circle cx="43" cy="41" r="0.8" fill="#FFFFFF" />
            <circle cx="59" cy="41" r="0.8" fill="#FFFFFF" />
            {/* Determined slanted eyebrows */}
            <path d="M37 38l7 2M63 38l-7 2" fill="none" stroke={hair} strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : config.expression === 'energetic' ? (
          <>
            {/* Excited wide eyes */}
            <circle cx="41" cy="41" r="3.5" fill="#1E293B" />
            <circle cx="59" cy="41" r="3.5" fill="#1E293B" />
            <circle cx="42.5" cy="39.5" r="1.2" fill="#FFFFFF" />
            <circle cx="60.5" cy="39.5" r="1.2" fill="#FFFFFF" />
            {/* Lifted eyebrows */}
            <path d="M36 36a5 5 0 0 1 8-1M56 35a5 5 0 0 1 8 1" fill="none" stroke={hair} strokeWidth="2" strokeLinecap="round" />
          </>
        ) : config.expression === 'cool' ? (
          <>
            {/* Cool winking or half closed eyes */}
            <path d="M39 42h6M55 42l5-1" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
            {/* Cool eyebrows */}
            <path d="M37 38c3-1 6 0 6 0M57 37c3-1 6 0 6 0" fill="none" stroke={hair} strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          // Simple smile expression eyes
          <>
            <circle cx="42" cy="42" r="2" fill="#1E293B" />
            <circle cx="58" cy="42" r="2" fill="#1E293B" />
            <path d="M39 37a4 4 0 0 1 6-1M55 36a4 4 0 0 1 6-1" fill="none" stroke={hair} strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {/* Nose */}
        <path d="M49 45v3a1 1 0 0 0 2 0v-3z" fill="rgba(0, 0, 0, 0.15)" />

        {/* 5. Mouth & Expression */}
        {config.expression === 'happy' || config.expression === 'energetic' ? (
          // Open smiling mouth with tongue
          <>
            <path d="M42 49c0 6 16 6 16 0z" fill="#991B1B" />
            <path d="M46 52.5c2 2 6 2 8 0" fill="#F43F5E" />
            <path d="M42 49h16" stroke="#1E293B" strokeWidth="1.5" />
          </>
        ) : config.expression === 'determined' ? (
          // Solid, flat mouth line
          <path d="M44 51h12" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        ) : (
          // Standard curved smiling mouth
          <path d="M43 49c2 4 12 4 14 0" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Cheeks blush */}
        <circle cx="36" cy="48" r="2.5" fill="#F43F5E" opacity="0.25" />
        <circle cx="64" cy="48" r="2.5" fill="#F43F5E" opacity="0.25" />

        {/* 6. Hair Styles */}
        {config.hairStyle === 'short' ? (
          <path d="M33 28c3-7 14-8 23-6 7 2 12 7 12 12 0 2-1 4-2 5a6 6 0 0 0-5-5c-7-2-19-1-24 4-2-3-4-7-4-10z" fill={hair} />
        ) : config.hairStyle === 'spiky' ? (
          <path d="M32 29c0-6 4-10 10-12l2 4 4-6 5 6 4-6 4 6 2-4c5 2 7 6 7 12 0 2-2 3-3 3-5-3-11-2-16 0a17 17 0 0 0-16-1l-3-2z" fill={hair} />
        ) : config.hairStyle === 'curly' ? (
          <path d="M32 29c-1-3 1-7 4-8 2-1 5 1 6-1 2-2 6-2 8 0s3-2 5-1c3 1 3 4 5 5 2 2 1 5 2 7 0 3-3 4-5 3a10 10 0 0 0-14 0c-3 1-8-2-11-5z" fill={hair} />
        ) : config.hairStyle === 'long' ? (
          <>
            {/* Background long hair */}
            <path d="M32 32c-3 4-5 12-5 18 0 10 4 16 7 18 1 0 2-2 2-3V45c0-10 2-14 8-16-1-3-6-5-12 3z" fill={hair} />
            <path d="M68 32c3 4 5 12 5 18 0 10-4 16-7 18-1 0-2-2-2-3V45c0-10-2-14-8-16 1-3 6-5 12 3z" fill={hair} />
            {/* Front locks */}
            <path d="M32 28c3-6 13-7 22-5 7 2 13 8 13 13 0 2-2 2-3 1a10 10 0 0 0-14-4c-6-1-12 1-15 4-2-3-3-6-3-9z" fill={hair} />
          </>
        ) : config.hairStyle === 'ponytail' ? (
          <>
            {/* Ponytail tie and puff in background */}
            <circle cx="68" cy="38" r="7" fill={hair} />
            <path d="M66 38l9 12c2 3 1 7-3 7s-8-6-7-13v-6z" fill={hair} />
            <circle cx="64" cy="38" r="2.5" fill="#EF4444" /> {/* Red hair tie */}
            {/* Front bangs */}
            <path d="M32 28c3-6 13-7 22-5 7 2 13 8 13 13 0 2-2 2-3 1a10 10 0 0 0-14-4c-6-1-12 1-15 4-2-3-3-6-3-9z" fill={hair} />
          </>
        ) : (
          // Bald (none - can show some sideburn shadow or just skin)
          <path d="M35 24h30c1 0 2 2 2 3H33l2-3z" fill="rgba(0,0,0,0.06)" />
        )}

        {/* 7. Accessories */}
        {config.accessory === 'cap' ? (
          <>
            {/* Cap dome */}
            <path d="M30 29c1-8 10-12 20-12s19 4 20 12H30z" fill={CLOTHING_COLORS[config.clothingColor] || '#EF4444'} />
            {/* Cap visor */}
            <path d="M30 29c5-3 19-3 30 1 5 2 10 2 12-1l1-2H30v2z" fill={CLOTHING_COLORS[config.clothingColor] || '#EF4444'} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
            {/* Little top button */}
            <circle cx="50" cy="17" r="2" fill="#FFFFFF" opacity="0.8" />
          </>
        ) : config.accessory === 'headphones' ? (
          <>
            {/* Band across head */}
            <path d="M32 30a18 18 0 0 1 36 0" fill="none" stroke={config.clothingColor === 'gold' ? '#FBBF24' : '#1F2937'} strokeWidth="4" />
            {/* Left ear piece */}
            <rect x="27" y="38" width="6" height="13" rx="3" fill={config.clothingColor === 'gold' ? '#EAB308' : '#374151'} />
            <circle cx="30" cy="44.5" r="2.5" fill={config.clothingColor === 'gold' ? '#FDE68A' : '#9CA3AF'} />
            {/* Right ear piece */}
            <rect x="67" y="38" width="6" height="13" rx="3" fill={config.clothingColor === 'gold' ? '#EAB308' : '#374151'} />
            <circle cx="70" cy="44.5" r="2.5" fill={config.clothingColor === 'gold' ? '#FDE68A' : '#9CA3AF'} />
          </>
        ) : config.accessory === 'sweatband' ? (
          <>
            {/* Fabric band on forehead */}
            <path d="M34 32h32v5H34z" fill="#06B6D4" rx="1.5" />
            {/* White stripe detail */}
            <path d="M34 34.5h32v1.5H34z" fill="#FFFFFF" opacity="0.8" />
          </>
        ) : config.accessory === 'glasses' ? (
          <>
            {/* Sporty futuristic sunglasses */}
            <path d="M30 40h40l-2 5a3 3 0 0 1-5 1H50h-3a3 3 0 0 1-5-1l-2-5z" fill={config.clothingColor === 'gold' ? 'rgba(234, 179, 8, 0.95)' : 'rgba(15, 23, 42, 0.9)'} stroke={config.clothingColor === 'gold' ? '#F59E0B' : '#06B6D4'} strokeWidth="1.5" />
            <path d="M35 41h10l-1 2h-8zM55 41h10l-1 2h-8z" fill="rgba(255,255,255,0.25)" /> {/* Glare */}
            {/* Temples (sides) */}
            <path d="M30 40l-3-2M70 40l3-2" stroke="#1E293B" strokeWidth="1.5" />
          </>
        ) : null}

        {/* Special Medal Award overlay around neck (if unlocked and equipped) */}
        {config.accessory === 'medal' && (
          <>
            {/* Ribbons around neck */}
            <path d="M42 66l8 12 8-12" fill="none" stroke="#EF4444" strokeWidth="3" />
            <path d="M44 66l6 12 6-12" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Shiny gold badge */}
            <circle cx="50" cy="79" r="4.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
            {/* Star on medal */}
            <path d="M50 77l.8 1.6 1.8.2-1.3 1.2.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.2 1.8-.2z" fill="#FFFFFF" />
          </>
        )}
      </svg>
    </div>
  );
};
