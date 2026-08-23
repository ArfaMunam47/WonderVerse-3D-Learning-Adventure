import React, { useState } from 'react';
import { NUMBERS_DATA } from '../../data/worldZones';
import { NumberItem } from '../../types';
import { audioService } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Volume2, RefreshCw, ArrowLeft, Award, Plus, Check, HelpCircle } from 'lucide-react';

interface NumberMeadowZoneProps {
  onEarnStar: () => void;
  onBack: () => void;
}

type NumberTab = 'explore' | 'counting' | 'stepping-stones' | 'addition';

export const NumberMeadowZone: React.FC<NumberMeadowZoneProps> = ({
  onEarnStar,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<NumberTab>('explore');
  const [selectedNumber, setSelectedNumber] = useState<NumberItem>(NUMBERS_DATA[0]);

  // Counting Game State
  const [targetCount, setTargetCount] = useState<number>(3);
  const [countEmoji, setCountEmoji] = useState<string>('🍎');
  const [countingFeedback, setCountingFeedback] = useState<string>('');
  const [countingScore, setCountingScore] = useState<number>(0);

  // Stepping Stones State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxStep] = useState<number>(10);

  // Simple Addition State
  const [addNum1, setAddNum1] = useState<number>(2);
  const [addNum2, setAddNum2] = useState<number>(1);
  const [addFeedback, setAddFeedback] = useState<string>('');
  const [addScore, setAddScore] = useState<number>(0);

  const startCountingGame = () => {
    const randomNum = Math.floor(Math.random() * 8) + 1; // 1 to 8
    const emojis = ['🍎', '🐥', '⭐', '🐰', '🍓', '🐸', '🎈', '🌻'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    setTargetCount(randomNum);
    setCountEmoji(randomEmoji);
    setCountingFeedback(`How many ${randomEmoji} do you see?`);
    audioService.speak(`How many items do you see? Count them!`);
  };

  const startAdditionGame = () => {
    const n1 = Math.floor(Math.random() * 4) + 1; // 1 to 4
    const n2 = Math.floor(Math.random() * 4) + 1; // 1 to 4
    setAddNum1(n1);
    setAddNum2(n2);
    setAddFeedback(`What is ${n1} plus ${n2}?`);
    audioService.speak(`What is ${n1} plus ${n2}? Let's add them together!`);
  };

  const handleSelectNumber = (item: NumberItem) => {
    setSelectedNumber(item);
    audioService.playPop();
    audioService.speak(`${item.number}. ${item.word}! ${item.itemName}`);
  };

  const handleCountAnswer = (chosen: number) => {
    if (chosen === targetCount) {
      audioService.playSuccess();
      confetti({ particleCount: 35, spread: 60 });
      setCountingFeedback(`Correct! There are ${targetCount}! Wonderful!`);
      audioService.speak(`Awesome! That is ${targetCount}!`);
      const nextScore = countingScore + 1;
      setCountingScore(nextScore);
      if (nextScore % 3 === 0) {
        onEarnStar();
      }
      setTimeout(startCountingGame, 1800);
    } else {
      audioService.playPop();
      setCountingFeedback(`Let's count again! Tap each item to count.`);
      audioService.speak(`Let's count together. Try again!`);
    }
  };

  const handleStepStone = (num: number) => {
    if (num === currentStep) {
      audioService.playInstrumentSound(Math.min(7, num - 1), 'xylophone');
      audioService.speak(`${num}!`);
      if (currentStep === maxStep) {
        audioService.playSparkle();
        confetti({ particleCount: 50, spread: 80 });
        onEarnStar();
        setCurrentStep(1);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      audioService.playPop();
      audioService.speak(`Next stepping stone is ${currentStep}!`);
    }
  };

  const handleAddAnswer = (chosen: number) => {
    const sum = addNum1 + addNum2;
    if (chosen === sum) {
      audioService.playSuccess();
      confetti({ particleCount: 40, spread: 65 });
      setAddFeedback(`Super! ${addNum1} + ${addNum2} = ${sum}!`);
      audioService.speak(`Great job! ${addNum1} plus ${addNum2} equals ${sum}!`);
      const nextScore = addScore + 1;
      setAddScore(nextScore);
      if (nextScore % 3 === 0) {
        onEarnStar();
      }
      setTimeout(startAdditionGame, 1800);
    } else {
      audioService.playPop();
      setAddFeedback(`Count all the items together! Try again.`);
      audioService.speak(`Count all items together. Try again!`);
    }
  };

  return (
    <div id="number-meadow-container" className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#FFFDF7] rounded-3xl shadow-xl border-2 border-amber-200/80">
      {/* Header with Back Navigation */}
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
              123
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-black text-stone-900">
                Number Meadow
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                Let's count together!
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
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
            Numbers 1-20
          </button>
          <button
            onClick={() => {
              setActiveTab('counting');
              audioService.playPop();
              startCountingGame();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'counting'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            How Many?
          </button>
          <button
            onClick={() => {
              setActiveTab('stepping-stones');
              audioService.playPop();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'stepping-stones'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            Step Path
          </button>
          <button
            onClick={() => {
              setActiveTab('addition');
              audioService.playPop();
              startAdditionGame();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'addition'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            Add Together
          </button>
        </div>
      </div>

      {/* Tab 1: Number Stones 1-20 */}
      {activeTab === 'explore' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Numbers 1-20 Grid */}
          <div className="lg:col-span-7 bg-[#FAF8F5] p-4 rounded-3xl border border-amber-200/70">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {NUMBERS_DATA.map((item) => (
                <button
                  key={item.number}
                  onClick={() => handleSelectNumber(item)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 cursor-pointer ${
                    selectedNumber.number === item.number
                      ? 'bg-sky-600 text-white shadow-md ring-3 ring-sky-300 scale-105 font-black'
                      : 'bg-[#FFFDF7] hover:bg-sky-50 border border-amber-200/80 text-stone-800 hover:border-sky-300 font-extrabold'
                  }`}
                >
                  <span className="text-2xl font-display">{item.number}</span>
                  <span className="text-[11px] opacity-85 leading-none">{item.itemEmoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Number Highlight Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-50/80 to-sky-50/60 p-6 rounded-3xl border-2 border-amber-200/80 shadow-md">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
                Number Spotlight
              </span>
              <button
                onClick={() => {
                  audioService.playPop();
                  audioService.speak(`${selectedNumber.number}. ${selectedNumber.word}! ${selectedNumber.itemName}`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF7] hover:bg-sky-50 text-sky-700 font-extrabold text-xs shadow-xs border border-amber-200 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Voice</span>
              </button>
            </div>

            <div className="my-6 text-center">
              <div className="text-7xl font-display font-black text-sky-900">
                {selectedNumber.number}
              </div>
              <h3 className="text-2xl font-display font-black text-stone-900 mt-1">
                {selectedNumber.word}
              </h3>
              <p className="text-sm font-bold text-sky-700 mt-0.5">
                {selectedNumber.itemName}
              </p>
            </div>

            {/* Visual Quantity Display */}
            <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-amber-100 text-center">
              <div className="text-xs text-stone-500 font-bold mb-2">Count {selectedNumber.number} items:</div>
              <div className="flex flex-wrap items-center justify-center gap-2 max-h-32 overflow-y-auto">
                {Array.from({ length: selectedNumber.number }).map((_, i) => (
                  <span
                    key={i}
                    onClick={() => {
                      audioService.playPop();
                      audioService.speak(`${i + 1}`);
                    }}
                    className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                    title={`Item ${i + 1}`}
                  >
                    {selectedNumber.itemEmoji}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: How Many? Visual Counting */}
      {activeTab === 'counting' && (
        <div className="mt-6 text-center max-w-2xl mx-auto py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-sm font-extrabold mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Score: {countingScore} correct</span>
          </div>

          <div className="p-6 bg-[#FAF8F5] rounded-3xl border border-amber-200/80 mb-6">
            <h3 className="text-xl md:text-2xl font-display font-black text-stone-900 mb-4">
              {countingFeedback || `How many items do you see?`}
            </h3>

            {/* Items display */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-4 min-h-[100px] bg-[#FFFDF7] rounded-2xl border border-amber-100">
              {Array.from({ length: targetCount }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    audioService.playPop();
                    audioService.speak(`${idx + 1}`);
                  }}
                  className="text-4xl md:text-5xl hover:scale-125 active:scale-95 transition-transform cursor-pointer"
                >
                  {countEmoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                onClick={() => handleCountAnswer(num)}
                className="py-4 bg-[#FFFDF7] hover:bg-sky-50 border-2 border-amber-200/80 hover:border-sky-400 rounded-2xl font-display font-black text-2xl text-stone-800 shadow-xs transition-all transform active:scale-95 cursor-pointer"
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={startCountingGame}
            className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-100/80 hover:bg-amber-200/80 text-stone-800 font-extrabold text-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Count</span>
          </button>
        </div>
      )}

      {/* Tab 3: Stepping Path */}
      {activeTab === 'stepping-stones' && (
        <div className="mt-6 text-center max-w-3xl mx-auto py-4">
          <div className="bg-[#FAF8F5] p-4 rounded-3xl border border-amber-200/80 mb-6">
            <h3 className="text-xl font-display font-black text-stone-900">
              Step on Stone <span className="text-sky-600 text-2xl font-black">{currentStep}</span>!
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Tap each stone in order from 1 to 10!
            </p>
          </div>

          <div className="grid grid-cols-5 gap-3 sm:gap-4 my-8">
            {Array.from({ length: maxStep }).map((_, i) => {
              const stoneNum = i + 1;
              const isStepped = stoneNum < currentStep;
              const isCurrent = stoneNum === currentStep;

              return (
                <button
                  key={stoneNum}
                  onClick={() => handleStepStone(stoneNum)}
                  className={`h-24 sm:h-28 rounded-3xl flex flex-col items-center justify-center transition-all transform active:scale-95 cursor-pointer ${
                    isCurrent
                      ? 'bg-sky-600 text-white ring-4 ring-sky-300 shadow-lg scale-105 animate-bounce'
                      : isStepped
                      ? 'bg-amber-100 text-amber-900 border-2 border-amber-300'
                      : 'bg-[#FFFDF7] hover:bg-amber-50 border-2 border-amber-200 text-stone-700'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl font-display font-black">
                    {stoneNum}
                  </span>
                  {isStepped && (
                    <span className="text-xs font-extrabold text-amber-800 mt-1">✓ Done</span>
                  )}
                  {isCurrent && (
                    <span className="text-xs font-extrabold text-white mt-1">Step here!</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Friendly Addition */}
      {activeTab === 'addition' && (
        <div className="mt-6 text-center max-w-2xl mx-auto py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-sm font-extrabold mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Score: {addScore} correct</span>
          </div>

          <div className="p-6 bg-[#FAF8F5] rounded-3xl border border-amber-200/80 mb-6">
            <h3 className="text-xl md:text-2xl font-display font-black text-stone-900 mb-4">
              {addFeedback || `What is ${addNum1} + ${addNum2}?`}
            </h3>

            {/* Visual Addition Expression */}
            <div className="flex items-center justify-center gap-4 bg-[#FFFDF7] p-4 rounded-2xl border border-amber-100">
              <div className="text-center">
                <div className="text-3xl font-display font-black text-sky-700">{addNum1}</div>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: addNum1 }).map((_, i) => (
                    <span key={i} className="text-xl">🍎</span>
                  ))}
                </div>
              </div>

              <div className="text-3xl font-black text-stone-400">+</div>

              <div className="text-center">
                <div className="text-3xl font-display font-black text-sky-700">{addNum2}</div>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: addNum2 }).map((_, i) => (
                    <span key={i} className="text-xl">🍎</span>
                  ))}
                </div>
              </div>

              <div className="text-3xl font-black text-stone-400">=</div>

              <div className="w-16 h-16 rounded-2xl bg-sky-100 border-2 border-dashed border-sky-400 flex items-center justify-center text-3xl font-display font-black text-sky-700 animate-pulse">
                ?
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleAddAnswer(num)}
                className="py-4 bg-[#FFFDF7] hover:bg-sky-50 border-2 border-amber-200/80 hover:border-sky-400 rounded-2xl font-display font-black text-2xl text-stone-800 shadow-xs transition-all transform active:scale-95 cursor-pointer"
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={startAdditionGame}
            className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-100/80 hover:bg-amber-200/80 text-stone-800 font-extrabold text-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Math Problem</span>
          </button>
        </div>
      )}
    </div>
  );
};
