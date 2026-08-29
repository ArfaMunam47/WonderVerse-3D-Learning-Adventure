import React from 'react';
import { ExplorerCharacterId } from '../../types';
import { CharacterVisual } from './CharacterVisual';
import { Check } from 'lucide-react';

interface CharacterPodium3DProps {
  characterId: ExplorerCharacterId;
  name: string;
  personality: string;
  themeColor: string;
  accentColor: string;
  badgeEmoji: string;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const CharacterPodium3D: React.FC<CharacterPodium3DProps> = ({
  characterId,
  name,
  personality,
  themeColor,
  accentColor,
  badgeEmoji,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <button
      id={`companion-card-${characterId}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-pressed={isSelected}
      className={`group relative flex flex-col items-center justify-end w-full max-w-[260px] focus:outline-none transition-all duration-300 rounded-3xl p-1.5 sm:p-2 cursor-pointer ${
        isSelected
          ? 'scale-105 z-20'
          : 'opacity-90 hover:opacity-100 hover:scale-102 z-10'
      }`}
    >
      {/* 3D STAGE & CHARACTER CONTAINER */}
      <div className="relative w-full flex flex-col items-center justify-end min-h-[150px] xs:min-h-[175px] sm:min-h-[210px] md:min-h-[240px] lg:min-h-[270px]">
        {/* Ambient Aura & Light Beam when Selected */}
        <div
          className={`absolute inset-x-0 bottom-4 top-10 rounded-full transition-all duration-500 blur-2xl -z-30 pointer-events-none ${
            isSelected
              ? 'opacity-80 scale-110'
              : isHovered
              ? 'opacity-40 scale-100'
              : 'opacity-0 scale-90'
          }`}
          style={{
            background: `radial-gradient(ellipse at 50% 80%, ${themeColor} 0%, rgba(255,255,255,0.4) 40%, transparent 75%)`
          }}
        />

        {/* Selected Checkmark Badge (Top Right) */}
        {isSelected && (
          <div
            className="absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg text-white ring-2 ring-white z-30 animate-in zoom-in-50"
            style={{ backgroundColor: themeColor }}
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          </div>
        )}

        {/* CHARACTER STANDING PROUDLY ON TOP OF PODIUM */}
        <div className="relative z-10 mb-[-18px] sm:mb-[-22px] flex items-end justify-center w-full">
          <CharacterVisual
            characterId={characterId}
            isSelected={isSelected}
            isHovered={isHovered}
            size="spotlight"
            className="w-full"
          />
        </div>

        {/* =========================================================================
            3D ISOMETRIC CIRCULAR PODIUM / PEDESTAL STAGE (Below Character's Feet)
            ========================================================================= */}
        <div className="relative w-full max-w-[200px] sm:max-w-[220px] h-[48px] sm:h-[56px] flex items-center justify-center -z-10 mt-1">
          {/* 1. Deep Ground Cast Shadow under the 3D Podium */}
          <div
            className={`absolute bottom-0 w-[92%] h-[16px] sm:h-[18px] rounded-[100%] bg-emerald-950/25 blur-[4px] transition-all duration-300 ${
              isSelected ? 'w-[96%] bg-emerald-950/35 blur-[5px]' : 'w-[85%]'
            }`}
          />

          {/* 2. 3D Podium Isometric Stage (SVG Geometry with Top Disc, Bevel Cylinder Edge, and Glyphs) */}
          <svg
            viewBox="0 0 220 70"
            className="w-full h-full drop-shadow-md overflow-visible transition-transform duration-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Top Surface Gradient */}
              <radialGradient id={`podium-top-${characterId}`} cx="50%" cy="38%" r="55%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isSelected ? '1' : '0.95'} />
                <stop offset="65%" stopColor={isSelected ? '#FEF3C7' : '#F1F5F9'} stopOpacity="0.95" />
                <stop offset="100%" stopColor={isSelected ? '#FDE68A' : '#E2E8F0'} stopOpacity="1" />
              </radialGradient>

              {/* 3D Cylinder Edge Gradient (Creates round physical depth & shadow) */}
              <linearGradient id={`podium-edge-${characterId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="20%" stopColor={isSelected ? '#D97706' : '#CBD5E1'} />
                <stop offset="50%" stopColor={isSelected ? '#F59E0B' : '#E2E8F0'} />
                <stop offset="80%" stopColor={isSelected ? '#D97706' : '#94A3B8'} />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>

              {/* Glowing Rune Ring Gradient */}
              <linearGradient id={`rune-glow-${characterId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={themeColor} stopOpacity="0.7" />
                <stop offset="50%" stopColor={accentColor} stopOpacity="1" />
                <stop offset="100%" stopColor={themeColor} stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* A. 3D Cylinder Depth (Extruded height from y=24 to y=42) */}
            <path
              d="M 12 24 C 12 40 208 40 208 24 L 208 42 C 208 58 12 58 12 42 Z"
              fill={`url(#podium-edge-${characterId})`}
            />

            {/* B. Cylinder Bottom Bevel Ring */}
            <path
              d="M 12 42 C 12 58 208 58 208 42"
              stroke={isSelected ? '#B45309' : '#64748B'}
              strokeWidth="2.5"
              fill="none"
            />

            {/* C. 3D Cylinder Top Surface (Flat circular disk seen at isometric perspective) */}
            <ellipse
              cx="110"
              cy="24"
              rx="98"
              ry="21"
              fill={`url(#podium-top-${characterId})`}
              stroke={isSelected ? themeColor : '#CBD5E1'}
              strokeWidth={isSelected ? '3.5' : '2'}
            />

            {/* D. Inner Decorative Rune / Star Ring on Top of Podium */}
            <ellipse
              cx="110"
              cy="24"
              rx="78"
              ry="16"
              fill="none"
              stroke={isSelected ? `url(#rune-glow-${characterId})` : '#E2E8F0'}
              strokeWidth={isSelected ? '2' : '1.5'}
              strokeDasharray={isSelected ? '5 3' : 'none'}
            />

            {/* E. Center Golden Wonder Star Glyphs */}
            {isSelected && (
              <g transform="translate(110, 24) scale(0.9, 0.45)">
                <polygon
                  points="0,-18 5,-5 18,-5 8,4 12,18 0,9 -12,18 -8,4 -18,-5 -5,-5"
                  fill={accentColor}
                  opacity="0.85"
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* CHARACTER NAME & PERSONALITY BADGE */}
      <div className="mt-3 text-center transition-all duration-200">
        <div
          className={`font-black tracking-wider text-base sm:text-lg transition-colors font-sans ${
            isSelected ? 'text-stone-900 scale-105' : 'text-stone-700 group-hover:text-stone-900'
          }`}
        >
          {name}
        </div>
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 mt-0.5 rounded-full text-xs font-bold transition-all ${
            isSelected
              ? 'text-white shadow-xs'
              : 'bg-stone-200/80 text-stone-600 group-hover:bg-stone-300/80'
          }`}
          style={{
            backgroundColor: isSelected ? themeColor : undefined
          }}
        >
          <span>{badgeEmoji}</span>
          <span>{personality}</span>
        </div>
      </div>
    </button>
  );
};
