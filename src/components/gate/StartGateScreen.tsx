import React, { useState } from 'react';
import { ExplorerCharacterId, UserProgress } from '../../types';
import { getCharacterById } from '../../data/charactersData';
import { WondermidoGate3DCanvas } from './WondermidoGate3DCanvas';
import { audioService } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, Shield, Sparkles } from 'lucide-react';

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
      particleCount: 65,
      spread: 75,
      origin: { y: 0.6 }
    });
  };

  return (
    <div
      id="wonder-meadow-start-gate-screen"
      className="relative w-full h-full min-h-screen overflow-hidden flex flex-col justify-between select-none bg-sky-300"
    >
      {/* =========================================================================
          FULL 3D INTERACTIVE WONDERMIDO ENTRANCE GATE CANVAS
          (Features 3D Grand Gate, 3D WONDERMIDO Sign, 2 Friendly Guards,
           Selected 3D Character, Cobblestone Road, Physical Door Swing & Walk-Through)
          ========================================================================= */}
      <WondermidoGate3DCanvas
        characterId={characterId}
        isOpening={isOpening}
        onOpenComplete={onEnterWorld}
      />

      {/* =========================================================================
          TOP NAV / ACTION BAR (Clean, non-intrusive)
          ========================================================================= */}
      <header className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 flex items-center justify-between z-30 pointer-events-auto">
        <button
          id="back-to-companion-select-btn"
          onClick={() => {
            if (isOpening) return;
            audioService.playPop();
            onBackToCharacterSelect();
          }}
          disabled={isOpening}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-stone-900 shadow-lg transition-all active:scale-95 border-2 border-amber-200 min-h-[44px] cursor-pointer ${
            isOpening ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-label="Change Explorer Friend"
        >
          <ArrowLeft className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-sm sm:text-base">Change Friend</span>
        </button>

        {/* Parents Learning Area Quick Access */}
        <button
          id="gate-parent-learning-btn"
          onClick={() => {
            if (isOpening) return;
            audioService.playPop();
            onOpenParentArea();
          }}
          disabled={isOpening}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-100/95 hover:bg-amber-200 text-amber-950 shadow-lg border-2 border-amber-300 font-bold text-sm sm:text-base transition-all active:scale-95 min-h-[44px] cursor-pointer ${
            isOpening ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <Shield className="w-4 h-4 text-amber-700" />
          <span>Parents Guide</span>
        </button>
      </header>

      {/* =========================================================================
          BOTTOM INTERACTION OVERLAY: "OPEN THE GATE" ACTION
          ========================================================================= */}
      <footer className="relative w-full max-w-xl mx-auto px-4 pb-6 sm:pb-8 flex flex-col items-center gap-3 z-30 pointer-events-auto">
        {/* Welcome message bubble */}
        {!isOpening && (
          <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border-2 border-amber-300 flex items-center gap-2 text-stone-800 text-sm sm:text-base font-semibold animate-bounce duration-1000">
            <span className="text-xl">🌟</span>
            <span>Welcome, <strong>{character.name}</strong>! The guards are ready for you.</span>
          </div>
        )}

        {/* Big Juicy Child-Friendly Action Button */}
        {!isOpening ? (
          <button
            id="open-the-gate-action-btn"
            onClick={handleOpenGate}
            className="group relative flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-600 text-stone-950 font-black text-lg sm:text-2xl tracking-wide shadow-[0_8px_25px_rgba(245,158,11,0.5)] active:translate-y-1 active:shadow-md transition-all border-3 border-amber-200 cursor-pointer min-h-[56px]"
          >
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-100 fill-yellow-200 animate-spin duration-3000" />
            <span>OPEN THE GATE</span>
            <span className="text-2xl">✨</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-amber-400/90 text-stone-950 font-black text-lg shadow-xl backdrop-blur-md animate-pulse">
            <Sparkles className="w-6 h-6 text-yellow-900 animate-spin" />
            <span>Entering Wondermido...</span>
          </div>
        )}
      </footer>
    </div>
  );
};
