import React, { useState } from 'react';
import { LetterItem, FruitItem, AnimalItem, NumberItem, WorldZoneId } from '../../types';
import { audioService } from '../../utils/audio';
import { X, Sparkles, Volume2, ArrowRight, Star, ChevronLeft, ChevronRight, CheckCircle2, HelpCircle } from 'lucide-react';

export type InWorldDiscoveryType =
  | { type: 'letter'; item: LetterItem; index: number }
  | { type: 'fruit'; item: FruitItem; index: number }
  | { type: 'animal'; item: AnimalItem; index: number }
  | { type: 'number'; item: NumberItem; index: number }
  | { type: 'star'; starId: string; description: string }
  | { type: 'guide'; title: string; message: string }
  | {
      type: 'obstacle';
      obstacleId: string;
      title: string;
      subtitle: string;
      question: string;
      options: { label: string; icon: string; isCorrect: boolean; feedback: string }[];
      themeColor: string;
      rewardZone?: WorldZoneId;
    };

interface InWorldDiscoveryModalProps {
  discovery: InWorldDiscoveryType | null;
  onClose: () => void;
  onEarnStar: () => void;
  onOpenZoneView: (zoneId: WorldZoneId) => void;
  onNextStation?: () => void;
  onPrevStation?: () => void;
}

export const InWorldDiscoveryModal: React.FC<InWorldDiscoveryModalProps> = ({
  discovery,
  onClose,
  onEarnStar,
  onOpenZoneView,
  onNextStation,
  onPrevStation
}) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [starAwarded, setStarAwarded] = useState(false);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [obstacleStatus, setObstacleStatus] = useState<'unsolved' | 'correct' | 'wrong'>('unsolved');
  const [obstacleFeedback, setObstacleFeedback] = useState<string>('');

  React.useEffect(() => {
    setHasInteracted(false);
    setStarAwarded(false);
    setSelectedOptionIdx(null);
    setObstacleStatus('unsolved');
    setObstacleFeedback('');

    if (!discovery) return;

    // Automatic friendly speech on open
    if (discovery.type === 'letter') {
      audioService.speak(`Letter ${discovery.item.letter}. ${discovery.item.word}. ${discovery.item.letter} is for ${discovery.item.word}!`);
    } else if (discovery.type === 'fruit') {
      audioService.speak(`${discovery.item.name}. A sweet ${discovery.item.colorName} fruit.`);
    } else if (discovery.type === 'animal') {
      audioService.speak(`${discovery.item.name}! ${discovery.item.soundText}`);
    } else if (discovery.type === 'number') {
      audioService.speak(`Number ${discovery.item.number}. ${discovery.item.itemName}!`);
    } else if (discovery.type === 'star') {
      audioService.playSparkle();
      audioService.speak('You found a secret Wonder Star!');
    } else if (discovery.type === 'guide') {
      audioService.speak(discovery.message);
    } else if (discovery.type === 'obstacle') {
      audioService.speak(`${discovery.title}! ${discovery.question}`);
    }
  }, [discovery]);

  if (!discovery) return null;

  const handleInteract = () => {
    setHasInteracted(true);
    audioService.playPop();

    if (!starAwarded) {
      setStarAwarded(true);
      onEarnStar();
    }

    if (discovery.type === 'letter') {
      audioService.playSparkle();
      audioService.speak(`Awesome! ${discovery.item.letter} is for ${discovery.item.word}!`);
    } else if (discovery.type === 'fruit') {
      audioService.playSparkle();
      audioService.speak(`Yum! You picked a ${discovery.item.name}!`);
    } else if (discovery.type === 'animal') {
      audioService.playAnimalSound(discovery.item.name.toLowerCase());
      audioService.speak(`${discovery.item.soundText} says the ${discovery.item.name}!`);
    } else if (discovery.type === 'number') {
      audioService.playMusicalNote(discovery.item.number % 8);
      audioService.speak(`Great counting! Number ${discovery.item.number}!`);
    }
  };

  const handleSpeak = (text: string) => {
    audioService.speak(text);
  };

  const handleObstacleAnswer = (option: { label: string; icon: string; isCorrect: boolean; feedback: string }, idx: number) => {
    setSelectedOptionIdx(idx);
    if (option.isCorrect) {
      audioService.playSuccess();
      audioService.playSparkle();
      setObstacleStatus('correct');
      setObstacleFeedback(option.feedback || 'Great job! The path is open!');
      audioService.speak(`Great job! ${option.feedback}`);
      if (!starAwarded) {
        setStarAwarded(true);
        onEarnStar();
      }
    } else {
      audioService.playPop();
      setObstacleStatus('wrong');
      setObstacleFeedback(option.feedback || "Let's try again! You can do it!");
      audioService.speak("Let's try again! You can do it!");
    }
  };

  return (
    <div
      id="in-world-discovery-modal-overlay"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs animate-in fade-in zoom-in-95 pointer-events-auto select-none"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#FFFDF7] rounded-3xl shadow-2xl border-3 border-amber-200 overflow-hidden flex flex-col p-5 md:p-6 text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Close Button */}
        <button
          type="button"
          onClick={() => {
            audioService.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-xs z-10"
          aria-label="Close discovery"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. ALPHABET DISCOVERY */}
        {discovery.type === 'letter' && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-sky-800 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Alphabet Grove • Station {discovery.item.letter}</span>
            </div>

            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-white font-display font-black text-6xl shadow-lg border-4 border-white my-1"
              style={{ backgroundColor: discovery.item.themeColor }}
            >
              {discovery.item.letter}
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-display font-black text-3xl text-stone-900">
                  {discovery.item.letter} is for {discovery.item.word}
                </h3>
                <button
                  type="button"
                  onClick={() => handleSpeak(`${discovery.item.letter} is for ${discovery.item.word}`)}
                  className="p-1.5 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-900 cursor-pointer"
                  title="Speak Phonics"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-extrabold text-sky-800 mt-1">
                Phonics sound: "{discovery.item.phonics}"
              </p>
            </div>

            <div className="flex items-center gap-2 w-full">
              {onPrevStation && (
                <button
                  type="button"
                  onClick={onPrevStation}
                  className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                  title="Previous Letter"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleInteract}
                className={`flex-1 py-3.5 px-4 rounded-2xl font-display font-black text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                  hasInteracted
                    ? 'bg-amber-400 text-stone-900 border-2 border-amber-500'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <span>{discovery.item.emoji}</span>
                <span>{hasInteracted ? 'Practiced! ★ Star Earned!' : `Say "${discovery.item.letter}"!`}</span>
              </button>

              {onNextStation && (
                <button
                  type="button"
                  onClick={onNextStation}
                  className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                  title="Next Letter"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenZoneView('alphabet');
              }}
              className="w-full py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-xs font-extrabold text-sky-900 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Explore All Alphabet Activities</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 2. FRUIT DISCOVERY */}
        {discovery.type === 'fruit' && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-amber-800 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fruit Orchard • {discovery.item.colorName}</span>
            </div>

            <div className="w-24 h-24 rounded-3xl bg-amber-100 flex items-center justify-center text-6xl shadow-lg border-4 border-white my-1">
              {discovery.item.emoji}
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-display font-black text-3xl text-stone-900">
                  {discovery.item.name}
                </h3>
                <button
                  type="button"
                  onClick={() => handleSpeak(`${discovery.item.name}, a delicious ${discovery.item.colorName} fruit`)}
                  className="p-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-extrabold text-amber-800 mt-1">
                Color: {discovery.item.colorName} • Letter {discovery.item.letter}
              </p>
            </div>

            <button
              type="button"
              onClick={handleInteract}
              className={`w-full py-3.5 px-4 rounded-2xl font-display font-black text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                hasInteracted
                  ? 'bg-amber-400 text-stone-900 border-2 border-amber-500'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <span>{discovery.item.emoji}</span>
              <span>{hasInteracted ? 'Picked! ★ Star Earned!' : `Pick this ${discovery.item.name}!`}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenZoneView('fruits');
              }}
              className="w-full py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-xs font-extrabold text-amber-900 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Explore Fruit Orchard & Colors</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 3. ANIMAL DISCOVERY */}
        {discovery.type === 'animal' && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-rose-800 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Animal Woods • Friend</span>
            </div>

            <div className="w-24 h-24 rounded-3xl bg-rose-100 flex items-center justify-center text-6xl shadow-lg border-4 border-white my-1">
              {discovery.item.emoji}
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-display font-black text-3xl text-stone-900">
                  {discovery.item.name}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    audioService.playAnimalSound(discovery.item.name.toLowerCase());
                    handleSpeak(`${discovery.item.name}! ${discovery.item.soundText}`);
                  }}
                  className="p-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-900 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-extrabold text-rose-800 mt-1">
                Says "{discovery.item.soundText}" • Habitat: {discovery.item.habitat}
              </p>
            </div>

            <button
              type="button"
              onClick={handleInteract}
              className={`w-full py-3.5 px-4 rounded-2xl font-display font-black text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                hasInteracted
                  ? 'bg-amber-400 text-stone-900 border-2 border-amber-500'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <span>{discovery.item.emoji}</span>
              <span>{hasInteracted ? 'Patted! ★ Star Earned!' : `Say Hello to ${discovery.item.name}!`}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenZoneView('animals');
              }}
              className="w-full py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-xs font-extrabold text-rose-900 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Explore All Animal Friends</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 4. NUMBER DISCOVERY */}
        {discovery.type === 'number' && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-sky-800 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Number Valley • Number {discovery.item.number}</span>
            </div>

            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-white font-display font-black text-6xl shadow-lg border-4 border-white my-1"
              style={{ backgroundColor: discovery.item.color }}
            >
              {discovery.item.number}
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-display font-black text-3xl text-stone-900">
                  {discovery.item.word} ({discovery.item.number})
                </h3>
                <button
                  type="button"
                  onClick={() => handleSpeak(`Number ${discovery.item.number}, ${discovery.item.word}`)}
                  className="p-1.5 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-900 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-extrabold text-sky-800 mt-1">
                {discovery.item.number} {discovery.item.itemName} {discovery.item.itemEmoji}
              </p>
            </div>

            <button
              type="button"
              onClick={handleInteract}
              className={`w-full py-3.5 px-4 rounded-2xl font-display font-black text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                hasInteracted
                  ? 'bg-amber-400 text-stone-900 border-2 border-amber-500'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
            >
              <span>{discovery.item.itemEmoji}</span>
              <span>{hasInteracted ? 'Counted! ★ Star Earned!' : `Jump on Number ${discovery.item.number}!`}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenZoneView('numbers');
              }}
              className="w-full py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-xs font-extrabold text-sky-900 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Explore All Number Games</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 5. SECRET WONDER STAR DISCOVERY */}
        {discovery.type === 'star' && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-500 flex items-center justify-center shadow-lg border-4 border-amber-200 animate-spin-slow">
              <Star className="w-12 h-12 fill-amber-400" />
            </div>

            <div>
              <h3 className="font-display font-black text-2xl text-stone-900">
                Secret Wonder Star Found!
              </h3>
              <p className="text-xs text-stone-600 mt-1 font-medium">
                {discovery.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                audioService.playSparkle();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-2xl font-display font-black text-sm bg-amber-400 hover:bg-amber-500 text-stone-900 shadow-md cursor-pointer"
            >
              Collect Star & Keep Exploring!
            </button>
          </div>
        )}

        {/* 6. MEADOW GUIDE GREETING */}
        {discovery.type === 'guide' && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-6xl animate-bounce">
              🐰
            </div>

            <div>
              <h3 className="font-display font-black text-2xl text-stone-900">
                {discovery.title}
              </h3>
              <p className="text-sm font-medium text-stone-700 mt-2 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                "{discovery.message}"
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                audioService.playPop();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-2xl font-display font-black text-sm bg-sky-600 hover:bg-sky-700 text-white shadow-md cursor-pointer"
            >
              Let's Explore! →
            </button>
          </div>
        )}

        {/* 7. PEACEFUL OBSTACLE CHALLENGE LOOP */}
        {discovery.type === 'obstacle' && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div
              className="flex items-center gap-2 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-2xs"
              style={{
                backgroundColor: `${discovery.themeColor}15`,
                color: discovery.themeColor,
                borderColor: `${discovery.themeColor}40`
              }}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{discovery.subtitle}</span>
            </div>

            <h3 className="font-display font-black text-2xl sm:text-3xl text-stone-900 leading-tight">
              {discovery.title}
            </h3>

            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-stone-800 font-bold text-sm sm:text-base leading-snug">
              {discovery.question}
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
              {discovery.options.map((opt, idx) => {
                const isSelected = selectedOptionIdx === idx;
                let btnStyle = 'bg-white hover:bg-stone-50 border-2 border-stone-200 text-stone-800';

                if (isSelected) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-emerald-100 border-2 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300';
                  } else {
                    btnStyle = 'bg-rose-50 border-2 border-rose-400 text-rose-900';
                  }
                }

                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleObstacleAnswer(opt, idx)}
                    className={`p-3 rounded-2xl font-display font-black text-base flex flex-col items-center justify-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer ${btnStyle}`}
                  >
                    <span className="text-3xl">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Message */}
            {obstacleFeedback && (
              <div
                className={`p-3 rounded-2xl text-xs sm:text-sm font-bold w-full flex items-center justify-center gap-2 ${
                  obstacleStatus === 'correct'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {obstacleStatus === 'correct' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                <span>{obstacleFeedback}</span>
              </div>
            )}

            {/* Action button */}
            {obstacleStatus === 'correct' ? (
              <button
                type="button"
                onClick={() => {
                  audioService.playSparkle();
                  onClose();
                  if (discovery.rewardZone) {
                    onOpenZoneView(discovery.rewardZone);
                  }
                }}
                className="w-full py-3.5 px-4 rounded-2xl font-display font-black text-sm bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gate Opened! Continue Exploring →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  audioService.playPop();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-600 cursor-pointer"
              >
                Explore Somewhere Else
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
