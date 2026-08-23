import React from 'react';
import { Sparkles, Volume2, VolumeX, Shield } from 'lucide-react';
import { audioService } from '../../utils/audio';

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
  onToggleSound
}) => {
  return (
    <div
      id="wonder-meadow-welcome-screen"
      className="h-[100svh] min-h-[100svh] max-h-[100svh] w-full relative overflow-hidden bg-gradient-to-b from-[#BAE6FD] via-[#F0F9FF] to-[#D1FAE5] flex flex-col justify-between p-3 sm:p-5 md:p-6 select-none"
    >
      {/* Background Nature Elements - Environmental Sun placed far in upper-right sky completely separate from title */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft Golden Environmental Sun in far upper-right corner */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 md:top-8 md:right-16 w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-amber-300 via-amber-200 to-yellow-100 shadow-md opacity-85" />

        {/* Gentle Soft Clouds in sky */}
        <div className="absolute top-12 left-10 w-28 h-9 sm:w-36 sm:h-12 rounded-full bg-white/70 blur-[1px] hidden sm:block" />
        <div className="absolute top-20 right-48 w-20 h-7 rounded-full bg-white/60 blur-[1px] hidden md:block" />

        {/* Rolling Hills at bottom */}
        <div className="absolute -bottom-24 -left-12 w-[130%] h-60 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-[100%] opacity-75" />
        <div className="absolute -bottom-32 -right-12 w-[120%] h-64 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-[100%] opacity-85" />
      </div>

      {/* 1. TOP HEADER: Brand Badge on left, Sound & Parent Area on right */}
      <header className="relative z-20 w-full flex items-center justify-between gap-3 max-w-4xl mx-auto shrink-0">
        {/* Brand Badge */}
        <div className="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-2xl border border-amber-200 shadow-xs">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 text-white flex items-center justify-center text-sm shadow-2xs">
            🌱
          </div>
          <span className="font-display font-black text-slate-800 text-xs sm:text-sm tracking-tight">
            Wonder Meadow
          </span>
        </div>

        {/* Essential Controls: Sound Toggle & Parent Area */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            id="welcome-sound-toggle-btn"
            onClick={() => {
              onToggleSound();
              audioService.playPop();
            }}
            className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-2xl bg-white/95 hover:bg-white text-slate-700 border border-amber-200 shadow-xs flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 transition-all"
            title={soundEnabled ? 'Mute Sounds' : 'Turn On Sounds'}
            aria-label="Sound Settings"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
          </button>

          {/* Parent / Caregiver Area */}
          <button
            type="button"
            id="welcome-parent-area-btn"
            onClick={() => {
              audioService.playPop();
              onOpenParentArea();
            }}
            className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-2xl bg-white/95 hover:bg-white text-sky-900 border border-sky-200 shadow-xs flex items-center gap-1.5 sm:gap-2 text-xs font-display font-bold cursor-pointer active:scale-95 transition-all"
            title="Parents, Caregivers & Teachers"
            aria-label="Open Parent Area"
          >
            <Shield className="w-4 h-4 text-sky-700 shrink-0" />
            <span>Parent Area</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN HERO AREA: Single viewport centered stage */}
      <main className="relative z-20 w-full max-w-xl mx-auto my-auto text-center flex flex-col items-center justify-center px-4 py-2 sm:py-4">
        {/* Storybook Emblem */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-sky-400 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-3 border-white mb-3 sm:mb-4">
          🌱
        </div>

        {/* Premium Children's Adventure Title */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-amber-950 tracking-tight leading-tight uppercase drop-shadow-xs">
            WONDER MEADOW
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-700 font-semibold max-w-md leading-relaxed">
            A little world of wonder, learning, and adventure.
          </p>
        </div>

        {/* Primary PLAY Button */}
        <div className="mt-5 sm:mt-8">
          <button
            type="button"
            id="welcome-play-button"
            onClick={() => {
              audioService.playSparkle();
              onStartAdventure();
            }}
            className="h-14 sm:h-16 md:h-18 px-10 sm:px-14 md:px-16 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-display font-black text-lg sm:text-xl md:text-2xl shadow-xl hover:shadow-2xl border-3 border-white cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2.5 sm:gap-3 ring-4 ring-emerald-300/40"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-yellow-200" />
            <span>PLAY</span>
          </button>
        </div>
      </main>

      {/* 3. CLEAN BOTTOM FOOTER: 100% Kid Safe assurance */}
      <footer className="relative z-20 w-full max-w-xl mx-auto flex flex-col items-center justify-center gap-1 text-slate-600 text-[11px] sm:text-xs font-semibold shrink-0 pb-1">
        <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg opacity-80">
          <span>🌳</span>
          <span>🌼</span>
          <span>🦋</span>
          <span>🌷</span>
          <span>🌳</span>
        </div>
        <span>100% Ad-Free • Safe & Kind Early Learning Experience</span>
      </footer>
    </div>
  );
};
