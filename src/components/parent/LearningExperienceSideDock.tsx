import React, { useState } from 'react';
import { UserProgress, WorldZoneId, ExplorerCharacterId } from '../../types';
import { WORLD_ZONES } from '../../data/worldZones';
import { getCharacterById } from '../../data/charactersData';
import { audioService } from '../../utils/audio';
import {
  Sparkles,
  BookOpen,
  Star,
  Shield,
  Volume2,
  VolumeX,
  X,
  Compass,
  Award,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface LearningExperienceSideDockProps {
  progress?: UserProgress | { stars: number; zoneVisits?: Record<string, number>; favoriteZone?: string } | null;
  characterId: ExplorerCharacterId;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenParentDashboard: () => void;
  onReturnToStartGate: () => void;
  onOpenCharacterPicker: () => void;
  onSelectZone: (zoneId: WorldZoneId) => void;
}

const LEARNING_PILLARS = [
  {
    zoneId: 'alphabet' as WorldZoneId,
    title: 'Phonics & Early Literacy',
    subtitle: 'Alphabet Grove',
    icon: '🔤',
    skills: 'Letter names, phonics sounds, initial letter vocabulary',
    color: '#0284C7'
  },
  {
    zoneId: 'numbers' as WorldZoneId,
    title: 'Numeracy & Spatial Counting',
    subtitle: 'Number Meadow',
    icon: '🔢',
    skills: 'Counting 1-10, stepping stone sequences, quantities',
    color: '#F59E0B'
  },
  {
    zoneId: 'fruits' as WorldZoneId,
    title: 'Colors, Nature & Healthy Habits',
    subtitle: 'Fruit Orchard',
    icon: '🍎',
    skills: 'Color identification, fruit naming, sorting',
    color: '#EC4899'
  },
  {
    zoneId: 'animals' as WorldZoneId,
    title: 'Empathy & Creature Care',
    subtitle: 'Animal Friends',
    icon: '🐰',
    skills: 'Animal sounds, habitats, gentle interactions',
    color: '#16A34A'
  },
  {
    zoneId: 'music' as WorldZoneId,
    title: 'Rhythm & Auditory Memory',
    subtitle: 'Music Bells',
    icon: '🔔',
    skills: 'Melodic pitch, rhythm coordination, sound sequencing',
    color: '#8B5CF6'
  },
  {
    zoneId: 'stories' as WorldZoneId,
    title: 'Storytelling & Emotional Growth',
    subtitle: 'Story Pavilion',
    icon: '📖',
    skills: 'Active listening, story comprehension, kindness morals',
    color: '#F97316'
  }
];

export const LearningExperienceSideDock: React.FC<LearningExperienceSideDockProps> = ({
  progress,
  characterId,
  soundEnabled = true,
  onToggleSound,
  onOpenParentDashboard,
  onReturnToStartGate,
  onOpenCharacterPicker,
  onSelectZone
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const character = getCharacterById(characterId);
  const starsCount = progress ? ('stars' in progress ? progress.stars : 0) : 0;

  const handleToggleOpen = () => {
    audioService.playPop();
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* =========================================================================
          SLEEK SIDE LEARNING POINT / BADGE (Pinned to Right Edge)
          ========================================================================= */}
      <aside className="fixed right-3 sm:right-4 top-4 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        {/* The Parent Learning Experience Point Trigger */}
        <button
          id="learning-experience-side-point-btn"
          onClick={handleToggleOpen}
          className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-2xl sm:rounded-full bg-white/95 hover:bg-white text-stone-900 shadow-xl border-2 border-emerald-400 font-sans font-bold text-xs sm:text-sm cursor-pointer active:scale-95 transition-all backdrop-blur-md ${
            isOpen ? 'ring-4 ring-emerald-300 bg-emerald-50' : 'hover:shadow-2xl'
          }`}
          title="Explore Early Learning Milestones & Pedagogical Framework (For Parents & Caregivers)"
          aria-label="Open Learning Experience Point"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-sm">
            🌱
          </div>
          <span className="font-extrabold text-stone-900 tracking-tight">
            Learning Experience
          </span>
          <div className="flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-xs font-black">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>{starsCount}</span>
          </div>
        </button>

        {/* Minimal Audio & Character Control Sub-pills (Unobtrusive) */}
        {!isOpen && (
          <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            {onToggleSound && (
              <button
                onClick={() => {
                  audioService.playPop();
                  onToggleSound();
                }}
                className="p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md border border-stone-200 text-xs transition-all active:scale-95"
                title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-700" /> : <VolumeX className="w-4 h-4 text-rose-600" />}
              </button>
            )}

            <button
              onClick={() => {
                audioService.playPop();
                onOpenCharacterPicker();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md border border-stone-200 text-xs font-bold transition-all active:scale-95"
              title={`Switch Character (Playing as ${character.name})`}
            >
              <span>{character.avatarEmoji}</span>
              <span className="hidden md:inline">{character.name}</span>
            </button>
          </div>
        )}
      </aside>

      {/* =========================================================================
          PARENT LEARNING EXPERIENCE SLIDE-OUT PANEL
          ========================================================================= */}
      {isOpen && (
        <div
          id="learning-experience-side-drawer-backdrop"
          className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            id="learning-experience-side-drawer"
            className="w-full max-w-md bg-[#FFFDF7] h-full shadow-2xl border-l-4 border-emerald-400 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 bg-gradient-to-r from-emerald-50 to-amber-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-lg">
                  🌱
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-stone-900 font-sans leading-tight">
                    Learning Experience Point
                  </h3>
                  <p className="text-xs text-stone-600 font-medium">
                    Curriculum Framework & Insights for Parents
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                aria-label="Close Learning Point"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Explorer Summary & Star Counter */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-inner">
                    {character.avatarEmoji}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Active Companion
                    </div>
                    <div className="font-extrabold text-stone-900 text-base">
                      {character.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-amber-400/20 px-3 py-1.5 rounded-full border border-amber-300 text-amber-900 font-black text-sm">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{starsCount} Stars Earned</span>
                </div>
              </div>

              {/* Learning Curriculum Pillars */}
              <div>
                <h4 className="font-bold text-xs text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Educational Zones & Skill Goals</span>
                </h4>

                <div className="space-y-2">
                  {LEARNING_PILLARS.map((pillar) => (
                    <button
                      key={pillar.zoneId}
                      onClick={() => {
                        audioService.playPop();
                        setIsOpen(false);
                        onSelectZone(pillar.zoneId);
                      }}
                      className="w-full text-left bg-white hover:bg-emerald-50/50 p-3 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all flex items-start gap-3 group cursor-pointer shadow-2xs"
                    >
                      <div className="text-2xl mt-0.5">{pillar.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-sm group-hover:text-emerald-800 transition-colors">
                            {pillar.title}
                          </span>
                          <span className="text-[11px] font-semibold text-stone-400 group-hover:text-emerald-700 flex items-center gap-0.5">
                            Explore <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 font-normal mt-0.5 leading-snug">
                          {pillar.skills}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Gate & Character Switch Quick Actions */}
              <div className="pt-2 border-t border-stone-200 flex flex-col gap-2">
                <button
                  onClick={() => {
                    audioService.playPop();
                    setIsOpen(false);
                    onReturnToStartGate();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-amber-300"
                >
                  <span>⛩️ Return to Adventure Start Gate</span>
                </button>
              </div>
            </div>

            {/* Footer with Parent Dashboard Button */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  audioService.playPop();
                  setIsOpen(false);
                  onOpenParentDashboard();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Full Parent Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
