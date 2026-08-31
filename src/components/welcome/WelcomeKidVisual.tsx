import React, { useState, useRef } from 'react';
import { Sparkles, Star, Heart } from 'lucide-react';
import { audioService } from '../../utils/audio';
import heroChildImg from '../../assets/characters/hero_child_idle.png';
import heroFallbackImg from '../../assets/images/hero_girl_meadow_dress_1788200061593.jpg';

interface WelcomeKidVisualProps {
  reducedMotion?: boolean;
  className?: string;
  onKidInteraction?: () => void;
}

/**
 * WelcomeKidVisual - 3D Rendered Hero Child Component
 *
 * Represents an authentic, joyful child with Down syndrome in Wonder Meadow,
 * sitting on a magical mossy pedestal with sunflowers and daisies.
 */
export const WelcomeKidVisual: React.FC<WelcomeKidVisualProps> = ({
  reducedMotion = false,
  className = '',
  onKidInteraction
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const lastSpokenRef = useRef<number>(0);

  const triggerCuteSpeech = (forceImmediate = false) => {
    const now = Date.now();
    if (!forceImmediate && now - lastSpokenRef.current < 3000) {
      return;
    }
    lastSpokenRef.current = now;
    setIsTalking(true);

    audioService.playSparkle();
    audioService.speakCuteAnimeChild("Hi! Welcome to Wonder Meadow! Let's explore together!", true, () => {
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
    }, 1200);
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
      aria-label="Friendly Wonder Meadow explorer child. Hover or click to say hello!"
      title="Hover or click to say hello!"
    >
      {/* 1. SOFT AMBIENT GROUND SHADOW */}
      <div className="absolute -bottom-2 sm:bottom-0 w-[80%] max-w-[280px] h-6 sm:h-8 -z-20 flex items-center justify-center pointer-events-none">
        <div
          className={`w-full h-full bg-emerald-950/20 rounded-[100%] blur-[6px] transition-all duration-500 ${
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
            <div className="absolute top-2 right-4 text-amber-400 opacity-90 animate-pulse">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 drop-shadow-xs" />
            </div>
            <div className="absolute bottom-16 left-2 text-emerald-400 opacity-80 animate-bounce duration-1000">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
        )}

        {/* 3. HERO CHILD 3D ILLUSTRATION */}
        <div
          className={`relative max-h-full max-w-full flex items-center justify-center transition-transform duration-300 ${
            isTapped ? 'scale-105 rotate-1' : isHovered ? 'scale-103' : 'scale-100'
          }`}
        >
          <img
            src={heroChildImg}
            onError={(e) => {
              // Fallback to secondary render
              (e.target as HTMLImageElement).src = heroFallbackImg;
            }}
            alt="Joyful 3D child explorer with Down syndrome in Wonder Meadow"
            className="w-auto h-[220px] xs:h-[250px] sm:h-[300px] md:h-[350px] object-contain filter drop-shadow-[0_12px_24px_rgba(20,83,45,0.18)] pointer-events-none rounded-3xl"
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </div>

        {/* 4. INTERACTIVE REACTION PILL */}
        <div
          className={`mt-1.5 px-3.5 py-1 rounded-full bg-white/95 border border-emerald-200 text-stone-800 shadow-sm flex items-center gap-1.5 transition-all duration-300 ${
            isTalking ? 'scale-105 border-emerald-400 ring-2 ring-emerald-300' : 'opacity-90'
          }`}
        >
          <span className="text-emerald-500 text-xs">✨</span>
          <span className="font-sans font-bold text-xs text-stone-800 whitespace-nowrap">
            {isTalking ? "Let's explore together!" : 'Tap me to say hello!'}
          </span>
          {isTapped && <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-ping ml-0.5" />}
        </div>
      </div>
    </div>
  );
};
