import React, { useState, useEffect } from 'react';
import { ExplorerCharacterId } from '../../types';
import maxiPng from '../../assets/characters/maxi.png';
import mayaPng from '../../assets/characters/maya.png';
import lumiPng from '../../assets/characters/lumi.png';
import maxiJpg from '../../assets/characters/maxi.jpg';
import mayaJpg from '../../assets/characters/maya.jpg';
import lumiJpg from '../../assets/characters/lumi.jpg';

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
  // Cascading sources for each character to ensure 100% reliable loading
  const getSourcesForCharacter = (id: ExplorerCharacterId): string[] => {
    switch (id) {
      case 'curious_explorer':
        return [maxiPng, '/characters/maxi.png', maxiJpg, '/characters/maxi.jpg'];
      case 'nature_explorer':
        return [mayaPng, '/characters/maya.png', mayaJpg, '/characters/maya.jpg'];
      case 'forest_fawn':
      case 'forest_friend':
      case 'magical_companion':
        return [lumiPng, '/characters/lumi.png', lumiJpg, '/characters/lumi.jpg'];
      default:
        return [];
    }
  };

  const [sourceIndex, setSourceIndex] = useState<number>(0);
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Reset index and load state whenever characterId changes
  useEffect(() => {
    setSourceIndex(0);
    setProcessedSrc(null);
    setIsLoaded(false);
  }, [characterId]);

  const sources = getSourcesForCharacter(characterId);
  const isMysteryLocked = !isUnlocked || sources.length === 0;
  const currentSrc = sources[sourceIndex] || '';

  // Transparent cutout processing to remove any white/off-white background
  useEffect(() => {
    if (!currentSrc || isMysteryLocked) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentSrc;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setProcessedSrc(currentSrc);
          setIsLoaded(true);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Auto remove background if near white
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Sample white background pixels
          if (r > 238 && g > 238 && b > 238) {
            const minVal = Math.min(r, g, b);
            if (minVal > 248) {
              data[i + 3] = 0; // 100% transparent
            } else {
              // Smooth feathering
              data[i + 3] = Math.round(((255 - minVal) / 10) * 255);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setProcessedSrc(canvas.toDataURL('image/png'));
        setIsLoaded(true);
      } catch {
        // Fallback to original image if crossOrigin or canvas error
        setProcessedSrc(currentSrc);
        setIsLoaded(true);
      }
    };
    img.onerror = () => {
      if (sourceIndex < sources.length - 1) {
        setSourceIndex((prev) => prev + 1);
      }
    };
  }, [currentSrc, isMysteryLocked, sourceIndex, sources.length]);

  // Fluid responsive heights that preserve aspect ratio and prevent collapsing
  const sizeClasses = {
    sm: 'h-20 w-16 min-h-[80px]',
    md: 'h-32 w-28 min-h-[128px]',
    lg: 'h-44 sm:h-52 md:h-60 lg:h-68 w-full max-w-[220px] min-h-[160px]',
    hero: 'h-[180px] xs:h-[220px] sm:h-[260px] md:h-[300px] lg:h-[340px] w-full max-w-[280px] min-h-[170px]'
  };

  // Render Mystery Friend Silhouette
  if (isMysteryLocked) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center select-none ${sizeClasses[size]} ${className}`}
      >
        {/* Soft Mystery Glowing Aura */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-t from-amber-200/40 via-purple-200/30 to-transparent blur-md -z-10" />

        <svg
          viewBox="0 0 200 240"
          className="w-full h-full max-h-full drop-shadow-md overflow-visible opacity-75 transition-transform duration-300 pointer-events-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="locked-halo-glow-svg" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#E2E8F0" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Halo Glow */}
          <circle cx="100" cy="115" r="82" fill="url(#locked-halo-glow-svg)" />

          {/* Mystery 3D Silhouette */}
          <g id="mystery-character-silhouette">
            <circle cx="100" cy="72" r="30" fill="#475569" opacity="0.65" />
            {/* Hair/accessories tufts */}
            <path d="M 72 62 C 58 38 46 24 54 48 C 62 62 74 72 78 74 Z" fill="#475569" opacity="0.6" />
            <path d="M 128 62 C 142 38 154 24 146 48 C 138 62 126 72 122 74 Z" fill="#475569" opacity="0.6" />
            {/* Torso & Coat */}
            <path d="M 76 108 C 76 108 100 118 124 108 L 128 162 L 72 162 Z" fill="#475569" opacity="0.6" />
            {/* Legs */}
            <rect x="80" y="162" width="14" height="34" rx="7" fill="#475569" opacity="0.55" />
            <rect x="106" y="162" width="14" height="34" rx="7" fill="#475569" opacity="0.55" />

            {/* Golden Star Lock */}
            <circle cx="100" cy="114" r="23" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
            <rect x="90" y="111" width="20" height="15" rx="3.5" fill="#D97706" />
            <path d="M 94.5 111 V 105 C 94.5 101.5 105.5 101.5 105.5 105 V 111" stroke="#D97706" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="117" r="2" fill="#FFFFFF" />
            <path d="M 100 117 L 100 121" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
          </g>

          {/* Ground Shadow */}
          <ellipse cx="100" cy="204" rx="36" ry="6" fill="#1E293B" opacity="0.25" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-end select-none ${sizeClasses[size]} ${className}`}
    >
      {/* Ground Contact Shadow - connects character to the meadow floor */}
      <div
        className={`absolute bottom-0 w-3/4 h-3.5 rounded-[100%] bg-emerald-950/20 blur-[2px] transition-all duration-300 -z-10 ${
          isSelected ? 'w-4/5 h-4 bg-emerald-950/25 scale-105' : 'w-2/3 opacity-70'
        }`}
      />

      {/* Environmental Colored Light Glow */}
      <div
        className={`absolute inset-0 rounded-full -z-10 transition-opacity duration-300 blur-md ${
          isSelected ? 'opacity-90 scale-105' : 'opacity-40 scale-95'
        }`}
        style={{
          background:
            characterId === 'curious_explorer'
              ? 'radial-gradient(circle at 50% 60%, rgba(134,239,172,0.7) 0%, rgba(220,252,231,0.2) 60%, transparent 80%)'
              : characterId === 'nature_explorer'
              ? 'radial-gradient(circle at 50% 60%, rgba(244,114,182,0.7) 0%, rgba(253,242,248,0.2) 60%, transparent 80%)'
              : 'radial-gradient(circle at 50% 60%, rgba(192,132,252,0.7) 0%, rgba(250,245,255,0.2) 60%, transparent 80%)'
        }}
      />

      {/* Shimmer skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-x-8 top-6 bottom-4 rounded-3xl bg-white/40 animate-pulse -z-10" />
      )}

      {/* Standalone Isolated 3D Character Image (Head-to-toe, no rectangle background) */}
      <img
        src={processedSrc || currentSrc}
        alt={
          characterId === 'curious_explorer'
            ? 'Maxi the Explorer'
            : characterId === 'nature_explorer'
            ? 'Maya the Creative'
            : 'Lumi the Joyful Explorer'
        }
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (sourceIndex < sources.length - 1) {
            setSourceIndex((prev) => prev + 1);
          }
        }}
        referrerPolicy="no-referrer"
        className={`w-full h-full max-h-full object-contain object-bottom pointer-events-none transition-all duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${
          isSelected
            ? 'scale-105 drop-shadow-[0_10px_20px_rgba(0,0,0,0.18)]'
            : 'scale-95 drop-shadow-md hover:scale-100 opacity-90'
        }`}
        loading="eager"
      />
    </div>
  );
};
