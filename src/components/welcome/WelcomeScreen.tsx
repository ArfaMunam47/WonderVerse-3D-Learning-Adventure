import React, { useState } from 'react';
import { Sparkles, Shield, Volume2, VolumeX, Eye, BookOpen, Compass, ArrowRight } from 'lucide-react';
import { audioService } from '../../utils/audio';
import { MeadowEnvironmentBackdrop } from './MeadowEnvironmentBackdrop';
import { HeroCharacterMeadow } from './HeroCharacterMeadow';

interface WelcomeScreenProps {
  onStartAdventure: () => void;
  onOpenParentArea: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  reducedMotion?: boolean;
  onToggleReducedMotion?: () => void;
}

/**
 * WelcomeScreen - Wonder Meadow
 *
 * UNIFIED DESIGN SYSTEM:
 * - 60% Warm Cream / Soft Ivory background (#FAF7F0)
 * - 25% Soft Sky Blue atmosphere (#DCEEF8, #EBF5FB)
 * - 10% Gentle Meadow Sage Green (#4A7C59, #5A8E67, #6C9E78)
 * - 5% Warm Sunshine Highlights (#F6C844, #FDE68A)
 * - Natural warm wood / charcoal text (#23272F)
 *
 * CLEAR HIERARCHY:
 * 1. Wonder Meadow Logo (spacious, high-contrast, no cloud overlap)
 * 2. Hero Character (alive with gentle breathing & welcoming voice)
 * 3. Primary "Start Exploring" CTA (meadow green theme, tactile & clear)
 * 4. Secondary Controls (Sound, Parents, Motion)
 * 5. Environment
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartAdventure,
  onOpenParentArea,
  soundEnabled,
  onToggleSound,
  reducedMotion = false,
  onToggleReducedMotion
}) => {
  const [isTalking, setIsTalking] = useState(false);

  return (
    <div
      id="wonder-meadow-welcome-screen"
      className="relative w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden select-none bg-[#FAF7F0] px-4 sm:px-6 md:px-8 py-3 sm:py-4"
    >
      {/* ========================================================================= */}
      {/* 1. SOFT MEADOW BACKDROP ENVIRONMENT (Minimal & Warm)                      */}
      {/* ========================================================================= */}
      <MeadowEnvironmentBackdrop reducedMotion={reducedMotion} />

      {/* ========================================================================= */}
      {/* 2. TOP HEADER: LOGO WITH BREATHING ROOM + SECONDARY CONTROLS             */}
      {/* ========================================================================= */}
      <header className="relative z-30 w-full max-w-5xl mx-auto flex items-center justify-between gap-3 shrink-0 pb-2 border-b border-[#E2E8F0]/70">
        {/* Brand Logo Mark */}
        <div className="flex items-center gap-2.5">
          <div
            id="welcome-brand-badge"
            onClick={() => audioService.playSparkle()}
            className="w-10 h-10 rounded-2xl bg-[#4A7C59] hover:bg-[#3D6849] text-[#FAF7F0] flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all duration-200"
            role="button"
            tabIndex={0}
            aria-label="Wonder Meadow Brand Badge"
            title="Wonder Meadow"
          >
            <Compass className="w-5 h-5 text-[#FAF7F0]" />
          </div>

          <div className="flex flex-col">
            <span className="font-display font-black text-lg sm:text-xl text-[#23272F] tracking-tight leading-none">
              Wonder<span className="text-[#4A7C59]">Meadow</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#525F72] tracking-wider uppercase">
              Joyful Learning World
            </span>
          </div>
        </div>

        {/* Top Right: Calm Mode, Sound, and Parent Area Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Calm Mode Toggle */}
          {onToggleReducedMotion && (
            <button
              type="button"
              id="welcome-motion-toggle-btn"
              onClick={() => {
                onToggleReducedMotion();
                audioService.playPop();
              }}
              className={`min-h-[38px] h-9 sm:h-10 px-3 rounded-2xl border shadow-xs flex items-center gap-1.5 text-xs font-sans font-bold cursor-pointer active:scale-95 transition-all duration-200 ${
                reducedMotion
                  ? 'bg-[#E2E8F0] text-[#1E293B] border-[#CBD5E1]'
                  : 'bg-white/90 text-[#475569] hover:bg-white border-[#E2E8F0]'
              }`}
              title={reducedMotion ? 'Calm motion active' : 'Turn on calm motion'}
              aria-label="Toggle calm motion mode"
            >
              <Eye className="w-3.5 h-3.5 text-[#525F72] shrink-0" />
              <span className="hidden md:inline">{reducedMotion ? 'Calm Mode' : 'Motion'}</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            id="welcome-sound-toggle-btn"
            onClick={() => {
              onToggleSound();
              audioService.playPop();
            }}
            className="min-h-[38px] h-9 sm:h-10 px-3 sm:px-3.5 rounded-2xl bg-white/90 hover:bg-white text-[#334155] border border-[#E2E8F0] shadow-xs flex items-center justify-center gap-1.5 text-xs sm:text-sm font-sans font-bold cursor-pointer active:scale-95 transition-all duration-200"
            title={soundEnabled ? 'Mute audio' : 'Turn on audio'}
            aria-label={soundEnabled ? 'Sound is on. Click to mute' : 'Sound is off. Click to turn on'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#4A7C59] shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#94A3B8] shrink-0" />
            )}
            <span className="hidden sm:inline font-sans">{soundEnabled ? 'Sound' : 'Muted'}</span>
          </button>

          {/* Parents Area Button */}
          <button
            type="button"
            id="welcome-parent-area-btn"
            onClick={() => {
              audioService.playPop();
              onOpenParentArea();
            }}
            className="min-h-[38px] h-9 sm:h-10 px-3.5 sm:px-4 rounded-2xl bg-white/90 hover:bg-white text-[#334155] border border-[#E2E8F0] shadow-xs flex items-center gap-1.5 text-xs sm:text-sm font-sans font-bold cursor-pointer active:scale-95 transition-all duration-200"
            title="Parents Area (Settings & Learning Progress)"
            aria-label="Open Parents Area"
          >
            <Shield className="w-4 h-4 text-[#4A7C59] shrink-0" />
            <span className="font-sans font-extrabold tracking-wide">Parents</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. HERO CONTENT: CHARACTER STAGE + START EXPLORING CTA                    */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-5xl mx-auto my-auto flex-1 flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-10 pt-2 pb-2 min-h-0">
        
        {/* LEFT COLUMN: TITLE, REASSURANCE & PRIMARY CALL TO ACTION */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left self-center shrink-0 max-w-md lg:max-w-lg">
          
          {/* Subtle Warm Community Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/85 border border-[#E2E8F0] text-[#334155] text-xs sm:text-sm font-bold mb-3 shadow-2xs backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#5A8E67]" />
            <span>Joyful Inclusive Learning World</span>
          </div>

          {/* Main Title */}
          <h1
            id="wonder-meadow-main-title"
            className="font-display text-3xl xs:text-4xl sm:text-5xl font-black tracking-tight leading-[1.08] text-[#23272F] mb-3"
          >
            Wonder <span className="text-[#4A7C59]">Meadow</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm xs:text-base sm:text-lg text-[#525F72] font-medium max-w-md mb-6 leading-relaxed">
            A gentle, joyful space designed for curiosity, friendship, and learning for children of all abilities.
          </p>

          {/* Primary Action Button: "Start Exploring" (Unified Meadow Green & Warm Cream) */}
          <div className="w-full flex flex-col items-center md:items-start gap-2.5">
            <button
              type="button"
              id="welcome-start-adventure-btn"
              onClick={() => {
                audioService.playSparkle();
                onStartAdventure();
              }}
              className="group relative w-full sm:w-auto min-w-[240px] xs:min-w-[260px] sm:min-w-[280px] min-h-[54px] xs:min-h-[58px] px-8 sm:px-10 rounded-3xl bg-gradient-to-r from-[#4A7C59] to-[#3D6849] hover:from-[#528A63] hover:to-[#447451] text-[#FAF7F0] font-extrabold text-lg sm:text-xl tracking-wide shadow-[0_6px_20px_rgba(74,124,89,0.28)] hover:shadow-[0_10px_26px_rgba(74,124,89,0.38)] active:scale-98 transition-all duration-200 border-2 border-[#81B08C]/40 flex items-center justify-center gap-3 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#81B08C]/40"
              aria-label="Start Exploring - Enter Wonder Meadow learning world"
            >
              <BookOpen className="w-5 h-5 text-[#FAF7F0] group-hover:scale-110 transition-transform" />
              <span className="font-display font-black text-[#FAF7F0] whitespace-nowrap">
                Start Exploring
              </span>
              <ArrowRight className="w-4 h-4 text-[#C2E0CC] group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Reassurance Label */}
            <div className="flex items-center gap-2 mt-1 text-xs text-[#525F72] font-semibold">
              <span>🌸 100% Ad-Free</span>
              <span>•</span>
              <span>💛 Safe & Inclusive</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVING APPROVED HERO CHARACTER ON MEADOW PLATFORM */}
        <div className="w-full md:w-1/2 flex items-center justify-center self-center shrink-0 min-h-0">
          <HeroCharacterMeadow
            reducedMotion={reducedMotion}
            className="w-full"
            onTalkingStateChange={setIsTalking}
          />
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. REASSURING FOOTER                                                      */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-center text-[#525F72] text-xs font-medium shrink-0 py-1 text-center">
        <span>Welcoming all children, with and without developmental differences</span>
      </footer>
    </div>
  );
};
