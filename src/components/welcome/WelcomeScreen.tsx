import React from 'react';
import { Sparkles, Shield, Volume2, VolumeX, Compass, Heart } from 'lucide-react';
import { audioService } from '../../utils/audio';
import { WelcomeCharacter3D } from './WelcomeCharacter3D';

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
      className="relative w-full min-h-[100dvh] flex flex-col justify-between overflow-x-hidden bg-gradient-to-b from-[#BAE6FD] via-[#F0FDF4] to-[#DCFCE7] select-none p-3 xs:p-4 sm:p-6 md:p-8 pt-[max(env(safe-area-inset-top),0.75rem)] pb-[max(env(safe-area-inset-bottom),0.75rem)]"
    >
      {/* ========================================================================= */}
      {/* 1. RESPONSIVE BACKGROUND ENVIRONMENT (Top-Left Sun & Rolling Hills)       */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft Golden Sun in Top-Left Sky */}
        <div
          className={`absolute top-2 left-2 sm:top-4 sm:left-6 md:top-6 md:left-8 flex items-center justify-center pointer-events-none z-0 ${
            reducedMotion ? '' : 'transition-transform duration-1000'
          }`}
        >
          {/* Subtle Sun Aura */}
          <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-amber-300/30 blur-lg sm:blur-xl absolute" />
          {/* Sun Core */}
          <div className="w-8 h-8 sm:w-14 sm:h-14 md:w-18 md:h-18 rounded-full bg-gradient-to-br from-yellow-100 via-amber-300 to-amber-400 shadow-xs sm:shadow-md border-2 border-yellow-100/80 relative flex items-center justify-center">
            <span className="text-xs sm:text-lg md:text-xl opacity-95">☀️</span>
          </div>
        </div>

        {/* Ambient Sky Cloud (Desktop / Tablet only) */}
        <div
          className={`absolute top-6 right-6 sm:top-10 sm:right-16 md:top-12 md:right-28 w-24 h-7 sm:w-36 sm:h-10 md:w-44 md:h-12 rounded-full bg-white/70 blur-[0.5px] shadow-xs hidden sm:block ${
            reducedMotion ? '' : 'animate-pulse'
          }`}
          style={{ animationDuration: '7s' }}
        />

        {/* Layered Rolling Hills at Bottom */}
        <div className="absolute -bottom-16 -left-10 w-[120%] h-40 sm:h-52 md:h-64 bg-gradient-to-t from-emerald-400/90 to-emerald-300/80 rounded-[100%] opacity-80 pointer-events-none" />
        <div className="absolute -bottom-24 -right-10 w-[115%] h-44 sm:h-56 md:h-72 bg-gradient-to-t from-teal-600/90 to-emerald-500/85 rounded-[100%] pointer-events-none" />

        {/* Ground Flowers (Hidden on small mobile viewports) */}
        <div className="absolute bottom-2 left-4 sm:bottom-4 sm:left-10 flex items-center gap-1.5 text-base sm:text-xl opacity-75 hidden sm:flex">
          <span>🌼</span>
          <span>🌱</span>
          <span>🌸</span>
        </div>
        <div className="absolute bottom-2 right-4 sm:bottom-4 sm:right-10 flex items-center gap-1.5 text-base sm:text-xl opacity-75 hidden sm:flex">
          <span>🦋</span>
          <span>🌷</span>
          <span>🌼</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP SAFE HEADER BAR                                                    */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-between gap-2 shrink-0">
        {/* Left Side: Safe World Indicator Badge */}
        <div className="pl-10 sm:pl-16 md:pl-20 flex items-center">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-200/80 shadow-xs">
            <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 fill-emerald-500 shrink-0" />
            <span className="font-display font-bold text-emerald-900 text-[10px] sm:text-xs tracking-wide whitespace-nowrap">
              Safe & Ad-Free
            </span>
          </div>
        </div>

        {/* Right Side: Sound Toggle & Parent Area */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Sound Toggle */}
          <button
            type="button"
            id="welcome-sound-toggle-btn"
            onClick={() => {
              onToggleSound();
              audioService.playPop();
            }}
            className="min-h-[40px] h-10 w-10 sm:w-auto sm:px-3 rounded-2xl bg-white/95 hover:bg-white text-slate-700 border border-slate-200/90 shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 text-xs font-display font-bold cursor-pointer active:scale-95 transition-all focus-visible:ring-3 focus-visible:ring-emerald-400"
            title={soundEnabled ? 'Turn Sound Off' : 'Turn Sound On'}
            aria-label={soundEnabled ? 'Sound is on. Click to mute' : 'Sound is off. Click to turn on'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span className="hidden md:inline whitespace-nowrap">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
          </button>

          {/* Parent Area Button */}
          <button
            type="button"
            id="welcome-parent-area-btn"
            onClick={() => {
              audioService.playPop();
              onOpenParentArea();
            }}
            className="min-h-[40px] h-10 px-2.5 sm:px-3.5 rounded-2xl bg-white/95 hover:bg-white text-sky-900 border border-sky-200 shadow-xs hover:shadow-md flex items-center gap-1 text-xs font-display font-bold cursor-pointer active:scale-95 transition-all focus-visible:ring-3 focus-visible:ring-sky-400"
            title="Parent & Caregiver Area"
            aria-label="Open Parent and Caregiver Dashboard"
          >
            <Shield className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span className="whitespace-nowrap">Parent Area</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. HERO CONTENT STAGE (Mobile-First Hierarchy & Desktop 2-Column Split)    */}
      {/* ========================================================================= */}
      <main className="relative z-20 w-full max-w-6xl mx-auto my-auto flex-1 flex flex-col lg:flex-row items-center justify-center gap-3 sm:gap-6 lg:gap-12 py-2 sm:py-4 px-1 sm:px-4">
        
        {/* BRAND IDENTITY & INTRO TEXT */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left max-w-md lg:max-w-xl">
          {/* Brand Tagline */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-white/90 border border-amber-200/90 shadow-xs mb-1 sm:mb-2.5">
            <span className="text-xs sm:text-sm">🌿</span>
            <span className="text-[10px] sm:text-xs font-display font-bold text-amber-950 tracking-wider uppercase whitespace-nowrap">
              Early Learning Adventure
            </span>
          </div>

          {/* Wonder Meadow Main Title */}
          <h1
            id="wonder-meadow-main-title"
            className="text-[clamp(1.75rem,5.5vw,3.75rem)] font-display font-black text-[#1E3A1E] tracking-tight leading-[1.08] mb-1 sm:mb-2.5 drop-shadow-xs"
          >
            WONDER <span className="text-emerald-700">MEADOW</span>
          </h1>

          {/* Short Welcoming Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-slate-700 font-medium max-w-sm lg:max-w-md mb-2 sm:mb-4 leading-snug px-1 sm:px-0">
            A safe, playful world where children can explore, discover, and learn at their own gentle pace.
          </p>

          {/* DESKTOP-ONLY ACTIONS (Kept inside left column for desktop viewports) */}
          <div className="hidden lg:flex w-full flex-row items-center gap-3 mt-4">
            <button
              type="button"
              id="welcome-start-adventure-btn-desktop"
              onClick={() => {
                audioService.playSparkle();
                onStartAdventure();
              }}
              className="min-h-[56px] px-8 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-display font-black text-lg shadow-lg hover:shadow-xl border-2 border-white cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2.5 ring-4 ring-emerald-300/40 focus-visible:ring-emerald-500"
              aria-label="Let's Explore Wonder Meadow"
            >
              <Sparkles className="w-5 h-5 fill-white text-yellow-200 shrink-0" />
              <span className="whitespace-nowrap">Let's Explore</span>
            </button>

            <button
              type="button"
              id="welcome-caregiver-secondary-btn-desktop"
              onClick={() => {
                audioService.playPop();
                onOpenParentArea();
              }}
              className="min-h-[48px] px-5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-sky-950 font-display font-bold text-sm border border-slate-300 shadow-xs hover:shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 focus-visible:ring-3 focus-visible:ring-sky-400"
              aria-label="Parent & Caregiver Area"
            >
              <Shield className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="whitespace-nowrap">Parent / Caregiver</span>
            </button>
          </div>
        </div>

        {/* 3D CHARACTER VIGNETTE (Centered on Mobile, Right Column on Desktop) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center my-1 sm:my-2 lg:my-0 shrink-0">
          <div className="relative w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-68 md:h-68 lg:w-84 lg:h-84 flex items-center justify-center max-w-full">
            {/* Soft Ambient Backdrop Halo */}
            <div className="absolute inset-0 rounded-full bg-white/65 backdrop-blur-xs border-2 sm:border-4 border-white shadow-md sm:shadow-lg flex items-center justify-center" />

            {/* Original 3D Character Mascot: Pip */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
              <WelcomeCharacter3D
                reducedMotion={reducedMotion}
                className="w-full h-full"
              />
            </div>

            {/* Contextual Zone Emblems (Desktop only to prevent mobile clutter) */}
            <div
              className="hidden lg:flex absolute top-2 left-2 w-10 h-10 rounded-2xl bg-white shadow-md border border-amber-200 items-center justify-center text-lg"
              title="Alphabet Forest"
              aria-hidden="true"
            >
              🔤
            </div>
            <div
              className="hidden lg:flex absolute top-3 right-2 w-10 h-10 rounded-2xl bg-white shadow-md border border-sky-200 items-center justify-center text-lg"
              title="Number Garden"
              aria-hidden="true"
            >
              🔢
            </div>
            <div
              className="hidden lg:flex absolute bottom-3 left-3 w-10 h-10 rounded-2xl bg-white shadow-md border border-emerald-200 items-center justify-center text-lg"
              title="Music Meadow"
              aria-hidden="true"
            >
              🎵
            </div>
            <div
              className="hidden lg:flex absolute bottom-3 right-3 w-10 h-10 rounded-2xl bg-white shadow-md border border-pink-200 items-center justify-center text-lg"
              title="Story Tree"
              aria-hidden="true"
            >
              📖
            </div>
          </div>
        </div>

        {/* MOBILE ACTIONS (Clean vertical stack right under the character) */}
        <div className="w-full flex lg:hidden flex-col items-center gap-2.5 max-w-xs sm:max-w-sm mt-1 sm:mt-2">
          {/* Primary Action: Let's Explore */}
          <button
            type="button"
            id="welcome-start-adventure-btn-mobile"
            onClick={() => {
              audioService.playSparkle();
              onStartAdventure();
            }}
            className="w-full min-h-[52px] sm:min-h-[56px] px-6 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-display font-black text-base sm:text-lg shadow-md hover:shadow-lg border-2 border-white cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 ring-4 ring-emerald-300/40 focus-visible:ring-emerald-500"
            aria-label="Let's Explore Wonder Meadow"
          >
            <Sparkles className="w-5 h-5 fill-white text-yellow-200 shrink-0" />
            <span className="whitespace-nowrap">Let's Explore</span>
          </button>

          {/* Secondary Action: Parent / Caregiver */}
          <button
            type="button"
            id="welcome-caregiver-secondary-btn-mobile"
            onClick={() => {
              audioService.playPop();
              onOpenParentArea();
            }}
            className="w-full min-h-[44px] sm:min-h-[48px] px-4 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-sky-950 font-display font-bold text-xs sm:text-sm border border-slate-300 shadow-xs hover:shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 focus-visible:ring-3 focus-visible:ring-sky-400"
            aria-label="Parent and Caregiver Dashboard"
          >
            <Shield className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="whitespace-nowrap">Parent / Caregiver</span>
          </button>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. RESPONSIVE FOOTER (Compact Single Line)                                */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-center text-slate-600 text-[11px] sm:text-xs font-medium shrink-0 pt-2 border-t border-emerald-900/10 text-center">
        <span>Designed for children of all abilities 🌸</span>
      </footer>
    </div>
  );
};
