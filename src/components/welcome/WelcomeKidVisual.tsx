import React, { useState, useRef } from 'react';
import { Sparkles, Star, Heart, Volume2 } from 'lucide-react';
import { audioService } from '../../utils/audio';
import heroPng from '../../assets/images/wonder_meadow_child_hero.png';
import heroJpg from '../../assets/images/wonder_meadow_child_explorer_1788022932042.jpg';

interface WelcomeKidVisualProps {
  reducedMotion?: boolean;
  className?: string;
  onKidInteraction?: () => void;
}

export const WelcomeKidVisual: React.FC<WelcomeKidVisualProps> = ({
  reducedMotion = false,
  className = '',
  onKidInteraction
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const lastSpokenRef = useRef<number>(0);

  // Speaks in a polite, cute anime/cartoon child voice
  const triggerCuteSpeech = (forceImmediate = false) => {
    const now = Date.now();
    // 3 second debounce unless forced
    if (!forceImmediate && now - lastSpokenRef.current < 3200) {
      return;
    }
    lastSpokenRef.current = now;
    setIsTalking(true);

    // Play sparkling chime and polite cute anime voice
    audioService.playSparkle();
    audioService.speakCuteAnimeChild("Hey, let's explore!", true, () => {
      setIsTalking(false);
    });

    if (onKidInteraction) {
      onKidInteraction();
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    triggerCuteSpeech(false);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    setIsTapped(true);
    triggerCuteSpeech(true);
    setTimeout(() => {
      setIsTapped(false);
    }, 1000);
  };

  return (
    <div
      id="welcome-hero-character-stage"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full flex flex-col items-center justify-end select-none cursor-pointer group ${className}`}
      role="button"
      tabIndex={0}
      aria-label="Friendly Wonder Meadow explorer child. Hover or click to hear: Hey, let's explore!"
      title="Hover or click: 'Hey, let's explore!'"
    >
      {/* 1. SOFT AMBIENT GROUND SHADOW (Anchors the 3D floating island) */}
      <div className="absolute -bottom-2 sm:bottom-0 w-[80%] max-w-[280px] h-6 sm:h-8 -z-20 flex items-center justify-center pointer-events-none">
        <div
          className={`w-full h-full bg-stone-900/25 rounded-[100%] blur-[4px] transition-all duration-500 ${
            reducedMotion ? 'opacity-20 scale-100' : 'animate-hero-shadow'
          }`}
        />
      </div>

      {/* 2. LEVITATING 3D ISLAND + CHARACTER ENSEMBLE */}
      <div
        className={`relative z-10 w-full h-full flex flex-col items-center justify-end ${
          reducedMotion ? '' : 'animate-island-float'
        }`}
      >
        {/* Soft Warm Atmospheric Backlight Aura */}
        <div
          className={`absolute inset-x-4 top-4 bottom-12 rounded-full bg-gradient-to-tr from-amber-200/40 via-yellow-100/35 to-emerald-100/25 blur-xl -z-10 transition-all duration-500 pointer-events-none ${
            isHovered || isTapped ? 'scale-115 opacity-90' : 'scale-100 opacity-60'
          }`}
        />

        {/* Floating Magical Stars and Particle Accents */}
        {!reducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-visible -z-5">
            {/* Golden Star Top Right */}
            <div className="absolute top-2 right-4 text-amber-400 opacity-90 animate-pulse">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 drop-shadow-xs" />
            </div>
            {/* Sparkle Left */}
            <div className="absolute top-1/4 left-2 text-amber-300 opacity-90 animate-pulse delay-500">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-300 drop-shadow-xs" />
            </div>
            {/* Active Celebration Bursts */}
            {(isTapped || isHovered || isTalking) && (
              <>
                <div className="absolute top-0 left-1/3 text-pink-400 animate-bounce">
                  <Heart className="w-5 h-5 fill-pink-400 drop-shadow-sm" />
                </div>
                <div className="absolute top-4 right-1/4 text-yellow-400 animate-pulse">
                  <Sparkles className="w-5 h-5 fill-yellow-300 drop-shadow-sm" />
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. 3D ANIME EXPLORER CHILD CHARACTER WITH CONTINUOUS IDLE MOTION */}
        <div
          className={`relative z-10 w-full flex-1 max-h-[calc(100%-24px)] flex items-end justify-center transition-transform duration-300 ${
            isTapped
              ? 'scale-108 -translate-y-3'
              : isHovered
              ? 'scale-103 -translate-y-1'
              : ''
          }`}
        >
          <img
            src={heroPng}
            onError={(e) => {
              e.currentTarget.src = heroJpg;
            }}
            alt="Friendly anime explorer child ready for adventure in Wonder Meadow"
            referrerPolicy="no-referrer"
            className={`w-full h-full max-h-full object-contain object-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)] transition-all duration-300 ${
              reducedMotion ? '' : 'animate-hero-idle'
            }`}
            loading="eager"
            style={{
              transformOrigin: 'bottom center'
            }}
          />
        </div>

        {/* 4. 3D MEADOW PEDESTAL / FLOATING ISLAND BASE */}
        <div
          className="relative z-0 w-[84%] max-w-[260px] h-8 sm:h-10 mt-[-10px] shrink-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* 3D Earth / Soil Bottom Layer with Depth Bevel */}
          <div className="absolute inset-x-0 bottom-0 h-6 sm:h-7 rounded-[100%] bg-gradient-to-b from-[#653E15] via-[#45270D] to-[#2B1805] shadow-[0_8px_16px_rgba(43,24,5,0.4)] border border-[#8B5A2B]/40" />

          {/* 3D Lush Green Grass Top Surface */}
          <div className="absolute inset-x-1 top-0 h-5 sm:h-6 rounded-[100%] bg-gradient-to-b from-[#86EFAC] via-[#22C55E] to-[#15803D] border-t-2 border-white/60 shadow-inner flex items-center justify-between px-4">
            {/* Cute Little Daisy Flower on Left */}
            <span className="text-[10px] sm:text-xs drop-shadow-xs -translate-y-1">🌼</span>
            {/* Clover / Sparkle in Middle */}
            <span className="text-[9px] sm:text-[10px] opacity-80 text-emerald-100 font-bold">☘️</span>
            {/* Cute Pink Blossom on Right */}
            <span className="text-[10px] sm:text-xs drop-shadow-xs -translate-y-1">🌸</span>
          </div>

          {/* Highlight Rim on Front Lip */}
          <div className="absolute inset-x-3 top-2.5 h-2 rounded-[100%] bg-emerald-400/40 blur-[1px]" />
        </div>

        {/* 5. "HI, LET'S EXPLORE!" SPEECH BADGE (Directly under/beside the character) */}
        <div
          className={`relative z-20 mt-1 sm:mt-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/95 hover:bg-white border-2 border-amber-300 text-stone-900 shadow-md flex items-center gap-1.5 transition-all duration-300 ${
            reducedMotion ? '' : 'animate-bubble-float'
          } ${isTalking || isTapped ? 'ring-4 ring-amber-400 scale-105' : 'group-hover:scale-105'}`}
        >
          <span className="text-amber-500 text-xs sm:text-sm">✨</span>
          <span className="font-sans font-black text-xs sm:text-sm text-stone-900 tracking-tight whitespace-nowrap">
            Hi, Let's Explore!
          </span>
          <span className="text-xs sm:text-sm">🎒</span>
          {isTalking && (
            <Volume2 className="w-3.5 h-3.5 text-amber-600 animate-pulse ml-0.5" />
          )}
        </div>
      </div>
    </div>
  );
};
