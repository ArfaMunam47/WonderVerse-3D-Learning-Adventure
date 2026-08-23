import React, { useState } from 'react';
import { ExplorerCharacter, ExplorerCharacterId, UserProgress } from '../../types';
import { EXPLORER_CHARACTERS, CHARACTER_UNLOCK_CONDITIONS, isCharacterUnlocked } from '../../data/charactersData';
import { audioService } from '../../utils/audio';
import { CharacterVisual } from './CharacterVisual';
import { ArrowLeft, Check, Volume2, Lock, Star, Sparkles, Shield } from 'lucide-react';

interface CharacterSelectionScreenProps {
  selectedCharacterId: ExplorerCharacterId;
  onSelectCharacter: (characterId: ExplorerCharacterId) => void;
  onConfirm: (characterId: ExplorerCharacterId) => void;
  onBack?: () => void;
  onOpenParentArea?: () => void;
  isIngameModal?: boolean;
  progress?: UserProgress | { stars: number } | null;
}

export const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({
  selectedCharacterId,
  onSelectCharacter,
  onConfirm,
  onBack,
  onOpenParentArea,
  isIngameModal = false,
  progress = { stars: 5 }
}) => {
  const [activeId, setActiveId] = useState<ExplorerCharacterId>(selectedCharacterId);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);

  const selectedChar = EXPLORER_CHARACTERS.find((c) => c.id === activeId) || EXPLORER_CHARACTERS[0];
  const isSelectedUnlocked = isCharacterUnlocked(activeId, progress);
  const unlockCondition = CHARACTER_UNLOCK_CONDITIONS[activeId];
  const userStars = progress?.stars ?? 0;

  // Calculate friends unlocked count (excluding mystery future slot)
  const unlockedCount = EXPLORER_CHARACTERS.filter(
    (c) => !c.isFutureSlot && isCharacterUnlocked(c.id, progress)
  ).length;
  const totalPlayableCount = EXPLORER_CHARACTERS.filter((c) => !c.isFutureSlot).length;

  const handlePickCharacter = (char: ExplorerCharacter) => {
    setActiveId(char.id);
    const unlocked = isCharacterUnlocked(char.id, progress);
    if (unlocked && !char.isFutureSlot) {
      onSelectCharacter(char.id);
    }
    audioService.playPop();

    // Spoken voice greeting
    if ('speechSynthesis' in window && !char.isFutureSlot) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(char.voiceGreeting);
        utterance.rate = 0.92;
        utterance.pitch = 1.25;
        setIsPlayingVoice(true);
        utterance.onend = () => setIsPlayingVoice(false);
        utterance.onerror = () => setIsPlayingVoice(false);
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsPlayingVoice(false);
      }
    }
  };

  const handleConfirm = () => {
    if (!isSelectedUnlocked || selectedChar.isFutureSlot) return;
    audioService.playSparkle();
    onConfirm(activeId);
  };

  return (
    <div
      id="character-selection-screen"
      className={`${
        isIngameModal
          ? 'fixed inset-0 z-50 bg-amber-950/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-8 animate-in fade-in select-none'
          : 'min-h-screen w-full bg-gradient-to-b from-[#BAE6FD] via-[#F0F9FF] to-[#D1FAE5] flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none overflow-x-hidden overflow-y-auto'
      }`}
    >
      <div
        className={`${
          isIngameModal
            ? 'w-full max-w-4xl max-h-[92vh] bg-[#FFFDF7] rounded-3xl border-2 border-amber-300 shadow-2xl overflow-y-auto p-4 sm:p-6 flex flex-col'
            : 'max-w-5xl w-full mx-auto flex flex-col flex-1 my-auto'
        }`}
      >
        {/* 1. TOP NAVBAR / HEADER BAR */}
        <header className="flex items-center justify-between gap-3 mb-4 sm:mb-6 shrink-0">
          {/* Back Button */}
          {onBack ? (
            <button
              type="button"
              id="back-to-welcome-btn"
              onClick={() => {
                audioService.playPop();
                onBack();
              }}
              className="h-10 px-3.5 sm:px-4 rounded-2xl bg-white/95 hover:bg-white text-slate-700 font-display font-bold text-xs sm:text-sm flex items-center gap-2 border border-amber-200 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
              aria-label="Back to Previous Screen"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-16" />
          )}

          {/* Center Brand / Screen Title */}
          <div className="text-center flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-amber-950 tracking-tight leading-tight">
              Choose Your Friend
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium truncate mt-0.5">
              Pick a friend to explore Wonder Meadow with!
            </p>
          </div>

          {/* Right Header: Stars Counter & Optional Parent Area */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-display font-black text-xs sm:text-sm shadow-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{userStars} Stars</span>
            </div>

            {onOpenParentArea && !isIngameModal && (
              <button
                type="button"
                id="char-select-parent-btn"
                onClick={() => {
                  audioService.playPop();
                  onOpenParentArea();
                }}
                className="h-10 px-3 rounded-2xl bg-white/95 hover:bg-white text-sky-900 border border-sky-200 shadow-xs hidden sm:flex items-center gap-1.5 text-xs font-display font-bold cursor-pointer active:scale-95 transition-all"
                title="Parent Area"
              >
                <Shield className="w-4 h-4 text-sky-700" />
                <span>Parent Area</span>
              </button>
            )}
          </div>
        </header>

        {/* 2. COLLECTION PROGRESS BAR (My Friends: X / 8 Unlocked) */}
        <div className="mb-4 bg-white/90 px-4 py-2.5 rounded-2xl border border-amber-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-display font-black text-amber-950">
              🌟 My Friends Collection:
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              {unlockedCount} of {totalPlayableCount} Friends Unlocked
            </span>
          </div>

          {/* Progress Track */}
          <div className="w-full sm:w-48 h-2.5 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / totalPlayableCount) * 100}%` }}
            />
          </div>
        </div>

        {/* 3. RESPONSIVE CHARACTER CARDS GRID (Spacious, Zero Overlap, Visual Vector Illustrations) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-auto py-1">
          {EXPLORER_CHARACTERS.map((char) => {
            const isSelected = char.id === activeId;
            const isUnlocked = isCharacterUnlocked(char.id, progress);
            const condition = CHARACTER_UNLOCK_CONDITIONS[char.id];

            return (
              <button
                type="button"
                key={char.id}
                id={`char-card-${char.id}`}
                onClick={() => handlePickCharacter(char)}
                className={`relative flex flex-col items-center text-center p-3.5 sm:p-4 rounded-3xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white shadow-xl scale-[1.02] ring-4 ring-amber-300'
                    : isUnlocked && !char.isFutureSlot
                    ? 'bg-white/95 hover:bg-white border-amber-200 hover:border-amber-300 hover:shadow-md'
                    : 'bg-stone-50/90 border-stone-200 opacity-80 hover:opacity-95'
                }`}
                style={{
                  borderColor: isSelected ? char.themeColor : undefined
                }}
              >
                {/* Active Selection Checkmark */}
                {isSelected && isUnlocked && !char.isFutureSlot && (
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-md animate-bounce-subtle z-10"
                    style={{ backgroundColor: char.themeColor }}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Locked / Requirement Pill */}
                {!isUnlocked && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 flex items-center gap-1 text-[11px] font-black shadow-2xs z-10 border border-amber-300">
                    <Lock className="w-3 h-3 text-amber-800" />
                    <span>{condition?.requiredStars ?? 0}⭐</span>
                  </div>
                )}

                {/* Character Vector Art */}
                <div className="mb-2 transition-transform">
                  <CharacterVisual
                    characterId={char.id}
                    isUnlocked={isUnlocked}
                    isSelected={isSelected}
                    size="md"
                    animate={isSelected}
                  />
                </div>

                {/* Character Name & Archetype Tag */}
                <div className="w-full">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-base sm:text-lg font-display font-black text-amber-950 leading-tight">
                      {char.name}
                    </span>
                    <span className="text-xs">{char.badge}</span>
                  </div>

                  <span
                    className="text-[10px] sm:text-xs font-bold block mt-1 px-2.5 py-0.5 rounded-full mx-auto w-fit"
                    style={{
                      backgroundColor: isUnlocked && !char.isFutureSlot ? `${char.themeColor}15` : '#E2E8F0',
                      color: isUnlocked && !char.isFutureSlot ? char.themeColor : '#64748B'
                    }}
                  >
                    {char.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 4. ACTIVE CHARACTER SPOTLIGHT & CONFIRMATION STRIP */}
        <div className="mt-4 p-4 sm:p-5 rounded-3xl bg-white border-2 border-amber-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 sm:gap-4 text-left w-full md:w-auto">
            {/* Spotlight Avatar */}
            <div className="shrink-0">
              <CharacterVisual
                characterId={selectedChar.id}
                isUnlocked={isSelectedUnlocked}
                isSelected={true}
                size="sm"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-display font-black text-amber-950">
                  ✨ {selectedChar.name}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-950 border border-amber-200 font-bold">
                  {selectedChar.title}
                </span>
                {!isSelectedUnlocked && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-800" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              {/* Description or Unlock Requirement */}
              {isSelectedUnlocked && !selectedChar.isFutureSlot ? (
                <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-xl mt-0.5 leading-snug">
                  {selectedChar.outfitDescription} • "{selectedChar.tagline}"
                </p>
              ) : selectedChar.isFutureSlot ? (
                <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl mt-0.5">
                  ☁️ Secret companion preparing to join Wonder Meadow in future expansions!
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-amber-950 font-bold max-w-xl mt-0.5">
                  ⭐ {unlockCondition?.requiredCondition} (You have {userStars} / {unlockCondition?.requiredStars} stars)
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons: Voice Preview & ENTER WONDER MEADOW */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            {/* Voice Preview Button */}
            {!selectedChar.isFutureSlot && (
              <button
                type="button"
                id="companion-voice-btn"
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    try {
                      window.speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(selectedChar.voiceGreeting);
                      utterance.rate = 0.92;
                      utterance.pitch = 1.25;
                      setIsPlayingVoice(true);
                      utterance.onend = () => setIsPlayingVoice(false);
                      utterance.onerror = () => setIsPlayingVoice(false);
                      window.speechSynthesis.speak(utterance);
                    } catch {
                      setIsPlayingVoice(false);
                    }
                  }
                }}
                className="h-12 px-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                title="Hear companion greeting"
              >
                <Volume2 className={`w-4 h-4 text-amber-800 ${isPlayingVoice ? 'animate-bounce' : ''}`} />
                <span>Hear Greeting</span>
              </button>
            )}

            {/* Enter / Continue Button */}
            {isSelectedUnlocked && !selectedChar.isFutureSlot ? (
              <button
                type="button"
                id="enter-wonder-meadow-btn"
                onClick={handleConfirm}
                className="h-12 sm:h-13 px-6 sm:px-8 rounded-2xl font-display font-black text-sm sm:text-base text-white shadow-md hover:shadow-lg cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 flex-1 md:flex-initial"
                style={{
                  backgroundColor: selectedChar.themeColor
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-200 fill-white" />
                <span>{isIngameModal ? `Switch to ${selectedChar.name}` : `ENTER WONDER MEADOW →`}</span>
              </button>
            ) : (
              <div className="h-12 px-5 rounded-2xl bg-stone-200 text-slate-600 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 flex-1 md:flex-initial">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>
                  {selectedChar.isFutureSlot
                    ? 'Coming Soon!'
                    : `Earn ${unlockCondition?.requiredStars ?? 0} stars to unlock`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
