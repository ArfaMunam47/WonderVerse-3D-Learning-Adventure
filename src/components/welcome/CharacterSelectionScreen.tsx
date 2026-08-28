import React, { useState, useEffect, useMemo } from 'react';
import { ExplorerCharacterId, UserProgress } from '../../types';
import { audioService } from '../../utils/audio';
import { CharacterVisual } from './CharacterVisual';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles,
  CheckCircle2,
  Volume2,
  Stars,
  Compass,
  Smile,
  Zap,
  Music,
  MapPin
} from 'lucide-react';

interface CharacterSelectionScreenProps {
  selectedCharacterId: ExplorerCharacterId;
  onSelectCharacter: (characterId: ExplorerCharacterId) => void;
  onConfirm: (characterId: ExplorerCharacterId) => void;
  onBack?: () => void;
  onOpenParentArea?: () => void;
  isIngameModal?: boolean;
  progress?: UserProgress | { stars: number } | null;
}

interface CharacterSpotlight {
  id: ExplorerCharacterId;
  name: string;
  badgeTitle: string;
  roleDescription: string;
  catchphrase: string;
  favoriteActivity: string;
  themeColor: string;
  gradientBg: string;
  pedestalGlow: string;
  pillBadgeColor: string;
  badgeEmoji: string;
  isUnlocked: boolean;
}

export const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({
  selectedCharacterId,
  onSelectCharacter,
  onConfirm,
  onBack,
  isIngameModal = false
}) => {
  // Unique 3D character profiles with vivid storytelling for kids
  const characters: CharacterSpotlight[] = useMemo(
    () => [
      {
        id: 'curious_explorer',
        name: 'MAXI',
        badgeTitle: 'Brave Explorer',
        roleDescription: 'The adventurous trailblazer who loves discovering hidden secrets!',
        catchphrase: '“Ready for an amazing adventure!”',
        favoriteActivity: 'Climbing tall lookout trees & finding secret animal trails',
        themeColor: '#16A34A', // Vibrant Emerald
        gradientBg: 'from-emerald-500/15 via-green-100/40 to-transparent',
        pedestalGlow: 'from-emerald-400/40 via-green-300/20 to-transparent',
        pillBadgeColor: 'bg-emerald-600',
        badgeEmoji: '🌿',
        isUnlocked: true
      },
      {
        id: 'nature_explorer',
        name: 'MAYA',
        badgeTitle: 'Creative Artist',
        roleDescription: 'The colorful creator who turns every meadow flower into art!',
        catchphrase: '“Let’s paint the meadow with joy!”',
        favoriteActivity: 'Singing with birds & painting rainbow flower paths',
        themeColor: '#E11D48', // Vibrant Rose Pink
        gradientBg: 'from-rose-500/15 via-pink-100/40 to-transparent',
        pedestalGlow: 'from-pink-400/40 via-rose-300/20 to-transparent',
        pillBadgeColor: 'bg-rose-600',
        badgeEmoji: '🌸',
        isUnlocked: true
      },
      {
        id: 'forest_fawn',
        name: 'LUMI',
        badgeTitle: 'Joyful Explorer',
        roleDescription: 'The cheerful little adventurer in a warm purple hoodie and starry smile!',
        catchphrase: '“Ready to discover secret meadow treasures together!”',
        favoriteActivity: 'Finding hidden gold coins & exploring sunny nature trails',
        themeColor: '#9333EA', // Cheerful Lavender & Purple
        gradientBg: 'from-purple-500/15 via-violet-100/40 to-transparent',
        pedestalGlow: 'from-purple-400/40 via-indigo-300/20 to-transparent',
        pillBadgeColor: 'bg-purple-600',
        badgeEmoji: '⭐',
        isUnlocked: true
      },
      {
        id: 'little_inventor',
        name: 'MYSTERY BUDDY',
        badgeTitle: 'Secret Friend',
        roleDescription: 'A playful friend who is waiting for you deeper in Wonder Meadow!',
        catchphrase: '“Complete more quests to unlock me!”',
        favoriteActivity: 'Hiding behind glowing crystal caves and ancient ruins',
        themeColor: '#64748B', // Slate
        gradientBg: 'from-slate-500/15 via-amber-100/30 to-transparent',
        pedestalGlow: 'from-amber-300/30 via-slate-300/20 to-transparent',
        pillBadgeColor: 'bg-slate-600',
        badgeEmoji: '🔒',
        isUnlocked: false
      }
    ],
    []
  );

  // Active selected character index state
  const initialIndex = Math.max(
    0,
    characters.findIndex((c) => c.id === selectedCharacterId)
  );

  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const currentCharacter = characters[activeIndex] || characters[0];
  const isCurrentUnlocked = currentCharacter.isUnlocked;

  // Jump to specific character index
  const selectIndex = (index: number) => {
    audioService.playPop();
    setActiveIndex(index);
    const target = characters[index];
    if (target.isUnlocked) {
      onSelectCharacter(target.id);
      setLockedNotice(null);
    } else {
      setLockedNotice('🌟 Complete more meadow activities to unlock this secret friend!');
      setTimeout(() => setLockedNotice(null), 3500);
    }
  };

  const handlePrev = () => {
    const nextIdx = (activeIndex - 1 + characters.length) % characters.length;
    selectIndex(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % characters.length;
    selectIndex(nextIdx);
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
      setLockedNotice('Please select an available unlocked friend!');
      return;
    }
    audioService.playSparkle();
    onConfirm(currentCharacter.id);
  };

  return (
    <main
      id="choose-your-friend-screen"
      role="main"
      className={`${
        isIngameModal
          ? 'fixed inset-0 z-50 bg-amber-950/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none'
          : 'min-h-[100dvh] w-full bg-gradient-to-b from-[#E0F2FE] via-[#F0FDF4] to-[#DCFCE7] flex flex-col justify-between p-3 sm:p-4 md:p-6 select-none overflow-y-auto overflow-x-hidden'
      }`}
    >
      <div
        className={`w-full mx-auto flex flex-col justify-between flex-1 gap-2 sm:gap-3 md:gap-4 ${
          isIngameModal
            ? 'max-w-4xl max-h-[94vh] bg-[#FFFDF7] rounded-3xl border-2 border-amber-300 shadow-2xl p-4 sm:p-6 overflow-y-auto'
            : 'max-w-5xl'
        }`}
      >
        {/* ============================================================
            1. TOP BAR: Back Button + Clean Centered Title
            ============================================================ */}
        <header className="relative flex items-center justify-between w-full shrink-0 min-h-[48px] sm:min-h-[56px]">
          {/* Back Button */}
          {onBack ? (
            <button
              type="button"
              id="back-btn"
              onClick={() => {
                audioService.playPop();
                onBack();
              }}
              className="h-11 sm:h-12 px-4 rounded-2xl bg-white hover:bg-emerald-50 active:scale-95 text-stone-800 font-display font-black text-sm sm:text-base flex items-center gap-2 border-2 border-emerald-300 shadow-sm cursor-pointer transition-all shrink-0 z-10"
              aria-label="Back to previous screen"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-800 stroke-[2.5]" />
              <span className="hidden xs:inline font-black">Back</span>
            </button>
          ) : (
            <div className="w-12 sm:w-16" />
          )}

          {/* Clean Main Title */}
          <div className="text-center px-2 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-stone-900 tracking-tight leading-tight flex items-center justify-center gap-2">
              <span>Choose Your Companion</span>
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400 animate-bounce" />
            </h1>
            <p className="text-xs sm:text-sm text-emerald-900/80 font-bold mt-0.5 max-w-sm mx-auto">
              Pick your special friend to explore Wonder Meadow!
            </p>
          </div>

          {/* Symmetrical Spacer */}
          <div className="w-12 sm:w-16 shrink-0" />
        </header>

        {/* ============================================================
            2. INTERACTIVE CHARACTER HERO ROSTER (Spotlight Showcase)
               - Large 3D character on a glowing magical meadow pedestal
               - Side navigation arrows with bounce feedback
               - Clean character badge with speech catchphrase & role description
            ============================================================ */}
        <section
          aria-label="Character Spotlight Showcase"
          className="relative w-full flex-1 flex flex-col items-center justify-center my-auto min-h-0 py-1"
        >
          {/* Top Character Selector Switcher Bubbles */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 w-full mb-3 shrink-0 px-2">
            {characters.map((char, index) => {
              const isSelected = index === activeIndex;
              return (
                <button
                  key={char.id}
                  type="button"
                  id={`select-avatar-${char.id}`}
                  onClick={() => selectIndex(index)}
                  className={`relative flex items-center gap-2 px-3 sm:px-5 py-2 rounded-2xl sm:rounded-full font-display font-black text-xs sm:text-sm transition-all duration-300 cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-white text-stone-900 shadow-lg scale-105 sm:scale-110 border-amber-400 ring-3 ring-amber-300 -translate-y-0.5'
                      : 'bg-white/70 hover:bg-white/95 text-stone-600 border-white/80 hover:border-emerald-200 opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Select ${char.name}`}
                >
                  <span className="text-base sm:text-lg">{char.badgeEmoji}</span>
                  <span className="tracking-wide uppercase font-extrabold">{char.name}</span>
                  {isSelected && char.isUnlocked && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[3] animate-in zoom-in" />
                  )}
                  {!char.isUnlocked && (
                    <Lock className="w-3.5 h-3.5 text-stone-400 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* 3D Spotlight Stage Card */}
          <div
            className={`relative w-full max-w-3xl rounded-3xl sm:rounded-[36px] bg-white/90 border-3 ${
              isCurrentUnlocked
                ? 'border-amber-300/90 shadow-[0_15px_35px_rgba(0,0,0,0.08)]'
                : 'border-stone-300 shadow-md'
            } p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 transition-all duration-500 overflow-hidden backdrop-blur-xs`}
          >
            {/* Ambient Background Aura Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-tr ${currentCharacter.gradientBg} -z-10 pointer-events-none transition-all duration-500`}
            />

            {/* Stage Left: 3D Character Hero on Glowing Pedestal with Navigation Arrows */}
            <div className="relative flex-1 w-full flex items-center justify-center min-h-[220px] sm:min-h-[260px] md:min-h-[300px]">
              {/* Previous Character Arrow */}
              <button
                type="button"
                id="prev-character-btn"
                onClick={handlePrev}
                className="absolute left-0 sm:left-2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white hover:bg-emerald-50 text-stone-800 shadow-md border-2 border-emerald-200 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                aria-label="Previous character"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] text-stone-800" />
              </button>

              {/* Magical Glowing Pedestal Effect under 3D Character */}
              <div className="relative flex flex-col items-center justify-end w-full max-w-[280px] h-full mx-auto">
                {/* Concentric Pedestal Rings */}
                <div
                  className={`absolute bottom-0 w-44 sm:w-56 h-12 rounded-[100%] bg-gradient-to-t ${currentCharacter.pedestalGlow} blur-sm -z-10 animate-pulse`}
                />
                <div className="absolute bottom-1 w-36 sm:w-44 h-7 rounded-[100%] bg-white/70 border-2 border-amber-300/60 shadow-xs -z-10" />

                {/* 3D Character Visual Component */}
                <CharacterVisual
                  characterId={currentCharacter.id}
                  isUnlocked={currentCharacter.isUnlocked}
                  isSelected={true}
                  size="hero"
                />
              </div>

              {/* Next Character Arrow */}
              <button
                type="button"
                id="next-character-btn"
                onClick={handleNext}
                className="absolute right-0 sm:right-2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white hover:bg-emerald-50 text-stone-800 shadow-md border-2 border-emerald-200 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                aria-label="Next character"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] text-stone-800" />
              </button>
            </div>

            {/* Stage Right: Clean, Engaging Character Info & Speech Bubble */}
            <div className="flex-1 w-full flex flex-col justify-center text-left space-y-3 sm:space-y-4">
              {/* Header Title & Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-display font-black text-white shadow-xs flex items-center gap-1.5 ${currentCharacter.pillBadgeColor}`}
                >
                  <span>{currentCharacter.badgeEmoji}</span>
                  <span>{currentCharacter.badgeTitle}</span>
                </span>

                {isCurrentUnlocked ? (
                  <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-display font-black text-xs flex items-center gap-1 shadow-xs">
                    <Stars className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span>READY TO EXPLORE</span>
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-stone-600 stroke-[2.5]" />
                    <span>SECRET LOCKED FRIEND</span>
                  </span>
                )}
              </div>

              {/* Character Big Name */}
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-stone-900 tracking-tight leading-none">
                  {currentCharacter.name}
                </h2>
                <p className="text-sm sm:text-base text-stone-700 font-bold mt-1 leading-snug">
                  {currentCharacter.roleDescription}
                </p>
              </div>

              {/* Fun Catchphrase Speech Bubble */}
              {isCurrentUnlocked && (
                <div className="relative rounded-2xl bg-amber-50/90 border-2 border-amber-200 p-3 sm:p-4 text-stone-800 shadow-xs">
                  <div className="text-xs font-extrabold text-amber-800 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-amber-600" />
                    <span>Says to you:</span>
                  </div>
                  <p className="text-sm sm:text-base font-display font-black text-stone-900 italic">
                    {currentCharacter.catchphrase}
                  </p>
                </div>
              )}

              {/* Favorite Meadow Activity */}
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-3 text-stone-800">
                <div className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Favorite Activity:</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-stone-700">
                  {currentCharacter.favoriteActivity}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gentle Notice for Locked Friend */}
        {lockedNotice && (
          <div
            role="status"
            className="shrink-0 my-1 py-1.5 px-5 rounded-full bg-amber-100 border-2 border-amber-300 text-stone-900 text-xs sm:text-sm font-bold text-center mx-auto shadow-sm animate-in fade-in flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-600 fill-amber-400" />
            <span>{lockedNotice}</span>
          </div>
        )}

        {/* ============================================================
            3. FOOTER: BIG PRIMARY CALL-TO-ACTION BUTTON
            ============================================================ */}
        <footer className="w-full shrink-0 flex flex-col items-center justify-center pt-1 pb-1 sm:pt-2">
          <button
            type="button"
            id="lets-explore-btn"
            onClick={handleExplore}
            className="w-full sm:w-auto min-w-[280px] sm:min-w-[380px] h-14 sm:h-16 px-8 sm:px-12 rounded-2xl sm:rounded-3xl font-display font-black text-lg sm:text-xl md:text-2xl text-white shadow-xl hover:shadow-2xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3 border-2 border-white/40"
            style={{
              backgroundColor: isCurrentUnlocked ? currentCharacter.themeColor : '#94A3B8',
              cursor: isCurrentUnlocked ? 'pointer' : 'not-allowed'
            }}
            aria-label={`Start Exploring Wonder Meadow with ${currentCharacter.name}`}
          >
            <span>Let's Explore With {currentCharacter.name.split(' ')[0]}!</span>
            <Sparkles className="w-6 h-6 fill-white text-white animate-pulse" />
          </button>
        </footer>
      </div>
    </main>
  );
};
