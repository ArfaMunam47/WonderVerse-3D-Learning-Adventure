import React from 'react';
import { ExplorerCharacterId } from '../../types';
import { Sparkles, Star } from 'lucide-react';
import maxiPng from '../../assets/characters/maxi.png';
import mayaPng from '../../assets/characters/maya.png';
import boltPng from '../../assets/characters/bolt.png';
import jojoPng from '../../assets/characters/jojo.png';

interface CharacterVisualProps {
  characterId: ExplorerCharacterId;
  isSelected?: boolean;
  isHovered?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'spotlight';
}

export const CharacterVisual: React.FC<CharacterVisualProps> = ({
  characterId,
  isSelected = false,
  isHovered = false,
  className = '',
  size = 'spotlight'
}) => {
  // Direct bundled transparent image asset mapping
  const getImageSrc = (id: ExplorerCharacterId): string => {
    switch (id) {
      case 'curious_explorer':
        return maxiPng; // 1st character: Maxi
      case 'nature_explorer':
        return mayaPng; // 2nd character: Maya
      case 'forest_fawn':
      case 'forest_friend':
      case 'magical_companion':
      case 'star_sprite':
        return boltPng; // 3rd character: Bolt the Robotic Kid (Transparent 3D cutout)
      case 'little_inventor':
      case 'tiny_inventor':
      case 'creative_dreamer':
      case 'little_artist':
      case 'little_adventurer':
      case 'adventurous_kid':
      default:
        return jojoPng; // 4th character: Jojo
    }
  };

  const getFallbackSrc = (id: ExplorerCharacterId): string => {
    switch (id) {
      case 'curious_explorer':
        return '/characters/maxi.png';
      case 'nature_explorer':
        return '/characters/maya.png';
      case 'forest_fawn':
      case 'forest_friend':
      case 'magical_companion':
      case 'star_sprite':
        return '/characters/bolt.png';
      case 'little_inventor':
      case 'tiny_inventor':
      default:
        return '/characters/jojo.png';
    }
  };

  const characterName =
    characterId === 'curious_explorer'
      ? 'Maxi'
      : characterId === 'nature_explorer'
      ? 'Maya'
      : characterId === 'forest_fawn'
      ? 'Bolt'
      : 'Jojo';

  const primarySrc = getImageSrc(characterId);
  const fallbackSrc = getFallbackSrc(characterId);

  // Responsive sizing presets that preserve full head-to-toe visibility without overflow
  const sizeClasses = {
    sm: 'h-16 w-14',
    md: 'h-24 w-20',
    lg: 'h-36 w-32',
    spotlight: 'h-[140px] xs:h-[160px] sm:h-[180px] md:h-[210px] lg:h-[230px] w-full max-w-[200px]',
    hero: 'h-[180px] xs:h-[210px] sm:h-[240px] md:h-[270px] w-full max-w-[240px]'
  };

  // Select dynamic movement animation style
  const animationClass = isSelected
    ? 'animate-character-active'
    : isHovered
    ? 'animate-character-wiggle'
    : 'animate-character-float';

  return (
    <div
      className={`relative flex flex-col items-center justify-end select-none pointer-events-none ${sizeClasses[size]} ${className}`}
    >
      {/* Floating Star / Sparkle Effects when Selected */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none overflow-visible -z-5">
          <div className="absolute -top-2 left-2 text-amber-400 animate-bounce duration-700">
            <Star className="w-4 h-4 fill-amber-400 drop-shadow-md" />
          </div>
          <div className="absolute top-1/4 -right-1 text-yellow-300 animate-pulse delay-200">
            <Sparkles className="w-4 h-4 fill-yellow-200 drop-shadow-md" />
          </div>
        </div>
      )}

      {/* 3D Character Transparent Cutout Image with Attention-Grabbing Movement */}
      <img
        src={primarySrc}
        alt={`${characterName} the Explorer`}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== fallbackSrc) {
            target.src = fallbackSrc;
          }
        }}
        className={`w-full h-full max-h-full object-contain object-bottom transition-all duration-300 ${animationClass} ${
          isSelected
            ? 'scale-105 drop-shadow-[0_10px_20px_rgba(0,0,0,0.22)]'
            : isHovered
            ? 'scale-102 drop-shadow-lg'
            : 'scale-95 drop-shadow-md opacity-95'
        }`}
        loading="eager"
        style={{
          transformOrigin: 'bottom center'
        }}
      />
    </div>
  );
};

