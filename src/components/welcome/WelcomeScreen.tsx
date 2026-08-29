import React from 'react';
import { Sparkles, Shield, Volume2, VolumeX } from 'lucide-react';
import { audioService } from '../../utils/audio';
import { WelcomeKidVisual } from './WelcomeKidVisual';

interface WelcomeScreenProps {
  onStartAdventure: () => void;
  onOpenParentArea: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  reducedMotion?: boolean;
  onToggleReducedMotion?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartAdventure,
  onOpenParentArea,
  soundEnabled,
  onToggleSound,
  reducedMotion = false
}) => {
  return (
    <div
      id="wonder-meadow-welcome-screen"
      className="relative w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden select-none bg-gradient-to-b from-[#E0F2FE] via-[#FFFDF5] to-[#F1F8F5] px-3 sm:px-6 md:px-8 py-3 sm:py-4"
    >
      {/* ========================================================================= */}
      {/* 1. LIVING MEADOW & SKY ENVIRONMENT (Background only, 0 collision risk)   */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft Multi-Tier Rolling Meadow Hills */}
        <svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 left-0 right-0 w-full h-[20vh] min-h-[80px] max-h-[140px] object-cover pointer-events-none opacity-80"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,150 C360,100 680,200 1020,130 C1240,85 1380,140 1440,120 L1440,320 L0,320 Z"
            fill="#E0F2FE"
            fillOpacity="0.4"
          />
          <path
            d="M0,185 C320,145 560,225 880,170 C1140,125 1320,195 1440,165 L1440,320 L0,320 Z"
            fill="#BBF7D0"
            fillOpacity="0.5"
          />
          <path
            d="M0,235 C340,195 620,265 940,215 C1200,175 1360,235 1440,220 L1440,320 L0,320 Z"
            fill="#86EFAC"
            fillOpacity="0.45"
          />
        </svg>

        {/* Floating Living Butterflies in the Meadow Atmosphere */}
        {!reducedMotion && (
          <>
            <div className="absolute top-[16%] left-[10%] animate-butterfly-1 opacity-75">
              <span className="text-base sm:text-xl filter drop-shadow-xs">🦋</span>
            </div>
            <div className="absolute top-[32%] right-[12%] animate-butterfly-2 opacity-70">
              <span className="text-sm sm:text-lg filter drop-shadow-xs">🦋</span>
            </div>
            <div className="absolute top-[50%] left-[22%] animate-butterfly-1 opacity-60">
              <span className="text-xs sm:text-sm filter drop-shadow-xs">✨</span>
            </div>
          </>
        )}

        {/* Warm Ground Horizon Light Bloom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-emerald-100/35 via-amber-50/20 to-transparent" />
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP NAVIGATION: DEDICATED FIXED ZONE (Clear separation from Hero)       */}
      {/* ========================================================================= */}
      <header className="relative z-30 w-full max-w-6xl mx-auto flex items-center justify-between gap-3 shrink-0 pb-2 sm:pb-3 border-b border-stone-200/40">
        {/* Top Left: Animated Living Sun & Wonder Meadow Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Continuous Moving Sun (Rotates slowly, breathes, bobs smoothly) */}
          <div
            id="welcome-living-sun"
            onClick={() => {
              audioService.playSparkle();
            }}
            className={`relative w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 flex items-center justify-center shrink-0 cursor-pointer group ${
              reducedMotion ? '' : 'animate-sun-bob'
            }`}
            role="button"
            tabIndex={0}
            aria-label="Bright smiling Wonder Meadow Sun"
            title="Click the smiling sun!"
          >
            {/* Warm Atmospheric Glowing Halo */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/50 via-yellow-200/35 to-transparent blur-md ${
                reducedMotion ? '' : 'animate-sun-glow-breathe'
              }`}
            />

            {/* Outer Slow Continuously Rotating Rays (16s smooth loop) */}
            <svg
              viewBox="0 0 100 100"
              className={`absolute inset-0 w-full h-full text-amber-400/80 drop-shadow-xs ${
                reducedMotion ? '' : 'animate-sun-spin-slow'
              }`}
              fill="currentColor"
            >
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <polygon
                  key={deg}
                  points="50,4 46,15 54,15"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </svg>

            {/* Inner Counter-Spinning Secondary Soft Beams (22s loop) */}
            <svg
              viewBox="0 0 100 100"
              className={`absolute inset-0 w-full h-full text-yellow-300/60 ${
                reducedMotion ? '' : 'animate-sun-counter-spin'
              }`}
              fill="currentColor"
            >
              {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg) => (
                <polygon
                  key={deg}
                  points="50,9 47,17 53,17"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </svg>

            {/* Cheerful Golden Sun Core */}
            <div className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-yellow-200 via-amber-300 to-amber-400 shadow-md border-2 border-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-xs sm:text-sm select-none">☀️</span>
            </div>
          </div>

          {/* Wonder Meadow Branding Logo Text */}
          <div className="flex flex-col">
            <span className="font-sans font-black text-sm sm:text-base md:text-lg text-stone-900 tracking-tight leading-none">
              Wonder<span className="text-amber-500">Meadow</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 tracking-wider uppercase opacity-85">
              Kids Adventure
            </span>
          </div>
        </div>

        {/* Top Right: Sound & Parents Controls (Clean, Protected Top Sanctuary) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Sound Toggle */}
          <button
            type="button"
            id="welcome-sound-toggle-btn"
            onClick={() => {
              onToggleSound();
              audioService.playPop();
            }}
            className="min-h-[38px] h-9 sm:h-10 px-3 sm:px-3.5 rounded-full bg-white/95 hover:bg-white text-stone-700 border border-stone-200/90 shadow-xs hover:shadow-sm flex items-center justify-center gap-1.5 text-xs sm:text-sm font-sans font-bold cursor-pointer active:scale-95 transition-all focus-visible:ring-3 focus-visible:ring-amber-400"
            title={soundEnabled ? 'Mute audio' : 'Turn on audio'}
            aria-label={soundEnabled ? 'Sound is on. Click to mute' : 'Sound is off. Click to turn on'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 shrink-0" />
            )}
            <span className="hidden sm:inline font-sans">{soundEnabled ? 'Sound' : 'Muted'}</span>
          </button>

          {/* Parents Area Access Button */}
          <button
            type="button"
            id="welcome-parent-area-btn"
            onClick={() => {
              audioService.playPop();
              onOpenParentArea();
            }}
            className="min-h-[38px] h-9 sm:h-10 px-3.5 sm:px-4 rounded-full bg-white/95 hover:bg-white text-stone-800 hover:text-stone-950 border border-stone-200/90 shadow-xs hover:shadow-sm flex items-center gap-1.5 text-xs sm:text-sm font-sans font-bold cursor-pointer active:scale-95 transition-all focus-visible:ring-3 focus-visible:ring-amber-400"
            title="Parents Area (Settings & Progress)"
            aria-label="Open Parents Area"
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
            <span className="font-sans font-extrabold tracking-wide">Parents</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. HERO CONTENT: GUARANTEED BELOW HEADER WITH AMPLE VERTICAL BUFFER       */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-auto flex-1 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 sm:gap-8 lg:gap-12 pt-3 sm:pt-6 pb-2 min-h-0">
        
        {/* LEFT COLUMN: TITLE, INVITATION SUBTITLE, PRIMARY "LET'S EXPLORE" BUTTON */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left self-center shrink-0 max-w-md lg:max-w-xl">
          
          {/* Main Title: WONDER MEADOW (Crisp, High-Contrast Typography) */}
          <h1
            id="wonder-meadow-main-title"
            className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06] text-stone-900 drop-shadow-xs font-sans mb-2 sm:mb-3"
          >
            WONDER <span className="text-amber-500">MEADOW</span>
          </h1>

          {/* Warm Kid-Friendly Subtitle */}
          <p className="text-xs xs:text-sm sm:text-base md:text-lg text-stone-700 font-medium max-w-sm sm:max-w-md mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
            A magical world of playful discovery, friendly animal buddies, and joyful adventures!
          </p>

          {/* Primary Action Button: "Let's Explore" */}
          <div className="w-full flex justify-center md:justify-start">
            <button
              type="button"
              id="welcome-start-adventure-btn"
              onClick={() => {
                audioService.playSparkle();
                onStartAdventure();
              }}
              className="group relative w-full sm:w-auto min-w-[240px] xs:min-w-[260px] sm:min-w-[290px] min-h-[52px] xs:min-h-[56px] sm:min-h-[62px] px-8 sm:px-10 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:via-amber-400 hover:to-orange-400 text-amber-950 font-black text-lg xs:text-xl sm:text-2xl tracking-wide shadow-[0_8px_24px_rgba(245,158,11,0.38)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.5)] active:scale-98 transition-all duration-200 border-2 border-white flex items-center justify-center gap-3 cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-300"
              aria-label="Let's Explore Wonder Meadow"
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900 group-hover:rotate-12 transition-transform duration-300 shrink-0" />
              <span className="font-sans font-black whitespace-nowrap">Let's Explore</span>
              <span className="text-base sm:text-lg group-hover:scale-125 transition-transform">🎒</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D FLOATING ISLAND WITH ANIME EXPLORER (ANCHORED IN LOWER HALF) */}
        <div className="w-full md:w-1/2 flex items-end justify-center md:justify-end self-end shrink-0 min-h-0">
          <div className="relative w-full max-w-[250px] xs:max-w-[280px] sm:max-w-[340px] md:max-w-[390px] lg:max-w-[440px] h-[210px] xs:h-[240px] sm:h-[300px] md:h-[350px] lg:h-[390px] flex items-end justify-center">
            <WelcomeKidVisual
              reducedMotion={reducedMotion}
              className="w-full h-full"
            />
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. CLEAN BOTTOM FOOTER                                                     */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-center text-stone-500 text-[11px] sm:text-xs font-semibold shrink-0 py-0.5 sm:py-1 text-center">
        <span className="opacity-80">🌸 Safe, gentle, and ad-free play for curious young minds</span>
      </footer>
    </div>
  );
};
