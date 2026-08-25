import React from 'react';
import { ExplorerCharacterId } from '../../types';
import maxiPng from '../../assets/characters/maxi.png';
import mayaPng from '../../assets/characters/maya.png';
import lumiPng from '../../assets/characters/lumi.png';

interface CharacterVisualProps {
  characterId: ExplorerCharacterId;
  isUnlocked: boolean;
  isSelected?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const CharacterVisual: React.FC<CharacterVisualProps> = ({
  characterId,
  isUnlocked,
  isSelected = false,
  className = '',
  size = 'hero'
}) => {
  // Map to isolated transparent PNG character assets
  const getImageSource = (id: ExplorerCharacterId) => {
    switch (id) {
      case 'curious_explorer':
        return maxiPng;
      case 'nature_explorer':
        return mayaPng;
      case 'forest_fawn':
        return lumiPng;
      default:
        return null;
    }
  };

  const isMysteryLocked = !isUnlocked;
  const imageSrc = getImageSource(characterId);

  // Height and scale profiles for various screen contexts
  const containerClasses = {
    sm: 'h-28 max-h-28 w-24',
    md: 'h-44 max-h-44 w-36',
    lg: 'h-56 max-h-60 sm:h-64 sm:max-h-72 w-full max-w-[220px]',
    hero: 'h-[200px] max-h-[220px] sm:h-[260px] sm:max-h-[300px] md:h-[320px] md:max-h-[360px] lg:h-[350px] lg:max-h-[400px] w-full max-w-[280px]'
  };

  if (isMysteryLocked || !imageSrc) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center select-none ${containerClasses[size]} ${className}`}
      >
        {/* Soft magical mystery aura */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-t from-amber-200/50 via-stone-300/30 to-transparent blur-md -z-10" />

        <svg
          viewBox="0 0 200 240"
          className="w-full h-full drop-shadow-md overflow-visible opacity-60 transition-transform duration-300 hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="locked-halo-glow-3d" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#E2E8F0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Glowing Aura Circle */}
          <circle cx="100" cy="115" r="82" fill="url(#locked-halo-glow-3d)" />

          {/* Standalone Mystery Silhouette */}
          <g id="mystery-silhouette">
            <circle cx="100" cy="72" r="30" fill="#475569" opacity="0.6" />
            {/* Hair / tuft silhouette */}
            <path d="M 72 62 C 58 38 46 24 54 48 C 62 62 74 72 78 74 Z" fill="#475569" opacity="0.55" />
            <path d="M 128 62 C 142 38 154 24 146 48 C 138 62 126 72 122 74 Z" fill="#475569" opacity="0.55" />
            {/* Torso & Coat Silhouette */}
            <path d="M 76 108 C 76 108 100 118 124 108 L 128 162 L 72 162 Z" fill="#475569" opacity="0.55" />
            {/* Legs Silhouette */}
            <rect x="80" y="162" width="14" height="34" rx="7" fill="#475569" opacity="0.5" />
            <rect x="106" y="162" width="14" height="34" rx="7" fill="#475569" opacity="0.5" />

            {/* Glowing Golden Lock Center */}
            <circle cx="100" cy="114" r="22" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
            <rect x="90" y="111" width="20" height="15" rx="3.5" fill="#D97706" />
            <path d="M 94.5 111 V 105 C 94.5 101.5 105.5 101.5 105.5 105 V 111" stroke="#D97706" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="117" r="2" fill="#FFFFFF" />
            <path d="M 100 117 L 100 121" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
          </g>

          {/* Ground Contact Shadow */}
          <ellipse cx="100" cy="204" rx="36" ry="6" fill="#1E293B" opacity="0.2" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-end select-none ${containerClasses[size]} ${className}`}
    >
      {/* Ground Contact Shadow - Grounds the standalone 3D character into Wonder Meadow */}
      <div
        className={`absolute bottom-0 w-3/4 h-3.5 rounded-[100%] bg-emerald-950/20 blur-[2.5px] transition-all duration-300 -z-10 ${
          isSelected ? 'w-4/5 h-4 bg-emerald-950/25 scale-105' : 'w-2/3 opacity-70'
        }`}
      />

      {/* Soft Ambient Environmental Light behind the character */}
      <div
        className={`absolute inset-0 rounded-full -z-10 transition-opacity duration-300 blur-md ${
          isSelected ? 'opacity-80 scale-105' : 'opacity-30 scale-95'
        }`}
        style={{
          background:
            characterId === 'curious_explorer'
              ? 'radial-gradient(circle at 50% 60%, rgba(134,239,172,0.6) 0%, rgba(220,252,231,0.2) 60%, transparent 80%)'
              : characterId === 'nature_explorer'
              ? 'radial-gradient(circle at 50% 60%, rgba(244,114,182,0.6) 0%, rgba(253,242,248,0.2) 60%, transparent 80%)'
              : 'radial-gradient(circle at 50% 60%, rgba(192,132,252,0.6) 0%, rgba(250,245,255,0.2) 60%, transparent 80%)'
        }}
      />

      {/* Standalone Transparent 3D Character Asset (Full-body, head to toe, no background box) */}
      <img
        src={imageSrc}
        alt={
          characterId === 'curious_explorer'
            ? 'Maxi the Explorer'
            : characterId === 'nature_explorer'
            ? 'Maya the Creative'
            : 'Lumi the Playful Meadow Friend'
        }
        referrerPolicy="no-referrer"
        className={`w-full h-full object-contain object-bottom transition-transform duration-300 ${
          isSelected
            ? 'scale-105 drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]'
            : 'scale-95 drop-shadow-md hover:scale-100 opacity-90 hover:opacity-100'
        }`}
        loading="eager"
      />
    </div>
  );
};
