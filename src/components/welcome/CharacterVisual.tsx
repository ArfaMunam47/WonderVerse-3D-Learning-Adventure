import React from 'react';
import { ExplorerCharacterId } from '../../types';

interface CharacterVisualProps {
  characterId: ExplorerCharacterId;
  isUnlocked: boolean;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const CharacterVisual: React.FC<CharacterVisualProps> = ({
  characterId,
  isUnlocked,
  isSelected = false,
  size = 'md',
  className = '',
  animate = false
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-28 h-28 sm:w-36 sm:h-36',
    xl: 'w-36 h-36 sm:w-44 sm:h-44'
  };

  // Map backwards compatible IDs to main 8
  let resolvedId: string = characterId;
  if (characterId === 'little_artist') resolvedId = 'creative_dreamer';
  if (characterId === 'forest_friend') resolvedId = 'forest_fawn';
  if (characterId === 'tiny_inventor') resolvedId = 'little_inventor';
  if (characterId === 'magical_companion') resolvedId = 'star_sprite';
  if (characterId === 'adventurous_kid') resolvedId = 'little_adventurer';

  const animationClass = isSelected
    ? 'animate-bounce-subtle'
    : animate
    ? 'hover:scale-105 transition-transform duration-300'
    : '';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${sizeMap[size]} ${animationClass} ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full drop-shadow-sm ${!isUnlocked ? 'filter saturate-40 opacity-75' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Aura / Background Glow */}
        <circle
          cx="60"
          cy="60"
          r="54"
          fill={
            isSelected
              ? '#FEF3C7'
              : !isUnlocked
              ? '#F1F5F9'
              : resolvedId === 'curious_explorer'
              ? '#E0F2FE'
              : resolvedId === 'little_inventor'
              ? '#FEF3C7'
              : resolvedId === 'nature_explorer'
              ? '#DCFCE7'
              : resolvedId === 'creative_dreamer'
              ? '#F3E8FF'
              : resolvedId === 'forest_fawn'
              ? '#FEF9C3'
              : resolvedId === 'little_adventurer'
              ? '#FFE4E6'
              : resolvedId === 'star_sprite'
              ? '#EDE9FE'
              : '#F1F5F9'
          }
          stroke={isSelected ? '#F59E0B' : '#E2E8F0'}
          strokeWidth={isSelected ? '3' : '1.5'}
        />

        {/* 1. PIP THE CURIOUS EXPLORER (Sun Hat, Warm Scarf, Hazel Eyes, Cheerful) */}
        {resolvedId === 'curious_explorer' && (
          <g>
            {/* Soft Warm Hair behind */}
            <circle cx="60" cy="58" r="32" fill="#D97706" />
            <ellipse cx="40" cy="68" rx="8" ry="12" fill="#B45309" />
            <ellipse cx="80" cy="68" rx="8" ry="12" fill="#B45309" />

            {/* Neck & Yellow/Teal Explorer Scarf */}
            <path d="M 52 78 Q 60 84 68 78 L 74 98 L 46 98 Z" fill="#0284C7" />
            <ellipse cx="60" cy="84" rx="14" ry="6" fill="#FBBF24" />
            <circle cx="60" cy="85" r="3" fill="#0284C7" />

            {/* Head */}
            <circle cx="60" cy="56" r="26" fill="#FED7AA" />

            {/* Rosy Cheeks */}
            <circle cx="43" cy="63" r="5" fill="#FDA4AF" opacity="0.8" />
            <circle cx="77" cy="63" r="5" fill="#FDA4AF" opacity="0.8" />

            {/* Big Friendly Cartoon Eyes */}
            <ellipse cx="49" cy="54" rx="4.5" ry="6" fill="#38220F" />
            <ellipse cx="71" cy="54" rx="4.5" ry="6" fill="#38220F" />
            <circle cx="47.5" cy="52" r="2" fill="#FFFFFF" />
            <circle cx="69.5" cy="52" r="2" fill="#FFFFFF" />
            <circle cx="51" cy="56.5" r="1" fill="#FFFFFF" />
            <circle cx="73" cy="56.5" r="1" fill="#FFFFFF" />

            {/* Happy Smile */}
            <path d="M 54 66 Q 60 72 66 66" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />

            {/* Bangs */}
            <path d="M 38 48 Q 50 56 60 48 Q 70 56 82 48" fill="#B45309" />

            {/* Sun Hat */}
            <path d="M 32 44 C 32 40, 42 22, 60 22 C 78 22, 88 40, 88 44 Z" fill="#FBBF24" />
            <path d="M 24 45 C 38 40, 82 40, 96 45 C 96 48, 24 48, 24 45 Z" fill="#F59E0B" />
            <rect x="37" y="38" width="46" height="5" rx="2" fill="#0284C7" />
            <circle cx="60" cy="40.5" r="3" fill="#34D399" />
          </g>
        )}

        {/* 2. MILO THE LITTLE INVENTOR (Curly Hair, Brass Goggles, Gear Pin) */}
        {resolvedId === 'little_inventor' && (
          <g>
            {/* Curly Amber Hair */}
            <circle cx="42" cy="42" r="12" fill="#92400E" />
            <circle cx="78" cy="42" r="12" fill="#92400E" />
            <circle cx="60" cy="36" r="14" fill="#92400E" />
            <circle cx="60" cy="54" r="30" fill="#B45309" />

            {/* Collar & Vest */}
            <path d="M 50 78 Q 60 85 70 78 L 76 98 L 44 98 Z" fill="#D97706" />
            <path d="M 44 82 L 54 98 L 66 98 L 76 82 Z" fill="#0284C7" />
            <circle cx="52" cy="90" r="3" fill="#FBBF24" />

            {/* Head */}
            <circle cx="60" cy="56" r="25" fill="#FFEDD5" />

            {/* Rosy Cheeks */}
            <circle cx="43" cy="63" r="5" fill="#FECDD3" opacity="0.8" />
            <circle cx="77" cy="63" r="5" fill="#FECDD3" opacity="0.8" />

            {/* Eyes */}
            <ellipse cx="49" cy="55" rx="4.5" ry="6" fill="#38220F" />
            <ellipse cx="71" cy="55" rx="4.5" ry="6" fill="#38220F" />
            <circle cx="47.5" cy="53" r="2" fill="#FFFFFF" />
            <circle cx="69.5" cy="53" r="2" fill="#FFFFFF" />
            <circle cx="51" cy="57" r="0.9" fill="#FFFFFF" />
            <circle cx="73" cy="57" r="0.9" fill="#FFFFFF" />

            {/* Confident Smile */}
            <path d="M 53 66 Q 60 73 67 66" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />

            {/* Brass Goggles on Head */}
            <rect x="32" y="36" width="56" height="5" rx="2" fill="#78350F" />
            <circle cx="46" cy="38" r="9" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <circle cx="46" cy="38" r="6" fill="#BAE6FD" opacity="0.9" />
            <circle cx="74" cy="38" r="9" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <circle cx="74" cy="38" r="6" fill="#BAE6FD" opacity="0.9" />
            <rect x="55" y="36" width="10" height="4" fill="#B45309" />
            {/* Glass glint */}
            <line x1="43" y1="35" x2="48" y2="41" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="71" y1="35" x2="76" y2="41" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {/* 3. WILLOW THE NATURE EXPLORER (Leaf Crown, Wildflower, Moss Smock) */}
        {resolvedId === 'nature_explorer' && (
          <g>
            {/* Soft Wavy Emerald Hair */}
            <circle cx="60" cy="58" r="32" fill="#15803D" />
            <circle cx="36" cy="62" r="10" fill="#166534" />
            <circle cx="84" cy="62" r="10" fill="#166534" />

            {/* Smock & Leaf Collar */}
            <path d="M 48 78 Q 60 84 72 78 L 78 98 L 42 98 Z" fill="#16A34A" />
            <ellipse cx="60" cy="82" rx="16" ry="6" fill="#86EFAC" />
            <circle cx="60" cy="88" r="4" fill="#F59E0B" />

            {/* Head */}
            <circle cx="60" cy="56" r="25" fill="#FED7AA" />

            {/* Cheeks */}
            <circle cx="43" cy="63" r="5" fill="#FDA4AF" opacity="0.8" />
            <circle cx="77" cy="63" r="5" fill="#FDA4AF" opacity="0.8" />

            {/* Gentle Doe Eyes */}
            <ellipse cx="49" cy="54" rx="4.5" ry="6" fill="#1E293B" />
            <ellipse cx="71" cy="54" rx="4.5" ry="6" fill="#1E293B" />
            <circle cx="47.5" cy="52" r="2" fill="#FFFFFF" />
            <circle cx="69.5" cy="52" r="2" fill="#FFFFFF" />

            {/* Sweet Smile */}
            <path d="M 55 66 Q 60 71 65 66" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />

            {/* Bangs */}
            <path d="M 38 48 Q 50 56 60 48 Q 70 56 82 48" fill="#166534" />

            {/* Leaf & Blossom Crown */}
            <path d="M 34 38 Q 60 30 86 38" stroke="#15803D" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Leaves */}
            <ellipse cx="42" cy="34" rx="4" ry="7" transform="rotate(-25 42 34)" fill="#4ADE80" />
            <ellipse cx="78" cy="34" rx="4" ry="7" transform="rotate(25 78 34)" fill="#4ADE80" />
            {/* Blossom */}
            <circle cx="60" cy="32" r="6" fill="#F472B6" />
            <circle cx="60" cy="32" r="2.5" fill="#FEF08A" />
          </g>
        )}

        {/* 4. LUNA THE CREATIVE DREAMER (Purple Star Beret, Rainbow Streak, Cheerful) */}
        {resolvedId === 'creative_dreamer' && (
          <g>
            {/* Lilac Bob Hair with subtle purple tones */}
            <circle cx="60" cy="58" r="32" fill="#7C3AED" />
            <ellipse cx="36" cy="64" rx="7" ry="12" fill="#6D28D9" />
            <ellipse cx="84" cy="64" rx="7" ry="12" fill="#6D28D9" />

            {/* Paint Smock with Rainbow Pocket */}
            <path d="M 48 78 Q 60 84 72 78 L 78 98 L 42 98 Z" fill="#9333EA" />
            <rect x="52" y="84" width="16" height="10" rx="3" fill="#FDF2F8" stroke="#E9D5FF" strokeWidth="1.5" />
            <circle cx="56" cy="89" r="2" fill="#EF4444" />
            <circle cx="60" cy="89" r="2" fill="#F59E0B" />
            <circle cx="64" cy="89" r="2" fill="#3B82F6" />

            {/* Head */}
            <circle cx="60" cy="56" r="25" fill="#FFEDD5" />

            {/* Cheeks */}
            <circle cx="43" cy="63" r="5" fill="#F472B6" opacity="0.8" />
            <circle cx="77" cy="63" r="5" fill="#F472B6" opacity="0.8" />

            {/* Sparkly Star Eyes */}
            <ellipse cx="49" cy="54" rx="4.5" ry="6" fill="#2E1065" />
            <ellipse cx="71" cy="54" rx="4.5" ry="6" fill="#2E1065" />
            <circle cx="47.5" cy="52" r="2" fill="#FFFFFF" />
            <circle cx="69.5" cy="52" r="2" fill="#FFFFFF" />
            <polygon points="51,56 52,54 53,56 55,57 53,58 52,60 51,58 49,57" fill="#FDE047" />

            {/* Cheerful Smile */}
            <path d="M 54 66 Q 60 72 66 66" stroke="#831843" strokeWidth="2.5" strokeLinecap="round" />

            {/* Purple Artist Beret */}
            <path d="M 30 38 C 30 24, 86 18, 92 36 C 94 44, 30 46, 30 38 Z" fill="#6D28D9" />
            {/* Beret Golden Star Tip */}
            <polygon points="62,18 64,13 67,17 72,17 68,20 70,24 65,22 61,24 63,20" fill="#FACC15" />
          </g>
        )}

        {/* 5. BRAMBLE THE MEADOW FAWN (Original Forest Creature: Mossy Antlers, Floral Blossoms, Velvet Ears) */}
        {resolvedId === 'forest_fawn' && (
          <g>
            {/* Soft Warm Fawn Body & Clover Collar */}
            <path d="M 48 78 Q 60 84 72 78 L 78 98 L 42 98 Z" fill="#B45309" />
            <circle cx="60" cy="86" r="8" fill="#FEF3C7" />
            <circle cx="60" cy="85" r="4" fill="#16A34A" />

            {/* Deer Velvet Ears */}
            <ellipse cx="30" cy="46" rx="8" ry="16" transform="rotate(-35 30 46)" fill="#D97706" />
            <ellipse cx="30" cy="46" rx="4.5" ry="11" transform="rotate(-35 30 46)" fill="#FDE68A" />

            <ellipse cx="90" cy="46" rx="8" ry="16" transform="rotate(35 90 46)" fill="#D97706" />
            <ellipse cx="90" cy="46" rx="4.5" ry="11" transform="rotate(35 90 46)" fill="#FDE68A" />

            {/* Fawn Head */}
            <circle cx="60" cy="58" r="26" fill="#D97706" />
            <ellipse cx="60" cy="65" rx="14" ry="12" fill="#FEF3C7" />

            {/* White Fawn Spots */}
            <circle cx="48" cy="46" r="2" fill="#FFFFFF" opacity="0.9" />
            <circle cx="72" cy="46" r="2" fill="#FFFFFF" opacity="0.9" />
            <circle cx="60" cy="44" r="2.2" fill="#FFFFFF" opacity="0.9" />

            {/* Soft Blush */}
            <circle cx="42" cy="64" r="4" fill="#FDA4AF" opacity="0.85" />
            <circle cx="78" cy="64" r="4" fill="#FDA4AF" opacity="0.85" />

            {/* Big Expressive Doe Eyes */}
            <ellipse cx="48" cy="55" rx="5" ry="6.5" fill="#292524" />
            <ellipse cx="72" cy="55" rx="5" ry="6.5" fill="#292524" />
            <circle cx="46.5" cy="53" r="2.2" fill="#FFFFFF" />
            <circle cx="70.5" cy="53" r="2.2" fill="#FFFFFF" />
            <circle cx="50" cy="57" r="1.2" fill="#FFFFFF" />
            <circle cx="74" cy="57" r="1.2" fill="#FFFFFF" />

            {/* Soft Cute Nose & Smile */}
            <ellipse cx="60" cy="64" rx="3.5" ry="2.5" fill="#451A03" />
            <path d="M 56 68 Q 60 71 64 68" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />

            {/* Mini Mossy Antlers with Blossoms */}
            <path d="M 48 38 Q 42 26 36 20 M 40 26 Q 46 22 48 18" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
            <path d="M 72 38 Q 78 26 84 20 M 80 26 Q 74 22 72 18" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
            {/* Glowing Blossom Buds */}
            <circle cx="36" cy="20" r="3" fill="#F472B6" />
            <circle cx="84" cy="20" r="3" fill="#F472B6" />
            <circle cx="48" cy="18" r="2.5" fill="#FBBF24" />
            <circle cx="72" cy="18" r="2.5" fill="#FBBF24" />
          </g>
        )}

        {/* 6. KOA THE LITTLE ADVENTURER (Sporty Explorer Cap, Compass Pin, Brave Smile) */}
        {resolvedId === 'little_adventurer' && (
          <g>
            {/* Dark Chestnut Hair */}
            <circle cx="60" cy="58" r="32" fill="#3E2723" />

            {/* Coral Trail Windbreaker */}
            <path d="M 48 78 Q 60 84 72 78 L 78 98 L 42 98 Z" fill="#EA580C" />
            <circle cx="60" cy="88" r="5" fill="#0284C7" stroke="#F8FAFC" strokeWidth="1.5" />
            {/* Compass needle */}
            <line x1="60" y1="85" x2="60" y2="91" stroke="#EF4444" strokeWidth="1.5" />

            {/* Head */}
            <circle cx="60" cy="56" r="25" fill="#FED7AA" />

            {/* Cheeks */}
            <circle cx="43" cy="63" r="5" fill="#FDA4AF" opacity="0.8" />
            <circle cx="77" cy="63" r="5" fill="#FDA4AF" opacity="0.8" />

            {/* Brave Eyes */}
            <ellipse cx="49" cy="54" rx="4.5" ry="6" fill="#1E293B" />
            <ellipse cx="71" cy="54" rx="4.5" ry="6" fill="#1E293B" />
            <circle cx="47.5" cy="52" r="2" fill="#FFFFFF" />
            <circle cx="69.5" cy="52" r="2" fill="#FFFFFF" />

            {/* Bold Smile */}
            <path d="M 53 66 Q 60 74 67 66" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />

            {/* Explorer Visor Cap */}
            <path d="M 32 44 C 32 30, 88 30, 88 44 Z" fill="#0284C7" />
            <path d="M 28 44 C 44 48, 76 48, 92 44 C 92 48, 28 48, 28 44 Z" fill="#0369A1" />
            <polygon points="60,32 62,37 67,37 63,40 65,45 60,42 55,45 57,40 53,37 58,37" fill="#FBBF24" />
          </g>
        )}

        {/* 7. NOVA THE STAR SPRITE (Original Starlight Friend: Lavender Glow, Constellation Tiara) */}
        {resolvedId === 'star_sprite' && (
          <g>
            {/* Celestial Starlight Body */}
            <path d="M 48 78 Q 60 84 72 78 L 76 98 L 44 98 Z" fill="#8B5CF6" />
            <circle cx="60" cy="88" r="6" fill="#FDE047" />

            {/* Fairy Flutter Wings */}
            <ellipse cx="28" cy="58" rx="8" ry="18" transform="rotate(-30 28 58)" fill="#C4B5FD" opacity="0.75" />
            <ellipse cx="92" cy="58" rx="8" ry="18" transform="rotate(30 92 58)" fill="#C4B5FD" opacity="0.75" />

            {/* Star Sprite Head */}
            <circle cx="60" cy="56" r="26" fill="#DDD6FE" />

            {/* Cheeks */}
            <circle cx="42" cy="62" r="4.5" fill="#F472B6" opacity="0.85" />
            <circle cx="78" cy="62" r="4.5" fill="#F472B6" opacity="0.85" />

            {/* Glowing Star Eyes */}
            <polygon points="49,49 51,53 55,53 52,56 53,60 49,57 45,60 46,56 43,53 47,53" fill="#6D28D9" />
            <polygon points="71,49 73,53 77,53 74,56 75,60 71,57 67,60 68,56 65,53 69,53" fill="#6D28D9" />
            <circle cx="47" cy="51" r="1.5" fill="#FFFFFF" />
            <circle cx="69" cy="51" r="1.5" fill="#FFFFFF" />

            {/* Magical Gentle Smile */}
            <path d="M 55 66 Q 60 70 65 66" stroke="#5B21B6" strokeWidth="2.5" strokeLinecap="round" />

            {/* Constellation Crown */}
            <path d="M 42 34 L 50 24 L 60 30 L 70 24 L 78 34" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="50" cy="24" r="3" fill="#FDE047" />
            <circle cx="60" cy="30" r="3.5" fill="#FBBF24" />
            <circle cx="70" cy="24" r="3" fill="#FDE047" />
          </g>
        )}

        {/* 8. ZEPHYR THE WIND WEAVER (Future Slot Mystery Companion) */}
        {resolvedId === 'future_companion' && (
          <g>
            <circle cx="60" cy="58" r="30" fill="#E2E8F0" />
            <circle cx="60" cy="56" r="24" fill="#CBD5E1" />
            <path d="M 44 48 Q 60 38 76 48" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" fill="none" />
            <text x="60" y="68" textAnchor="middle" fill="#64748B" fontSize="24" fontWeight="bold" fontFamily="sans-serif">
              ?
            </text>
          </g>
        )}
      </svg>

      {/* Selection Sparkle Indicator */}
      {isSelected && isUnlocked && (
        <div className="absolute -top-1 -right-1 text-amber-500 text-lg animate-spin-slow">
          ✨
        </div>
      )}
    </div>
  );
};
