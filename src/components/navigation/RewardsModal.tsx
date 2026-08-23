import React from 'react';
import { UserProgress, ExplorerCharacterId } from '../../types';
import { EXPLORER_CHARACTERS, CHARACTER_UNLOCK_CONDITIONS, isCharacterUnlocked } from '../../data/charactersData';
import { CharacterVisual } from '../welcome/CharacterVisual';
import { audioService } from '../../utils/audio';
import { X, Star, Sparkles, Award, Lock, Check } from 'lucide-react';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  activeCharacterId: ExplorerCharacterId;
  onSelectCharacter: (charId: ExplorerCharacterId) => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  progress,
  activeCharacterId,
  onSelectCharacter
}) => {
  if (!isOpen) return null;

  const userStars = progress.stars;

  return (
    <div
      id="rewards-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-amber-950/40 backdrop-blur-xs animate-in fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewards-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-[#FFFDF7] rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 bg-amber-50/90 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs font-black">
              <Star className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <h3 id="rewards-modal-title" className="text-lg md:text-xl font-display font-black text-amber-950">
                Rewards & Friends
              </h3>
              <p className="text-xs text-slate-700 font-medium">
                See all the Wonder Stars and Explorer Friends you've unlocked!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white hover:bg-amber-100/60 text-slate-700 flex items-center justify-center shadow-xs border border-amber-200 cursor-pointer active:scale-95 transition-all"
            aria-label="Close Rewards"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto space-y-6 bg-[#FAF8F5]">
          {/* Top Star Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-100 border-2 border-amber-300/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-3xl shadow-sm">
                ⭐
              </div>
              <div>
                <span className="text-xs font-display font-bold uppercase tracking-wider text-amber-800">
                  Total Wonder Stars
                </span>
                <h4 className="text-3xl font-display font-black text-amber-950">
                  {userStars} Stars Collected
                </h4>
                <p className="text-xs text-amber-900 mt-0.5">
                  Keep exploring zones to discover letters, animals, fruits, and unlock new friends!
                </p>
              </div>
            </div>
          </div>

          {/* Explorer Friends Collection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-display font-black text-amber-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>My Explorer Friends</span>
              </h4>
              <span className="text-xs font-bold text-slate-600">
                Tap an unlocked friend to switch!
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
              {EXPLORER_CHARACTERS.map((char) => {
                const isSelected = char.id === activeCharacterId;
                const isUnlocked = isCharacterUnlocked(char.id, progress);
                const condition = CHARACTER_UNLOCK_CONDITIONS[char.id];

                return (
                  <button
                    key={char.id}
                    onClick={() => {
                      if (isUnlocked && !char.isFutureSlot) {
                        audioService.playPop();
                        onSelectCharacter(char.id);
                      }
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                      isUnlocked && !char.isFutureSlot ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-75'
                    } ${
                      isSelected
                        ? 'bg-white border-sky-500 ring-2 ring-sky-300 shadow-md'
                        : isUnlocked && !char.isFutureSlot
                        ? 'bg-white border-amber-200 hover:border-amber-300'
                        : 'bg-stone-100 border-stone-200'
                    }`}
                  >
                    <div className="mb-1">
                      <CharacterVisual
                        characterId={char.id}
                        isUnlocked={isUnlocked}
                        isSelected={isSelected}
                        size="sm"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs font-display font-black text-amber-950 leading-tight">
                        {char.name}
                      </span>
                      {isSelected && isUnlocked && (
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-slate-600 mt-0.5">
                      {isUnlocked && !char.isFutureSlot
                        ? isSelected
                          ? 'Active'
                          : 'Ready'
                        : char.isFutureSlot
                        ? 'Soon'
                        : `${condition.requiredStars}⭐`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Achievement Badges */}
          <div>
            <h4 className="text-base font-display font-black text-amber-950 flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Explorer Badges</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-white border border-amber-200 flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <h5 className="text-xs font-display font-bold text-amber-950">Sprout Explorer</h5>
                  <p className="text-[11px] text-slate-600">First steps in meadow</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-amber-200 flex items-center gap-3">
                <span className="text-2xl">🔤</span>
                <div>
                  <h5 className="text-xs font-display font-bold text-amber-950">Letter Finder</h5>
                  <p className="text-[11px] text-slate-600">Visited Alphabet Grove</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-amber-200 flex items-center gap-3">
                <span className="text-2xl">🐾</span>
                <div>
                  <h5 className="text-xs font-display font-bold text-amber-950">Animal Pal</h5>
                  <p className="text-[11px] text-slate-600">Sang with forest friends</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-amber-200 flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h5 className="text-xs font-display font-bold text-amber-950">Starlight Seeker</h5>
                  <p className="text-[11px] text-slate-600">Counted twinkling stars</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
