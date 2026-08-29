import React, { useState } from 'react';
import { ExplorerCharacterId, UserProgress } from '../../types';
import { audioService } from '../../utils/audio';
import { CharacterPodium3D } from './CharacterPodium3D';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface CharacterSelectionScreenProps {
  selectedCharacterId: ExplorerCharacterId;
  onSelectCharacter: (characterId: ExplorerCharacterId) => void;
  onConfirm: (characterId: ExplorerCharacterId) => void;
  onBack?: () => void;
  onOpenParentArea?: () => void;
  isIngameModal?: boolean;
  progress?: UserProgress | { stars: number } | null;
}

interface CompanionProfile {
  id: ExplorerCharacterId;
  name: string;
  personality: string;
  themeColor: string;
  accentColor: string;
  badgeEmoji: string;
  voiceLine: string;
}

const COMPANIONS: CompanionProfile[] = [
  {
    id: 'curious_explorer',
    name: 'MAXI',
    personality: 'Brave Explorer',
    themeColor: '#16A34A', // Forest green
    accentColor: '#F59E0B',
    badgeEmoji: '🌿',
    voiceLine: "Hi! I'm Maxi! Let's explore together!"
  },
  {
    id: 'nature_explorer',
    name: 'MAYA',
    personality: 'Creative Explorer',
    themeColor: '#EC4899', // Blossom pink
    accentColor: '#A855F7',
    badgeEmoji: '🌸',
    voiceLine: "Hi! I'm Maya! Let's make something magical!"
  },
  {
    id: 'forest_fawn',
    name: 'BARNABY',
    personality: 'Bear Explorer',
    themeColor: '#D97706', // Warm Honey Bear
    accentColor: '#F59E0B',
    badgeEmoji: '🐻',
    voiceLine: "Hello friend! I'm Barnaby the Bear! Let's explore Wonder Meadow together!"
  },
  {
    id: 'little_inventor',
    name: 'JOJO',
    personality: 'Monkey Explorer',
    themeColor: '#0284C7', // Sky blue
    accentColor: '#F59E0B',
    badgeEmoji: '🐵',
    voiceLine: "Ooh ooh! I'm Jojo the monkey! Let's go!"
  }
];

export const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({
  selectedCharacterId,
  onSelectCharacter,
  onConfirm,
  onBack,
  isIngameModal = false
}) => {
  // Ensure valid selected ID (default to curious_explorer / Maxi if not in list)
  const initialId = COMPANIONS.some((c) => c.id === selectedCharacterId)
    ? selectedCharacterId
    : 'curious_explorer';

  const [activeId, setActiveId] = useState<ExplorerCharacterId>(initialId);
  const [hoveredId, setHoveredId] = useState<ExplorerCharacterId | null>(null);

  const selectedCompanion =
    COMPANIONS.find((c) => c.id === activeId) || COMPANIONS[0];

  const handleSelect = (id: ExplorerCharacterId) => {
    setActiveId(id);
    onSelectCharacter(id);
    audioService.playPop();
    const comp = COMPANIONS.find((c) => c.id === id);
    if (comp) {
      audioService.speakCuteAnimeChild(comp.voiceLine, true);
    }
  };

  const handleExplore = () => {
    audioService.playSparkle();
    onConfirm(activeId);
  };

  return (
    <div
      id="companion-selection-screen"
      className={`relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between select-none ${
        isIngameModal ? 'z-50 bg-stone-900/60 backdrop-blur-sm' : 'bg-gradient-to-b from-[#E0F2FE] via-[#FEF9C3]/40 to-[#DCFCE7]'
      }`}
    >
      {/* WONDER MEADOW LIVING ENVIRONMENT (Sky, gentle clouds, rolling hills, soft sparkles) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        {/* Warm Sunlight Radiance */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[380px] rounded-full bg-gradient-to-b from-amber-200/60 via-yellow-100/40 to-transparent blur-3xl opacity-80" />

        {/* Soft Ambient Floating Meadow Sparkles / Pollen */}
        <div className="absolute inset-0">
          <div className="absolute top-[15%] left-[10%] w-3 h-3 rounded-full bg-amber-300/60 blur-[1px] animate-pulse" />
          <div className="absolute top-[25%] right-[12%] w-4 h-4 rounded-full bg-pink-300/50 blur-[1px] animate-pulse delay-300" />
          <div className="absolute top-[40%] left-[18%] w-2.5 h-2.5 rounded-full bg-emerald-300/60 blur-[1px] animate-pulse delay-700" />
          <div className="absolute top-[55%] right-[16%] w-3.5 h-3.5 rounded-full bg-purple-300/50 blur-[1px] animate-pulse delay-500" />
          <div className="absolute top-[30%] left-[48%] w-3 h-3 rounded-full bg-yellow-200/70 blur-[1px] animate-pulse delay-1000" />
        </div>

        {/* Distant Rolling Hills Contour (SVG) */}
        <svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 left-0 right-0 w-full h-[32vh] min-h-[140px] max-h-[220px] object-cover opacity-60 pointer-events-none"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,140 C320,90 480,190 760,130 C1040,70 1200,160 1440,120 L1440,320 L0,320 Z"
            fill="#86EFAC"
            fillOpacity="0.45"
          />
          <path
            d="M0,170 C280,140 520,210 820,160 C1120,100 1280,190 1440,150 L1440,320 L0,320 Z"
            fill="#4ADE80"
            fillOpacity="0.5"
          />
          <path
            d="M0,220 C360,190 600,250 900,210 C1200,170 1340,230 1440,210 L1440,320 L0,320 Z"
            fill="#22C55E"
            fillOpacity="0.35"
          />
        </svg>

        {/* Meadow Floor Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-500/20 via-emerald-400/10 to-transparent" />
      </div>

      {/* TOP HEADER & NAVIGATION BAR (Compact single line) */}
      <header className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between z-20 shrink-0">
        {/* Predictable, Accessible Back Button */}
        {onBack ? (
          <button
            id="back-to-welcome-btn"
            onClick={() => {
              audioService.playPop();
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-stone-900 shadow-sm hover:shadow-md transition-all duration-200 border border-stone-200/90 active:scale-95 group focus:outline-none focus:ring-3 focus:ring-amber-400 min-h-[40px]"
            aria-label="Go back to welcome screen"
          >
            <ArrowLeft className="w-4 h-4 text-stone-600 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold text-xs sm:text-sm font-sans tracking-wide">Back</span>
          </button>
        ) : (
          <div className="w-16" />
        )}

        {/* Clean Screen Title */}
        <div className="text-center flex-1 px-2">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-stone-800 tracking-tight drop-shadow-xs font-sans">
            Choose Your Friend
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-stone-600 font-medium">
            Tap a buddy to explore Wonder Meadow together!
          </p>
        </div>

        {/* Balanced spacer */}
        <div className="w-14 sm:w-16" />
      </header>

      {/* =========================================================================
          MAIN EXPERIENCE CONTAINER: ALL 4 3D CHARACTERS STANDING ON PODIUMS
          ========================================================================= */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-6 py-1 flex flex-col justify-center items-center relative z-10 min-h-0 overflow-hidden">
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6 items-end justify-items-center">
          {COMPANIONS.map((companion) => {
            const isSelected = companion.id === activeId;
            const isHovered = companion.id === hoveredId;

            return (
              <CharacterPodium3D
                key={companion.id}
                characterId={companion.id}
                name={companion.name}
                personality={companion.personality}
                themeColor={companion.themeColor}
                accentColor={companion.accentColor}
                badgeEmoji={companion.badgeEmoji}
                isSelected={isSelected}
                isHovered={isHovered}
                onClick={() => handleSelect(companion.id)}
                onMouseEnter={() => setHoveredId(companion.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            );
          })}
        </div>
      </main>

      {/* =========================================================================
          BOTTOM PRIMARY ACTION: SELECTED COMPANION SUMMARY & "LET'S EXPLORE!"
          ========================================================================= */}
      <footer className="relative w-full max-w-md mx-auto px-4 pb-3 sm:pb-5 pt-1 text-center z-20 flex flex-col items-center shrink-0">
        {/* Selected Companion Active Title Bar */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="text-base sm:text-xl font-black text-stone-900 tracking-wider">
            {selectedCompanion.name}
          </span>
          <span className="text-stone-300 font-bold">•</span>
          <span
            className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full text-white shadow-xs"
            style={{ backgroundColor: selectedCompanion.themeColor }}
          >
            {selectedCompanion.personality} Explorer
          </span>
        </div>

        {/* Primary Action Button: "Let's Explore!" */}
        <button
          id="lets-explore-btn"
          onClick={handleExplore}
          className="group relative w-full sm:w-auto min-w-[240px] sm:min-w-[300px] px-6 py-2.5 sm:py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:via-amber-400 hover:to-orange-400 text-amber-950 font-black text-base sm:text-lg md:text-xl tracking-wide shadow-[0_6px_18px_rgba(245,158,11,0.35)] hover:shadow-[0_10px_24px_rgba(245,158,11,0.45)] active:scale-98 transition-all duration-200 border-2 border-amber-200/90 flex items-center justify-center gap-2.5 cursor-pointer focus:outline-none focus:ring-3 focus:ring-amber-300"
        >
          <Sparkles className="w-5 h-5 text-amber-900 group-hover:rotate-12 transition-transform duration-300" />
          <span>Let’s Explore!</span>
          <div className="w-2 h-2 rounded-full bg-amber-900/30 group-hover:scale-150 transition-transform" />
        </button>
      </footer>
    </div>
  );
};
