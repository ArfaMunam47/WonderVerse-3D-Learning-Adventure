import React, { useState, useEffect, useMemo } from 'react';
import { ExplorerCharacterId, UserProgress } from '../../types';
import { audioService } from '../../utils/audio';
import { CharacterVisual } from './CharacterVisual';
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, Sparkles } from 'lucide-react';
import maxiPng from '../../assets/characters/maxi.png';
import mayaPng from '../../assets/characters/maya.png';
import lumiPng from '../../assets/characters/lumi.png';

interface CharacterSelectionScreenProps {
  selectedCharacterId: ExplorerCharacterId;
  onSelectCharacter: (characterId: ExplorerCharacterId) => void;
  onConfirm: (characterId: ExplorerCharacterId) => void;
  onBack?: () => void;
  onOpenParentArea?: () => void;
  isIngameModal?: boolean;
  progress?: UserProgress | { stars: number } | null;
}

interface FriendData {
  id: ExplorerCharacterId;
  name: string;
  personality: string;
  themeColor: string;
  imageSrc?: string;
  isUnlocked: boolean;
}

export const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({
  selectedCharacterId,
  onSelectCharacter,
  onConfirm,
  onBack,
  isIngameModal = false
}) => {
  // Available friends data
  const friendsList: FriendData[] = useMemo(
    () => [
      {
        id: 'curious_explorer',
        name: 'MAXI',
        personality: 'Explorer',
        themeColor: '#16A34A',
        imageSrc: maxiPng,
        isUnlocked: true
      },
      {
        id: 'nature_explorer',
        name: 'MAYA',
        personality: 'Creative',
        themeColor: '#DB2777',
        imageSrc: mayaPng,
        isUnlocked: true
      },
      {
        id: 'forest_fawn',
        name: 'LUMI',
        personality: 'Playful',
        themeColor: '#7C3AED',
        imageSrc: lumiPng,
        isUnlocked: true
      },
      {
        id: 'little_inventor',
        name: 'MYSTERY FRIEND',
        personality: 'Keep exploring to unlock',
        themeColor: '#64748B',
        isUnlocked: false
      }
    ],
    []
  );

  // Active selected friend
  const initialActive = friendsList.some((f) => f.id === selectedCharacterId)
    ? selectedCharacterId
    : 'curious_explorer';

  const [activeId, setActiveId] = useState<ExplorerCharacterId>(initialActive);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const activeIndex = Math.max(
    0,
    friendsList.findIndex((f) => f.id === activeId)
  );
  const currentFriend = friendsList[activeIndex] || friendsList[0];
  const isCurrentUnlocked = currentFriend.isUnlocked;

  // Handle character selection with gentle audio feedback
  const handleSelect = (friend: FriendData) => {
    audioService.playPop();
    setActiveId(friend.id);

    if (friend.isUnlocked) {
      onSelectCharacter(friend.id);
      setLockedNotice(null);
    } else {
      setLockedNotice('Keep exploring to unlock your new friend! ✨');
      setTimeout(() => setLockedNotice(null), 3000);
    }
  };

  // Mobile navigation handlers
  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + friendsList.length) % friendsList.length;
    handleSelect(friendsList[prevIdx]);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % friendsList.length;
    handleSelect(friendsList[nextIdx]);
  };

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Enter') {
        if (isCurrentUnlocked) {
          handleExplore();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, isCurrentUnlocked]);

  // Primary action button handler
  const handleExplore = () => {
    if (!isCurrentUnlocked) {
      setLockedNotice('Please choose an available friend to explore!');
      return;
    }
    audioService.playSparkle();
    onConfirm(activeId);
  };

  return (
    <main
      id="choose-your-friend-screen"
      role="main"
      className={`${
        isIngameModal
          ? 'fixed inset-0 z-50 bg-amber-950/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none'
          : 'h-screen w-screen bg-gradient-to-b from-[#E0F2FE] via-[#F0FDF4] to-[#DCFCE7] flex flex-col justify-between p-3 sm:p-5 md:p-6 select-none overflow-hidden'
      }`}
    >
      <div
        className={`w-full mx-auto flex flex-col justify-between h-full ${
          isIngameModal
            ? 'max-w-4xl max-h-[92vh] bg-[#FFFDF7] rounded-3xl border-2 border-amber-300 shadow-2xl p-4 sm:p-6 overflow-hidden'
            : 'max-w-5xl'
        }`}
      >
        {/* ============================================================
            1. TOP: Back Button, Title, Subtitle
            ============================================================ */}
        <header className="relative flex items-center justify-between w-full shrink-0 min-h-[44px] sm:min-h-[52px]">
          {/* Back Button */}
          {onBack ? (
            <button
              type="button"
              id="back-button"
              onClick={() => {
                audioService.playPop();
                onBack();
              }}
              className="h-11 sm:h-12 px-3.5 sm:px-5 rounded-2xl bg-white hover:bg-stone-50 active:scale-95 text-stone-800 font-display font-black text-sm sm:text-base flex items-center gap-1.5 border-2 border-stone-200 shadow-xs cursor-pointer transition-all shrink-0 z-10"
              aria-label="Back to previous screen"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700 stroke-[2.5]" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-12 sm:w-16" />
          )}

          {/* Title & Subtitle */}
          <div className="text-center px-2 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-stone-900 tracking-tight leading-tight">
              Choose Your Friend
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-stone-700 font-bold mt-0.5 max-w-sm sm:max-w-none mx-auto line-clamp-1">
              Who will explore Wonder Meadow with you?
            </p>
          </div>

          {/* Symmetrical Spacer */}
          <div className="w-12 sm:w-16 shrink-0" />
        </header>

        {/* ============================================================
            2. MIDDLE: CHARACTER STAGE
               - Mobile: 1 Centered Character with Carousel Navigation
               - Tablet & Desktop: Clean Horizontal Showcase of Isolated Characters
            ============================================================ */}

        {/* --- A. MOBILE VIEW (< 640px) --- */}
        <section
          aria-label="Mobile Character Selector"
          className="flex sm:hidden flex-1 flex-col items-center justify-center min-h-0 my-1 w-full max-w-sm mx-auto px-2"
        >
          <div className="relative w-full flex flex-col items-center justify-center flex-1 min-h-0">
            {/* Left Previous Button */}
            <button
              type="button"
              id="mobile-prev-btn"
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-stone-800 shadow-md border-2 border-stone-200 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
              aria-label="Previous friend"
            >
              <ChevronLeft className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Right Next Button */}
            <button
              type="button"
              id="mobile-next-btn"
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-stone-800 shadow-md border-2 border-stone-200 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
              aria-label="Next friend"
            >
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Single Isolated Character Hero Stage */}
            <div
              className={`flex flex-col items-center justify-center flex-1 min-h-0 w-full px-12 transition-all duration-300 ${
                isCurrentUnlocked ? 'scale-100' : 'scale-95 opacity-85'
              }`}
            >
              <div className="relative flex items-center justify-center w-full flex-1 max-h-[220px] my-auto">
                <CharacterVisual
                  characterId={currentFriend.id}
                  isUnlocked={currentFriend.isUnlocked}
                  isSelected={true}
                  size="hero"
                  className="animate-in fade-in zoom-in-95 duration-200"
                />
              </div>

              {/* Name & Personality */}
              <div className="text-center mt-1 shrink-0">
                <div className="flex items-center justify-center gap-1.5">
                  <h2 className="text-xl font-display font-black text-stone-900 tracking-tight leading-none">
                    {currentFriend.name}
                  </h2>
                  {!isCurrentUnlocked && (
                    <Lock className="w-4 h-4 text-stone-500 stroke-[2.5]" />
                  )}
                </div>
                <p
                  className="text-xs font-extrabold mt-0.5 tracking-wide"
                  style={{
                    color: isCurrentUnlocked ? currentFriend.themeColor : '#64748B'
                  }}
                >
                  {currentFriend.personality}
                </p>
              </div>
            </div>

            {/* Mobile Navigation Counter "< 1 / 4 >" & Dots */}
            <div className="flex items-center justify-center gap-2 mt-2 shrink-0">
              <span className="text-xs font-bold text-stone-600 px-2 py-0.5 rounded-full bg-white/80 border border-stone-200">
                {activeIndex + 1} / {friendsList.length}
              </span>
            </div>
          </div>
        </section>

        {/* --- B. TABLET & DESKTOP VIEW (≥ 640px) --- */}
        <section
          aria-label="Friends Showcase"
          className="hidden sm:flex flex-1 items-center justify-center min-h-0 my-2 w-full max-w-5xl mx-auto px-4"
        >
          <div className="grid grid-cols-4 gap-3 md:gap-6 lg:gap-8 items-end justify-items-center w-full max-w-4xl mx-auto py-2">
            {friendsList.map((friend) => {
              const isSelected = friend.id === activeId;
              const isUnlocked = friend.isUnlocked;

              return (
                <button
                  type="button"
                  key={friend.id}
                  id={`friend-card-${friend.id}`}
                  onClick={() => handleSelect(friend)}
                  aria-selected={isSelected}
                  aria-label={`${friend.name}, ${friend.personality}`}
                  className={`group relative flex flex-col items-center justify-end text-center p-3 md:p-4 rounded-3xl transition-all duration-300 cursor-pointer w-full max-w-[200px] md:max-w-[230px] ${
                    isSelected
                      ? 'bg-white/80 shadow-lg scale-105 ring-3 ring-amber-400/80 -translate-y-2'
                      : 'hover:bg-white/40 hover:scale-100 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Selected Indicator Badge */}
                  <div className="w-full flex justify-center min-h-[22px] mb-1">
                    {isSelected && isUnlocked && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-900 font-display font-black text-[11px] md:text-xs shadow-xs flex items-center gap-1 animate-in fade-in">
                        <Sparkles className="w-3 h-3 fill-stone-900" />
                        <span>SELECTED</span>
                      </span>
                    )}
                    {!isUnlocked && (
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700 font-bold text-[11px] flex items-center gap-1">
                        <Lock className="w-3 h-3 stroke-[2.5]" />
                        <span>LOCKED</span>
                      </span>
                    )}
                  </div>

                  {/* Standalone 3D Character Asset */}
                  <div className="w-full flex justify-center my-auto">
                    <CharacterVisual
                      characterId={friend.id}
                      isUnlocked={friend.isUnlocked}
                      isSelected={isSelected}
                      size="lg"
                    />
                  </div>

                  {/* Character Name & Single Personality Word */}
                  <div className="w-full mt-2">
                    <h2 className="text-lg md:text-xl font-display font-black text-stone-900 tracking-tight leading-tight">
                      {friend.name}
                    </h2>
                    <p
                      className="text-xs md:text-sm font-extrabold mt-0.5 tracking-wide line-clamp-1"
                      style={{
                        color: isUnlocked ? friend.themeColor : '#64748B'
                      }}
                    >
                      {friend.personality}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Gentle Notice (if locked friend is tapped) */}
        {lockedNotice && (
          <div
            role="status"
            className="shrink-0 my-1 py-1 px-4 rounded-full bg-amber-100 border border-amber-300 text-stone-900 text-xs sm:text-sm font-bold text-center mx-auto shadow-xs animate-in fade-in"
          >
            {lockedNotice}
          </div>
        )}

        {/* ============================================================
            3. BOTTOM: PRIMARY ACTION BUTTON ("Let's Explore!")
            ============================================================ */}
        <footer className="w-full shrink-0 flex flex-col items-center justify-center pt-1 pb-1 sm:pt-2">
          <button
            type="button"
            id="lets-explore-btn"
            onClick={handleExplore}
            className="w-full sm:w-auto min-w-[260px] sm:min-w-[340px] h-13 sm:h-15 px-8 sm:px-12 rounded-2xl sm:rounded-3xl font-display font-black text-lg sm:text-xl md:text-2xl text-white shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{
              backgroundColor: isCurrentUnlocked ? currentFriend.themeColor : '#94A3B8',
              cursor: isCurrentUnlocked ? 'pointer' : 'not-allowed'
            }}
            aria-label={`Let's Explore Wonder Meadow with ${currentFriend.name}`}
          >
            <span>Let's Explore!</span>
          </button>
        </footer>
      </div>
    </main>
  );
};
