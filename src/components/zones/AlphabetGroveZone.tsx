import React, { useState } from 'react';
import { ALPHABET_DATA } from '../../data/worldZones';
import { LetterItem } from '../../types';
import { audioService } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Volume2, RefreshCw, ArrowLeft, Award, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';

interface AlphabetGroveZoneProps {
  onEarnStar: () => void;
  onBack: () => void;
  highContrast?: boolean;
}

type AlphabetActivity = 'explore' | 'find-letter' | 'bubble-pop' | 'missing-letter';

export const AlphabetGroveZone: React.FC<AlphabetGroveZoneProps> = ({
  onEarnStar,
  onBack,
  highContrast = false
}) => {
  const [activeTab, setActiveTab] = useState<AlphabetActivity>('explore');
  const [selectedLetter, setSelectedLetter] = useState<LetterItem>(ALPHABET_DATA[0]);

  // Find Letter Game State
  const [targetLetter, setTargetLetter] = useState<LetterItem>(ALPHABET_DATA[1]);
  const [letterOptions, setLetterOptions] = useState<LetterItem[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [findScore, setFindScore] = useState(0);

  // Bubble Pop State
  const [bubbles, setBubbles] = useState<{ id: number; letter: LetterItem; x: number; y: number; speed: number }[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);

  // Missing Letter State
  const [missingQuizIdx, setMissingQuizIdx] = useState<number>(1); // Letter B missing between A and C
  const [missingOptions, setMissingOptions] = useState<LetterItem[]>([]);
  const [missingFeedback, setMissingFeedback] = useState<string>('');
  const [missingScore, setMissingScore] = useState(0);

  // Start Find Letter Game
  const startFindGame = () => {
    const randomTarget = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
    setTargetLetter(randomTarget);

    const otherChoices = ALPHABET_DATA.filter(item => item.letter !== randomTarget.letter)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const options = [randomTarget, ...otherChoices].sort(() => 0.5 - Math.random());
    setLetterOptions(options);
    setFeedbackMessage(`Can you find the letter "${randomTarget.letter}"?`);
    audioService.speak(`Can you find the letter ${randomTarget.letter}?`);
  };

  // Start Bubble Pop Activity
  const startBubbleActivity = () => {
    const newBubbles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      letter: ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)],
      x: 12 + (i % 3) * 32 + (Math.random() * 8 - 4),
      y: 20 + Math.floor(i / 3) * 38 + (Math.random() * 8 - 4),
      speed: 1 + Math.random()
    }));
    setBubbles(newBubbles);
    setPoppedCount(0);
    audioService.speak('Pop the floating letter bubbles!');
  };

  // Start Missing Letter Quiz
  const startMissingQuiz = () => {
    const targetIdx = 1 + Math.floor(Math.random() * (ALPHABET_DATA.length - 2)); // 1 to 24 (B to Y)
    setMissingQuizIdx(targetIdx);
    const targetItem = ALPHABET_DATA[targetIdx];

    const wrong1 = ALPHABET_DATA[(targetIdx + 3) % ALPHABET_DATA.length];
    const wrong2 = ALPHABET_DATA[(targetIdx + 7) % ALPHABET_DATA.length];
    const options = [targetItem, wrong1, wrong2].sort(() => 0.5 - Math.random());
    setMissingOptions(options);

    const prevLetter = ALPHABET_DATA[targetIdx - 1].letter;
    const nextLetter = ALPHABET_DATA[targetIdx + 1].letter;
    setMissingFeedback(`What letter comes between ${prevLetter} and ${nextLetter}?`);
    audioService.speak(`What letter comes between ${prevLetter} and ${nextLetter}?`);
  };

  const handleSelectLetter = (item: LetterItem) => {
    setSelectedLetter(item);
    audioService.playPop();
    audioService.speak(`${item.letter}. ${item.word}! Phonics sound: ${item.phonics}`);
  };

  const handleFindChoice = (chosen: LetterItem) => {
    if (chosen.letter === targetLetter.letter) {
      audioService.playSuccess();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      setFeedbackMessage(`Great job! That is ${chosen.letter} for ${chosen.word}!`);
      audioService.speak(`Great job! That is ${chosen.letter} for ${chosen.word}!`);
      const newScore = findScore + 1;
      setFindScore(newScore);
      if (newScore % 3 === 0) {
        onEarnStar();
      }
      setTimeout(startFindGame, 1800);
    } else {
      audioService.playPop();
      setFeedbackMessage(`That is "${chosen.letter}". Let's find "${targetLetter.letter}"!`);
      audioService.speak(`That is ${chosen.letter}. Let's find ${targetLetter.letter}!`);
    }
  };

  const handlePopBubble = (bubbleId: number, letterItem: LetterItem) => {
    audioService.playBubblePop();
    audioService.speak(`${letterItem.letter}! ${letterItem.word}!`);
    setBubbles(prev => prev.filter(b => b.id !== bubbleId));
    const nextCount = poppedCount + 1;
    setPoppedCount(nextCount);

    if (nextCount >= 5) {
      audioService.playSparkle();
      confetti({ particleCount: 50, spread: 70 });
      onEarnStar();
      setTimeout(startBubbleActivity, 1500);
    }
  };

  const handleMissingChoice = (chosen: LetterItem) => {
    const correctItem = ALPHABET_DATA[missingQuizIdx];
    if (chosen.letter === correctItem.letter) {
      audioService.playSuccess();
      confetti({ particleCount: 45, spread: 65 });
      setMissingFeedback(`Super! ${ALPHABET_DATA[missingQuizIdx - 1].letter}, ${correctItem.letter}, ${ALPHABET_DATA[missingQuizIdx + 1].letter}!`);
      audioService.speak(`Super! ${correctItem.letter} comes between ${ALPHABET_DATA[missingQuizIdx - 1].letter} and ${ALPHABET_DATA[missingQuizIdx + 1].letter}!`);
      const nextScore = missingScore + 1;
      setMissingScore(nextScore);
      if (nextScore % 3 === 0) {
        onEarnStar();
      }
      setTimeout(startMissingQuiz, 1900);
    } else {
      audioService.playPop();
      setMissingFeedback(`Try again! Which letter is between ${ALPHABET_DATA[missingQuizIdx - 1].letter} and ${ALPHABET_DATA[missingQuizIdx + 1].letter}?`);
      audioService.speak(`Try again!`);
    }
  };

  return (
    <div id="alphabet-grove-container" className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#FFFDF7] rounded-3xl shadow-xl border-2 border-amber-200/80">
      {/* Top Header with Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-200/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audioService.playPop();
              onBack();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-800 font-extrabold transition-all text-sm shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-sky-600" />
            <span>Back to Meadow</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-display font-black text-xl shadow-xs">
              Aa
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-black text-stone-900">
                Alphabet Grove
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                Let's explore letters!
              </p>
            </div>
          </div>
        </div>

        {/* Activity Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-amber-50/70 p-1.5 rounded-2xl border border-amber-200/70 flex-wrap">
          <button
            onClick={() => {
              setActiveTab('explore');
              audioService.playPop();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            A-Z Letters
          </button>
          <button
            onClick={() => {
              setActiveTab('find-letter');
              audioService.playPop();
              startFindGame();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'find-letter'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            Find Letter
          </button>
          <button
            onClick={() => {
              setActiveTab('bubble-pop');
              audioService.playPop();
              startBubbleActivity();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'bubble-pop'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            Pop Bubbles
          </button>
          <button
            onClick={() => {
              setActiveTab('missing-letter');
              audioService.playPop();
              startMissingQuiz();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'missing-letter'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            What's Next?
          </button>
        </div>
      </div>

      {/* Tab 1: Alphabet Trail (Explore All 26 Letters) */}
      {activeTab === 'explore' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 26 Letter Grid */}
          <div className="lg:col-span-7 bg-[#FAF8F5] p-4 rounded-3xl border border-amber-200/70">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2.5">
              {ALPHABET_DATA.map((item) => (
                <button
                  key={item.letter}
                  onClick={() => handleSelectLetter(item)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 cursor-pointer ${
                    selectedLetter.letter === item.letter
                      ? 'bg-sky-600 text-white shadow-md ring-3 ring-sky-300 scale-105 font-black'
                      : 'bg-[#FFFDF7] hover:bg-sky-50 border border-amber-200/80 text-stone-800 hover:border-sky-300 font-extrabold'
                  }`}
                >
                  <span className="text-xl md:text-2xl font-display">{item.letter}</span>
                  <span className="text-[11px] opacity-85 leading-none">{item.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Letter Highlight Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-50/80 to-sky-50/60 p-6 rounded-3xl border-2 border-amber-200/80 shadow-md">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
                Letter Spotlight
              </span>
              <button
                onClick={() => {
                  audioService.playPop();
                  audioService.speak(`${selectedLetter.letter}. ${selectedLetter.word}! ${selectedLetter.description}`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF7] hover:bg-sky-50 text-sky-700 font-extrabold text-xs shadow-xs border border-amber-200 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Voice</span>
              </button>
            </div>

            <div className="my-6 text-center">
              <div className="text-7xl md:text-8xl font-display font-black text-sky-900">
                {selectedLetter.letter}
                <span className="text-4xl md:text-5xl font-medium text-sky-600/80 ml-1 lowercase">
                  {selectedLetter.letter}
                </span>
              </div>
              <div className="text-6xl my-3">{selectedLetter.icon}</div>
              <h3 className="text-3xl font-display font-black text-stone-900">
                {selectedLetter.word}
              </h3>
              <div className="inline-block mt-2 px-4 py-1.5 rounded-xl bg-sky-100 text-sky-900 font-extrabold text-sm">
                Phonics: {selectedLetter.phonics}
              </div>
            </div>

            <p className="text-sm text-stone-700 font-medium text-center bg-[#FFFDF7] p-4 rounded-2xl border border-amber-100">
              {selectedLetter.description}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Find the Letter Game */}
      {activeTab === 'find-letter' && (
        <div className="mt-6 text-center max-w-2xl mx-auto py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-sm font-extrabold mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Score: {findScore} correct</span>
          </div>

          <div className="p-6 bg-[#FAF8F5] rounded-3xl border border-amber-200/80 mb-8">
            <h3 className="text-2xl md:text-3xl font-display font-black text-stone-900 mb-2">
              {feedbackMessage || `Find the letter "${targetLetter.letter}"!`}
            </h3>
            <p className="text-sm text-stone-600">
              Tap the matching letter block:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {letterOptions.map((opt) => (
              <button
                key={opt.letter}
                onClick={() => handleFindChoice(opt)}
                className="h-32 bg-[#FFFDF7] hover:bg-sky-50 border-2 border-amber-200/80 hover:border-sky-400 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-md transition-all transform active:scale-95 group cursor-pointer"
              >
                <span className="text-4xl md:text-5xl font-display font-black text-stone-800 group-hover:text-sky-700">
                  {opt.letter}
                </span>
                <span className="text-xs text-stone-500 font-bold">{opt.word}</span>
              </button>
            ))}
          </div>

          <button
            onClick={startFindGame}
            className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-100/80 hover:bg-amber-200/80 text-stone-800 font-extrabold text-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Letter</span>
          </button>
        </div>
      )}

      {/* Tab 3: Phonics Bubble Pop */}
      {activeTab === 'bubble-pop' && (
        <div className="mt-6 text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-extrabold text-stone-700">
              Bubbles Popped: <span className="text-sky-600 text-base">{poppedCount}</span> / 5
            </div>
            <button
              onClick={startBubbleActivity}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-800 font-extrabold text-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Bubbles</span>
            </button>
          </div>

          <div className="relative w-full h-80 bg-gradient-to-b from-sky-50 to-amber-50/40 rounded-3xl border-2 border-amber-200/70 overflow-hidden shadow-inner flex items-center justify-center">
            {bubbles.length === 0 ? (
              <div className="text-center p-6">
                <span className="text-5xl">🎉</span>
                <h4 className="text-xl font-display font-black text-stone-900 mt-2">
                  All Bubbles Popped!
                </h4>
                <p className="text-xs text-stone-600 mb-4">You earned a star!</p>
                <button
                  onClick={startBubbleActivity}
                  className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            ) : (
              bubbles.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handlePopBubble(b.id, b.letter)}
                  className="absolute w-20 h-20 rounded-full bg-[#FFFDF7]/90 backdrop-blur-xs border-2 border-sky-300 shadow-md flex flex-col items-center justify-center transform hover:scale-110 active:scale-90 transition-transform animate-pulse cursor-pointer"
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`
                  }}
                >
                  <span className="text-2xl font-display font-black text-sky-900">
                    {b.letter.letter}
                  </span>
                  <span className="text-[10px] text-sky-700 font-bold">
                    {b.letter.word}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Missing Letter Quiz */}
      {activeTab === 'missing-letter' && (
        <div className="mt-6 text-center max-w-2xl mx-auto py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-sm font-extrabold mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Score: {missingScore} correct</span>
          </div>

          <div className="p-6 bg-[#FAF8F5] rounded-3xl border border-amber-200/80 mb-8">
            <h3 className="text-xl md:text-2xl font-display font-black text-stone-900 mb-4">
              {missingFeedback}
            </h3>

            {/* Sequence Display e.g. [A] [ ? ] [C] */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-20 h-24 bg-[#FFFDF7] rounded-2xl border-2 border-amber-200 flex items-center justify-center text-4xl font-display font-black text-stone-800 shadow-xs">
                {ALPHABET_DATA[missingQuizIdx - 1]?.letter}
              </div>
              <div className="w-20 h-24 bg-sky-100 rounded-2xl border-2 border-dashed border-sky-400 flex items-center justify-center text-4xl font-display font-black text-sky-700 animate-pulse">
                ?
              </div>
              <div className="w-20 h-24 bg-[#FFFDF7] rounded-2xl border-2 border-amber-200 flex items-center justify-center text-4xl font-display font-black text-stone-800 shadow-xs">
                {ALPHABET_DATA[missingQuizIdx + 1]?.letter}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {missingOptions.map((opt) => (
              <button
                key={opt.letter}
                onClick={() => handleMissingChoice(opt)}
                className="py-5 bg-[#FFFDF7] hover:bg-sky-50 border-2 border-amber-200/80 hover:border-sky-400 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md transition-all transform active:scale-95 cursor-pointer"
              >
                <span className="text-3xl md:text-4xl font-display font-black text-stone-800">
                  {opt.letter}
                </span>
                <span className="text-xs text-stone-500 font-bold">{opt.word}</span>
              </button>
            ))}
          </div>

          <button
            onClick={startMissingQuiz}
            className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-100/80 hover:bg-amber-200/80 text-stone-800 font-extrabold text-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Next Sequence</span>
          </button>
        </div>
      )}
    </div>
  );
};
