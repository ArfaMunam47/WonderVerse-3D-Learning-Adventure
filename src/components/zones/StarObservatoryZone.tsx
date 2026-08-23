import React, { useState, useEffect } from 'react';
import { EMOTIONS_DATA } from '../../data/worldZones';
import { EmotionItem } from '../../types';
import { audioService } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  Moon,
  Heart,
  ArrowLeft,
  Award,
  RefreshCw,
  Wind
} from 'lucide-react';

interface StarObservatoryZoneProps {
  totalStars: number;
  onEarnStar: () => void;
  onBack: () => void;
}

type StarTab = 'emotions' | 'breathing' | 'stargazing' | 'rewards';

const CONSTELLATIONS = [
  { id: 'bear', name: 'The Gentle Meadow Bear', stars: '7 Stars', icon: '🐻', myth: 'Watches over all sleepy forest friends.' },
  { id: 'duck', name: 'The Golden Duckling', stars: '5 Stars', icon: '🦆', myth: 'Guides wanderers safely home across shimmering ponds.' },
  { id: 'tree', name: 'The Great Whispering Oak', stars: '8 Stars', icon: '🌳', myth: 'Provides shade and wisdom to all dreamers.' },
  { id: 'harp', name: 'The Starlight Chime Harp', stars: '6 Stars', icon: '🎵', myth: 'Plays lullabies through the night breeze.' }
];

export const StarObservatoryZone: React.FC<StarObservatoryZoneProps> = ({
  totalStars,
  onEarnStar,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<StarTab>('emotions');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionItem>(EMOTIONS_DATA[0]);

  // Mindfulness Breathing Bubble State
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCount, setBreathCount] = useState<number>(0);

  useEffect(() => {
    if (activeTab !== 'breathing') return;
    const interval = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleSelectEmotion = (item: EmotionItem) => {
    setSelectedEmotion(item);
    audioService.playPop();
    audioService.speak(`${item.name}! ${item.description}. Tip: ${item.copingTip}`);
  };

  const handleCompleteBreath = () => {
    audioService.playSparkle();
    const nextCount = breathCount + 1;
    setBreathCount(nextCount);
    confetti({ particleCount: 40, spread: 60 });
    onEarnStar();
  };

  return (
    <div id="star-observatory-container" className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-slate-900/95 text-white backdrop-blur-md rounded-3xl shadow-2xl border-2 border-indigo-500/60">
      {/* Header with Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-indigo-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audioService.playPop();
              onBack();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-950/90 hover:bg-indigo-900 text-amber-200 font-extrabold transition-all text-sm shadow-xs border border-indigo-700/80 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back to Meadow</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-display font-black text-xl shadow-md">
              ⭐
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-black text-amber-300">
                Star Observatory & Mindfulness
              </h2>
              <p className="text-xs text-indigo-200 font-medium">
                Feelings garden, calm breathing, and bedtime stars
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-indigo-950/90 p-1.5 rounded-2xl border border-indigo-800 flex-wrap">
          <button
            onClick={() => {
              setActiveTab('emotions');
              audioService.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'emotions'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-indigo-200 hover:bg-indigo-900'
            }`}
          >
            Feelings Garden
          </button>
          <button
            onClick={() => {
              setActiveTab('breathing');
              audioService.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'breathing'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-indigo-200 hover:bg-indigo-900'
            }`}
          >
            Calm Breathing
          </button>
          <button
            onClick={() => {
              setActiveTab('stargazing');
              audioService.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'stargazing'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-indigo-200 hover:bg-indigo-900'
            }`}
          >
            Constellations
          </button>
          <button
            onClick={() => {
              setActiveTab('rewards');
              audioService.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-indigo-200 hover:bg-indigo-900'
            }`}
          >
            Star Badges ({totalStars})
          </button>
        </div>
      </div>

      {/* Tab 1: Feelings Garden (8 Emotions) */}
      {activeTab === 'emotions' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Emotions Grid */}
          <div className="lg:col-span-7 bg-indigo-950/60 p-4 rounded-3xl border border-indigo-800/80">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {EMOTIONS_DATA.map((emo) => (
                <button
                  key={emo.id}
                  onClick={() => handleSelectEmotion(emo)}
                  className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all transform active:scale-95 border-2 ${
                    selectedEmotion.id === emo.id
                      ? 'bg-indigo-800/80 border-amber-400 shadow-lg scale-105 ring-2 ring-amber-300/40'
                      : 'bg-indigo-900/40 hover:bg-indigo-900/80 border-indigo-700/60'
                  }`}
                >
                  <span className="text-4xl">{emo.emoji}</span>
                  <span className="text-xs font-bold text-amber-200">{emo.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emotion Insight & Coping Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900/80 to-purple-900/60 p-6 rounded-3xl border-2 border-indigo-500/60 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-indigo-800 text-amber-300 text-xs font-bold uppercase tracking-wider">
                Emotion Spotlight
              </span>
              <button
                onClick={() => {
                  audioService.playPop();
                  audioService.speak(`${selectedEmotion.name}! ${selectedEmotion.description}. Helpful idea: ${selectedEmotion.copingTip}`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-800/80 hover:bg-indigo-700 text-amber-300 font-bold text-xs shadow-sm border border-indigo-600"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Voice</span>
              </button>
            </div>

            <div className="my-6 text-center">
              <div className="text-7xl mb-2">{selectedEmotion.emoji}</div>
              <h3 className="text-3xl font-display font-extrabold text-amber-300">
                {selectedEmotion.name}
              </h3>
              <p className="text-sm text-indigo-200 mt-2 font-medium">
                {selectedEmotion.description}
              </p>
            </div>

            <div className="bg-indigo-950/80 p-4 rounded-2xl border border-indigo-700/80">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
                <Heart className="w-3.5 h-3.5" />
                <span>Comforting Idea:</span>
              </div>
              <p className="text-xs text-indigo-100 font-medium">
                {selectedEmotion.copingTip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Calm Breathing Activity */}
      {activeTab === 'breathing' && (
        <div className="mt-6 text-center max-w-xl mx-auto py-6">
          <h3 className="text-2xl font-display font-extrabold text-amber-300 mb-2">
            Gentle Meadow Breathing
          </h3>
          <p className="text-xs text-indigo-200 mb-8">
            Breathe in soft starlight, hold gently, and breathe out slowly.
          </p>

          {/* Animated Pulsing Breathing Sphere */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            <div
              className={`absolute rounded-full border-4 border-amber-400/40 bg-gradient-to-br from-indigo-500/30 to-amber-500/20 transition-all duration-[4000ms] ease-in-out ${
                breathPhase === 'Inhale'
                  ? 'w-64 h-64 scale-100 shadow-[0_0_50px_rgba(251,191,36,0.5)]'
                  : breathPhase === 'Hold'
                  ? 'w-64 h-64 scale-105 shadow-[0_0_60px_rgba(251,191,36,0.6)]'
                  : 'w-32 h-32 scale-75 shadow-none'
              }`}
            />
            <div className="relative z-10 text-center">
              <Wind className="w-8 h-8 text-amber-300 mx-auto mb-1 animate-pulse" />
              <div className="text-2xl font-display font-extrabold text-amber-200">
                {breathPhase}
              </div>
              <div className="text-xs text-indigo-200 mt-1">4 seconds</div>
            </div>
          </div>

          <button
            onClick={handleCompleteBreath}
            className="mt-8 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all active:scale-95"
          >
            I feel peaceful & calm ⭐
          </button>
        </div>
      )}

      {/* Tab 3: Constellations */}
      {activeTab === 'stargazing' && (
        <div className="mt-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-display font-extrabold text-amber-300">
              Meadow Night Sky Constellations
            </h3>
            <p className="text-xs text-indigo-200">
              Look up at the sparkling celestial stars above Wonder Meadow
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {CONSTELLATIONS.map((c) => (
              <div
                key={c.id}
                className="bg-indigo-950/70 p-5 rounded-3xl border border-indigo-700/80 flex items-start gap-4"
              >
                <span className="text-5xl">{c.icon}</span>
                <div>
                  <h4 className="font-display font-bold text-base text-amber-200">
                    {c.name}
                  </h4>
                  <div className="text-xs font-semibold text-indigo-300 mt-0.5">
                    {c.stars}
                  </div>
                  <p className="text-xs text-indigo-200 mt-2">
                    {c.myth}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Star Badges & Progress */}
      {activeTab === 'rewards' && (
        <div className="mt-6 text-center max-w-2xl mx-auto py-6">
          <div className="w-24 h-24 rounded-full bg-amber-500/20 border-4 border-amber-400 flex items-center justify-center text-5xl mx-auto mb-4 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            ⭐
          </div>
          <h3 className="text-3xl font-display font-extrabold text-amber-300">
            {totalStars} Wonder Stars Collected!
          </h3>
          <p className="text-sm text-indigo-200 max-w-md mx-auto mt-2">
            Every learning activity in Alphabet Grove, Number Meadow, Fruit Orchard, Animal Friends, Creative Corner, and Music Bells earns glowing stars!
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-8">
            {Array.from({ length: 6 }).map((_, i) => {
              const hasBadge = totalStars >= (i + 1) * 3;
              return (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 ${
                    hasBadge
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-indigo-950/40 border-indigo-800 text-indigo-500 opacity-60'
                  }`}
                >
                  <span className="text-2xl">{hasBadge ? '🏅' : '🔒'}</span>
                  <span className="text-[10px] font-bold">{(i + 1) * 3} Stars</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
