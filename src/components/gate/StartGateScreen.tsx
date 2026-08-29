import React, { useState } from 'react';
import { ExplorerCharacterId, UserProgress } from '../../types';
import { getCharacterById } from '../../data/charactersData';
import { CharacterVisual } from '../welcome/CharacterVisual';
import { audioService } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowLeft, BookOpen, Shield } from 'lucide-react';

interface StartGateScreenProps {
  characterId: ExplorerCharacterId;
  onEnterWorld: () => void;
  onBackToCharacterSelect: () => void;
  onOpenParentArea: () => void;
  progress?: UserProgress | null;
}

export const StartGateScreen: React.FC<StartGateScreenProps> = ({
  characterId,
  onEnterWorld,
  onBackToCharacterSelect,
  onOpenParentArea
}) => {
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const character = getCharacterById(characterId);

  const handleOpenGate = () => {
    if (isOpening) return;
    setIsOpening(true);
    audioService.playSparkle();
    audioService.playMusicalNote(5);

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.55 }
    });

    // Allow gate opening animation to play, then transition to 3D world
    setTimeout(() => {
      onEnterWorld();
    }, 1100);
  };

  return (
    <div
      id="wonder-meadow-2d-start-gate"
      className="relative w-full h-full min-h-screen overflow-hidden flex flex-col justify-between select-none bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-200"
    >
      {/* =========================================================================
          BACKGROUND ATMOSPHERE: SUN RAYS, LEAFY TREES, FLUTTERING BLOSSOMS
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Warm Sun & Golden Beams */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-amber-200/60 via-yellow-100/30 to-transparent blur-2xl" />

        {/* Floating Flower Petals / Pollen Sparkles */}
        <div className="absolute top-[20%] left-[10%] w-3 h-3 rounded-full bg-pink-300/80 animate-ping duration-1000" />
        <div className="absolute top-[35%] right-[12%] w-3.5 h-3.5 rounded-full bg-amber-300/80 animate-ping duration-700" />
        <div className="absolute top-[50%] left-[25%] w-2.5 h-2.5 rounded-full bg-yellow-200/90 animate-pulse" />

        {/* Distant Meadow & Rolling Hills Background */}
        <svg
          viewBox="0 0 1440 500"
          className="absolute bottom-0 left-0 right-0 w-full h-[55vh] object-cover opacity-75"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,220 C400,160 600,290 900,210 C1200,140 1350,260 1440,200 L1440,500 L0,500 Z"
            fill="#86EFAC"
            fillOpacity="0.6"
          />
          <path
            d="M0,280 C320,240 640,320 960,260 C1240,210 1380,300 1440,270 L1440,500 L0,500 Z"
            fill="#4ADE80"
            fillOpacity="0.8"
          />
          <path
            d="M0,340 C420,300 760,370 1100,320 C1300,290 1400,350 1440,330 L1440,500 L0,500 Z"
            fill="#22C55E"
          />
        </svg>

        {/* Cobblestone Starting Pathway leading up to the Gate */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[340px] sm:w-[480px] h-[280px] bg-gradient-to-t from-amber-200/90 via-amber-100/70 to-transparent rounded-t-[100%] blur-[1px] -z-10" />
      </div>

      {/* =========================================================================
          TOP NAV / ACTION BAR
          ========================================================================= */}
      <header className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 flex items-center justify-between z-30">
        <button
          id="back-to-companion-select-btn"
          onClick={() => {
            audioService.playPop();
            onBackToCharacterSelect();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 shadow-md transition-all active:scale-95 border border-stone-200 min-h-[44px]"
          aria-label="Change Explorer Friend"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
          <span className="font-bold text-sm sm:text-base">Change Friend</span>
        </button>

        {/* Parents Learning Area Quick Access */}
        <button
          id="gate-parent-learning-btn"
          onClick={() => {
            audioService.playPop();
            onOpenParentArea();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/95 hover:bg-amber-200 text-amber-950 shadow-md border border-amber-300 font-bold text-sm sm:text-base transition-all active:scale-95 min-h-[44px]"
        >
          <Shield className="w-4 h-4 text-amber-700" />
          <span>Parents Guide</span>
        </button>
      </header>

      {/* =========================================================================
          MAIN 2D STARTING GATE STRUCTURE & COMPANION WELCOME
          ========================================================================= */}
      <main className="relative flex-1 w-full max-w-4xl mx-auto px-4 flex flex-col items-center justify-center z-20 my-auto">
        {/* Speech Greeting Bubble from Companion */}
        <div className="mb-3 sm:mb-4 bg-white/95 backdrop-blur-md px-5 py-3 rounded-3xl shadow-xl border-3 border-amber-300 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 max-w-md text-center">
          <span className="text-2xl">{character.avatarEmoji}</span>
          <p className="text-stone-800 font-bold text-sm sm:text-base leading-snug">
            “I’m ready! Let’s open the Wonder Meadow Gate and start our adventure!”
          </p>
        </div>

        {/* THE 2D ADVENTURE STARTING GATE (Grand Archway with Hinged Wooden Doors) */}
        <div className="relative w-full max-w-[420px] sm:max-w-[480px] h-[300px] sm:h-[340px] flex items-end justify-center">
          {/* 1. Behind the Gate: Magical Sunny Portal Glow */}
          <div
            className={`absolute inset-x-8 top-12 bottom-4 rounded-t-full transition-all duration-700 -z-10 ${
              isOpening
                ? 'bg-gradient-to-t from-yellow-300 via-amber-100 to-sky-200 opacity-100 scale-105 shadow-[0_0_50px_rgba(251,191,36,0.8)]'
                : 'bg-gradient-to-t from-emerald-300/80 via-emerald-100/60 to-sky-100/50 opacity-90'
            }`}
          />

          {/* 2. Grand 2D Archway Frame (Wooden Posts & Blossom Garland) */}
          <svg
            viewBox="0 0 400 320"
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-xl z-20 overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="gate-wood" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78350F" />
                <stop offset="30%" stopColor="#B45309" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
              <linearGradient id="gate-gold-lantern" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>

            {/* Left Wooden Pillar */}
            <rect x="30" y="50" width="34" height="260" rx="8" fill="url(#gate-wood)" stroke="#451A03" strokeWidth="3" />
            {/* Right Wooden Pillar */}
            <rect x="336" y="50" width="34" height="260" rx="8" fill="url(#gate-wood)" stroke="#451A03" strokeWidth="3" />

            {/* Top Curved Archway Beam */}
            <path
              d="M 20 60 C 100 15 300 15 380 60 L 370 95 C 290 55 110 55 30 95 Z"
              fill="url(#gate-wood)"
              stroke="#451A03"
              strokeWidth="3.5"
            />

            {/* Carved Signboard "WONDER MEADOW" */}
            <rect x="110" y="46" width="180" height="38" rx="8" fill="#FDE68A" stroke="#B45309" strokeWidth="3" />
            <text
              x="200"
              y="70"
              textAnchor="middle"
              fill="#78350F"
              fontSize="14"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="1.5"
            >
              WONDER MEADOW
            </text>

            {/* Left Hanging Lantern */}
            <line x1="47" y1="90" x2="47" y2="120" stroke="#78350F" strokeWidth="2.5" />
            <circle cx="47" cy="132" r="14" fill="#FEF08A" stroke="#F59E0B" strokeWidth="2.5" className="animate-pulse" />
            <path d="M 40 122 L 54 122 L 47 114 Z" fill="url(#gate-gold-lantern)" />

            {/* Right Hanging Lantern */}
            <line x1="353" y1="90" x2="353" y2="120" stroke="#78350F" strokeWidth="2.5" />
            <circle cx="353" cy="132" r="14" fill="#FEF08A" stroke="#F59E0B" strokeWidth="2.5" className="animate-pulse" />
            <path d="M 346 122 L 360 122 L 353 114 Z" fill="url(#gate-gold-lantern)" />

            {/* Flower Garland & Vine Leaves over Arch */}
            <circle cx="100" cy="48" r="7" fill="#F472B6" />
            <circle cx="100" cy="48" r="3" fill="#FEF08A" />
            <circle cx="300" cy="48" r="7" fill="#F472B6" />
            <circle cx="300" cy="48" r="3" fill="#FEF08A" />
            <circle cx="200" cy="36" r="9" fill="#FBBF24" />
            <circle cx="200" cy="36" r="4" fill="#FFFFFF" />
          </svg>

          {/* 3. 2D Left Wooden Gate Door (Animates open on click) */}
          <div
            className={`absolute left-[64px] top-[90px] bottom-[10px] w-[136px] bg-gradient-to-r from-amber-800 to-amber-700 rounded-tl-3xl rounded-bl-lg border-2 border-amber-950 shadow-md origin-left transition-all duration-700 flex flex-col justify-around p-3 z-10 ${
              isOpening ? '-rotate-y-85 scale-x-20 opacity-40' : 'rotate-y-0 opacity-100'
            }`}
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(0,0,0,0.15) 30px, rgba(0,0,0,0.15) 34px)'
            }}
          >
            {/* Iron Hinges */}
            <div className="w-10 h-3 bg-stone-800 rounded-r-md border border-stone-900" />
            <div className="w-10 h-3 bg-stone-800 rounded-r-md border border-stone-900" />
            <div className="w-10 h-3 bg-stone-800 rounded-r-md border border-stone-900" />
          </div>

          {/* 4. 2D Right Wooden Gate Door (Animates open on click) */}
          <div
            className={`absolute right-[64px] top-[90px] bottom-[10px] w-[136px] bg-gradient-to-l from-amber-800 to-amber-700 rounded-tr-3xl rounded-br-lg border-2 border-amber-950 shadow-md origin-right transition-all duration-700 flex flex-col justify-around items-end p-3 z-10 ${
              isOpening ? 'rotate-y-85 scale-x-20 opacity-40' : 'rotate-y-0 opacity-100'
            }`}
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(0,0,0,0.15) 30px, rgba(0,0,0,0.15) 34px)'
            }}
          >
            {/* Iron Hinges & Center Golden Star Lock */}
            <div className="w-10 h-3 bg-stone-800 rounded-l-md border border-stone-900" />
            <div className="relative w-10 h-3 bg-stone-800 rounded-l-md border border-stone-900 flex items-center">
              <div className="absolute -left-3 w-7 h-7 rounded-full bg-amber-400 border-2 border-amber-600 shadow-md flex items-center justify-center text-xs">
                ⭐
              </div>
            </div>
            <div className="w-10 h-3 bg-stone-800 rounded-l-md border border-stone-900" />
          </div>

          {/* 5. Selected Character Standing in Front of the Gate */}
          <div className="relative z-30 mb-2 flex items-end justify-center">
            <CharacterVisual
              characterId={characterId}
              isSelected={true}
              size="hero"
              className="drop-shadow-2xl"
            />
          </div>
        </div>
      </main>

      {/* =========================================================================
          PRIMARY ACTION BUTTON: OPEN GATE & ENTER MEADOW
          ========================================================================= */}
      <footer className="relative w-full max-w-xl mx-auto px-4 pb-6 sm:pb-10 pt-2 text-center z-30 flex flex-col items-center">
        <button
          id="step-through-start-gate-btn"
          onClick={handleOpenGate}
          disabled={isOpening}
          className={`group relative w-full sm:w-auto min-w-[280px] sm:min-w-[340px] px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:via-amber-400 hover:to-orange-400 text-amber-950 font-black text-xl sm:text-2xl tracking-wide shadow-[0_10px_30px_rgba(245,158,11,0.5)] active:scale-98 transition-all duration-300 border-3 border-amber-200 flex items-center justify-center gap-3 cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-300 ${
            isOpening ? 'scale-105 animate-pulse' : ''
          }`}
        >
          <Sparkles className="w-7 h-7 text-amber-900 group-hover:rotate-12 transition-transform duration-300" />
          <span>{isOpening ? 'Opening the Gate...' : 'Step Through the Gate!'}</span>
          <span className="text-xl">⛩️</span>
        </button>

        <p className="text-xs sm:text-sm text-stone-600 font-semibold mt-3">
          Explore Phonics, Numbers, Animals, Nature & Music in Wonder Meadow
        </p>
      </footer>
    </div>
  );
};
