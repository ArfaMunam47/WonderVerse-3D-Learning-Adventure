import React, { useState } from 'react';
import { ExplorerCharacterId, UserProgress } from '../../types';
import { audioService } from '../../utils/audio';
import { CharacterPodium3D } from './CharacterPodium3D';
import { ArrowLeft, Sparkles, Compass } from 'lucide-react';

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
    name: 'MEADOW SAGE',
    personality: 'Classic Dress',
    themeColor: '#0F766E', // Forest Teal
    accentColor: '#14B8A6',
    badgeEmoji: '🌿',
    voiceLine: "Hey! Welcome to Wonder Meadow! Let's explore together!"
  },
  {
    id: 'nature_explorer',
    name: 'BLOSSOM ROSE',
    personality: 'Flower Style',
    themeColor: '#DB2777', // Rose Pink
    accentColor: '#F472B6',
    badgeEmoji: '🌸',
    voiceLine: "Sparkles and sunshine! Let's make something beautiful and magical!"
  },
  {
    id: 'forest_fawn',
    name: 'SUNNY HAT',
    personality: 'Outdoor Explorer',
    themeColor: '#D97706', // Warm Amber
    accentColor: '#FBBF24',
    badgeEmoji: '🌻',
    voiceLine: "Hello sunshine! Let's discover the happiest trails in the meadow!"
  },
  {
    id: 'little_inventor',
    name: 'LAVENDER STAR',
    personality: 'Cozy Dreamer',
    themeColor: '#7C3AED', // Violet Lavender
    accentColor: '#A855F7',
    badgeEmoji: '✨',
    voiceLine: "Hello sweet friend! Let's have a peaceful, gentle adventure!"
  }
];

export const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({
  selectedCharacterId,
  onSelectCharacter,
  onConfirm,
  onBack,
  isIngameModal = false
}) => {
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
        isIngameModal ? 'z-50 bg-slate-900/60 backdrop-blur-sm' : 'bg-[#F8FAFC]'
      }`}
    >
      {/* Calm Ambient Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[380px] rounded-full bg-slate-200/40 blur-3xl opacity-80" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-teal-100/30 blur-3xl" />
      </div>

      {/* TOP HEADER & NAVIGATION BAR */}
      <header className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between z-20 shrink-0 pb-2 border-b border-slate-200/80">
        {onBack ? (
          <button
            id="back-to-welcome-btn"
            onClick={() => {
              audioService.playPop();
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-xs border border-slate-200 active:scale-95 group focus:outline-none focus:ring-3 focus:ring-teal-300 min-h-[38px]"
            aria-label="Go back to welcome screen"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold text-xs sm:text-sm font-sans tracking-wide">Back</span>
          </button>
        ) : (
          <div className="w-16" />
        )}

        {/* Clean Screen Title */}
        <div className="text-center flex-1 px-2">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
            Choose Your Explorer Friend
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Select a companion to explore Wonder Meadow with you
          </p>
        </div>

        <div className="w-14 sm:w-16" />
      </header>

      {/* MAIN PODIUM CONTAINER */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-6 py-2 flex flex-col justify-center items-center relative z-10 min-h-0 overflow-hidden">
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

      {/* BOTTOM ACTION BAR */}
      <footer className="relative w-full max-w-md mx-auto px-4 pb-3 sm:pb-4 pt-1 text-center z-20 flex flex-col items-center shrink-0">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="text-base sm:text-lg font-black text-slate-900 tracking-wide">
            {selectedCompanion.name}
          </span>
          <span className="text-slate-300 font-bold">•</span>
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white shadow-xs"
            style={{ backgroundColor: selectedCompanion.themeColor }}
          >
            {selectedCompanion.personality}
          </span>
        </div>

        {/* Primary Explore Button in Soothing Teal */}
        <button
          id="lets-explore-btn"
          onClick={handleExplore}
          className="group relative w-full sm:w-auto min-w-[240px] sm:min-w-[280px] px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-base sm:text-lg tracking-wide shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 border border-teal-600 flex items-center justify-center gap-2.5 cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-200"
        >
          <Compass className="w-5 h-5 text-teal-200 group-hover:rotate-45 transition-transform duration-300" />
          <span>Let’s Explore!</span>
        </button>
      </footer>
    </div>
  );
};
