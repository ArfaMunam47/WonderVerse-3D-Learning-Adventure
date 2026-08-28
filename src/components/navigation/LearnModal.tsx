import React, { useState } from 'react';
import { WORLD_ZONES } from '../../data/worldZones';
import { WorldZoneId } from '../../types';
import { audioService } from '../../utils/audio';
import {
  X,
  BookOpen,
  Star,
  Sparkles,
  Volume2,
  Smile,
  Heart,
  Music,
  Palette,
  Compass,
  ArrowRight,
  Sun,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LearnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectZone: (zoneId: WorldZoneId) => void;
  activeZoneId: WorldZoneId | null;
  zoneVisits?: Record<string, number>;
}

// Special Toddler & Sensory Learning Pillars
interface SensoryLearningCard {
  id: WorldZoneId;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  skills: string[];
  speechPrompt: string;
  downSyndromeFriendly: string;
}

const LEARNING_EXPERIENCES: SensoryLearningCard[] = [
  {
    id: 'alphabet',
    title: 'Phonics & Talking Letters',
    subtitle: 'A to Z letters with voice, spoken words & picture flashcards',
    badge: 'Language & Speech',
    icon: '🔤',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    accentColor: 'text-emerald-700',
    skills: ['Letter sounds (A-Z)', 'Phonics vocabulary', 'Spoken voice repetition'],
    speechPrompt: 'Let us explore Alphabet Grove! Letters and spoken sounds for you!',
    downSyndromeFriendly: 'High visual contrast, slow spoken phonics, zero time pressure.'
  },
  {
    id: 'numbers',
    title: 'Counting Valley & Balloons',
    subtitle: 'Tap and count 1 to 10 with harmonic xylophone notes',
    badge: 'Numeracy & Logic',
    icon: '🔢',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-300',
    accentColor: 'text-sky-700',
    skills: ['Counting 1-10', 'Number recognition', 'Musical tone feedback'],
    speechPrompt: 'Welcome to Number Valley! Let us count friendly balloons together!',
    downSyndromeFriendly: 'Large tactile tap targets, visual balloon popping, one-to-one correspondence.'
  },
  {
    id: 'animals',
    title: 'Animal Pals & Emotions',
    subtitle: 'Real animal sounds, gentle cuddles & understanding feelings',
    badge: 'Social & Emotional',
    icon: '🦁',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    accentColor: 'text-amber-800',
    skills: ['Authentic animal calls', 'Emotion recognition (Happy, Calm)', 'Gentle empathy'],
    speechPrompt: 'Let us visit Animal Woods! Meet the happy lion, gentle bear, and singing birds!',
    downSyndromeFriendly: 'Emotion modeling with big clear faces and soothing real animal acoustics.'
  },
  {
    id: 'fruits',
    title: 'Fruit Orchard & Colors',
    subtitle: 'Identify vibrant colors, sweet fruits, and shapes in the trees',
    badge: 'Sensory & Colors',
    icon: '🍎',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    accentColor: 'text-rose-700',
    skills: ['Color identification', 'Healthy fruits', 'Shape recognition'],
    speechPrompt: 'Fruit Orchard is full of bright red apples, golden bananas, and juicy berries!',
    downSyndromeFriendly: 'Multi-sensory color matching and cheerful harvest celebration.'
  },
  {
    id: 'music',
    title: 'Melody Bells & Xylophone',
    subtitle: 'Play soothing melodies, bell chimes, and calming musical patterns',
    badge: 'Rhythm & Sound',
    icon: '🎵',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    accentColor: 'text-purple-800',
    skills: ['Harmonic chimes', 'Cause-and-effect auditory loop', 'Musical rhythm'],
    speechPrompt: 'Music Meadow! Tap the glowing rainbow bells to make your own song!',
    downSyndromeFriendly: 'Calming pentatonic notes that always sound harmonious and soothing.'
  },
  {
    id: 'creative',
    title: 'Magic Finger Paint & Stickers',
    subtitle: 'Freeform sensory drawing with rainbow brushes and sparkle stamps',
    badge: 'Motor Skills & Art',
    icon: '🎨',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    accentColor: 'text-orange-800',
    skills: ['Fine motor coordination', 'Creative self-expression', 'Glitter stamps'],
    speechPrompt: 'Creative Studio is ready! Paint with rainbow colors and cheerful stamps!',
    downSyndromeFriendly: 'Error-free open canvas, satisfying tactile trail lines.'
  },
  {
    id: 'stories',
    title: 'Gentle Storybook Pavilion',
    subtitle: 'Illustrated voice-read bedtime and adventure tales for young minds',
    badge: 'Listening & Focus',
    icon: '📖',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    accentColor: 'text-indigo-800',
    skills: ['Listening comprehension', 'Synchronized word highlight', 'Gentle narration'],
    speechPrompt: 'Story Pavilion! Sit by the cozy fireplace and listen to a wonderful tale.',
    downSyndromeFriendly: 'Paced narration, expressive vocal inflections, calm visual pacing.'
  },
  {
    id: 'stars',
    title: 'Stargazer Observatory & Calming',
    subtitle: 'Gentle twinkling constellations and relaxing breathing stars',
    badge: 'Sensory Calming & Wonder',
    icon: '⭐',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    accentColor: 'text-slate-800',
    skills: ['Emotional regulation', 'Deep calming breaths', 'Constellation patterns'],
    speechPrompt: 'Stargazer Peak! Watch the gentle twinkling stars and relax your mind.',
    downSyndromeFriendly: 'Calm sensory environment designed to soothe anxiety or sensory overload.'
  }
];

export const LearnModal: React.FC<LearnModalProps> = ({
  isOpen,
  onClose,
  onSelectZone,
  activeZoneId,
  zoneVisits = {}
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'speech' | 'sensory' | 'calm'>('all');

  if (!isOpen) return null;

  const handleStartActivity = (exp: SensoryLearningCard) => {
    audioService.playSparkle();
    audioService.speak(exp.speechPrompt);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.5 } });
    onSelectZone(exp.id);
    onClose();
  };

  const filteredExperiences = LEARNING_EXPERIENCES.filter((exp) => {
    if (filterCategory === 'speech') return exp.id === 'alphabet' || exp.id === 'stories' || exp.id === 'animals';
    if (filterCategory === 'sensory') return exp.id === 'music' || exp.id === 'creative' || exp.id === 'fruits';
    if (filterCategory === 'calm') return exp.id === 'stars' || exp.id === 'stories' || exp.id === 'music';
    return true;
  });

  return (
    <div
      id="learn-adventures-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-stone-900/60 backdrop-blur-sm animate-in fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="learn-modal-title"
    >
      <div className="relative w-full max-w-5xl bg-[#FFFDF7] rounded-3xl md:rounded-[36px] shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header - Clean, High Contrast, Friendly */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-100 border-b-2 border-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-md text-2xl md:text-3xl">
              <span>🎓</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                  Toddler & Down Syndrome Inclusive
                </span>
              </div>
              <h3 id="learn-modal-title" className="text-xl md:text-2xl font-display font-black text-stone-900 leading-tight mt-0.5">
                Wonder Learning Experiences
              </h3>
              <p className="text-xs md:text-sm text-stone-700 font-bold">
                Tap any adventure to start exploring with voice and gentle music!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-600 flex items-center justify-center shadow-md border-2 border-amber-300 cursor-pointer active:scale-95 transition-all"
            aria-label="Close Learning Adventures"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Filter Pill Buttons (Large, Accessible) */}
        <div className="p-3 md:px-6 bg-amber-50/70 border-b border-amber-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-black text-stone-600 uppercase tracking-wide mr-1 hidden sm:inline">
            Filter:
          </span>
          <button
            onClick={() => {
              audioService.playPop();
              setFilterCategory('all');
            }}
            className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-display font-black cursor-pointer transition-all border ${
              filterCategory === 'all'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-105'
                : 'bg-white hover:bg-amber-100/70 text-stone-800 border-amber-300'
            }`}
          >
            🌟 All 8 Adventures
          </button>

          <button
            onClick={() => {
              audioService.playPop();
              setFilterCategory('speech');
            }}
            className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-display font-black cursor-pointer transition-all border ${
              filterCategory === 'speech'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105'
                : 'bg-white hover:bg-emerald-50 text-stone-800 border-emerald-300'
            }`}
          >
            🗣️ Speech & Phonics
          </button>

          <button
            onClick={() => {
              audioService.playPop();
              setFilterCategory('sensory');
            }}
            className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-display font-black cursor-pointer transition-all border ${
              filterCategory === 'sensory'
                ? 'bg-purple-600 text-white border-purple-700 shadow-sm scale-105'
                : 'bg-white hover:bg-purple-50 text-stone-800 border-purple-300'
            }`}
          >
            🎵 Music & Sensory Art
          </button>

          <button
            onClick={() => {
              audioService.playPop();
              setFilterCategory('calm');
            }}
            className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-display font-black cursor-pointer transition-all border ${
              filterCategory === 'calm'
                ? 'bg-sky-600 text-white border-sky-700 shadow-sm scale-105'
                : 'bg-white hover:bg-sky-50 text-stone-800 border-sky-300'
            }`}
          >
            🧘 Calm & Bedtime
          </button>
        </div>

        {/* Big Accessible Adventure Cards Grid */}
        <div className="p-4 md:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 bg-[#FAF8F5]">
          {filteredExperiences.map((exp) => {
            const isCurrent = activeZoneId === exp.id;
            const visits = zoneVisits[exp.id] || 0;

            return (
              <div
                key={exp.id}
                id={`learn-activity-card-${exp.id}`}
                className={`p-4 md:p-5 rounded-3xl border-3 transition-all flex flex-col justify-between shadow-md relative group bg-white ${
                  isCurrent
                    ? 'border-sky-500 ring-4 ring-sky-300 shadow-lg'
                    : `${exp.borderColor} hover:shadow-xl hover:scale-[1.01]`
                }`}
              >
                <div>
                  {/* Top Bar inside card */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-sm">
                        <span>{exp.icon}</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-300 block w-fit">
                          {exp.badge}
                        </span>
                        <h4 className="font-display font-black text-lg md:text-xl text-stone-900 leading-tight mt-1">
                          {exp.title}
                        </h4>
                      </div>
                    </div>

                    {visits > 0 && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Played {visits}x</span>
                      </span>
                    )}
                  </div>

                  {/* Subtitle description */}
                  <p className="text-xs md:text-sm text-stone-700 font-medium leading-relaxed mb-3">
                    {exp.subtitle}
                  </p>

                  {/* Key Skills Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {exp.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>

                  {/* Special Needs & Down Syndrome Benefit */}
                  <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-900 font-semibold flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><b>Gentle ECE Design:</b> {exp.downSyndromeFriendly}</span>
                  </div>
                </div>

                {/* Big Action Button */}
                <button
                  onClick={() => handleStartActivity(exp)}
                  className="w-full mt-4 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-display font-black text-sm md:text-base shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-amber-400"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Start Adventure With Voice</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info for parents and educators */}
        <div className="p-3.5 md:p-4 bg-amber-100/90 border-t-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-800 font-bold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Inclusive Early Childhood Development • No Failure States • Self-Paced Exploration</span>
          </div>
          <span className="text-amber-950">100% Ad-Free Safe Garden</span>
        </div>
      </div>
    </div>
  );
};
