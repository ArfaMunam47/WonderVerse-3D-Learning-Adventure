import React, { useState } from 'react';
import { FRUITS_DATA } from '../../data/worldZones';
import { FruitItem } from '../../types';
import { audioService } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Volume2, ShoppingBasket, RefreshCw, Award, ArrowLeft, Heart, HelpCircle } from 'lucide-react';

interface FruitOrchardZoneProps {
  onEarnStar: () => void;
  onBack: () => void;
}

type FruitTab = 'explore' | 'find-fruit' | 'color-match' | 'harvest-basket' | 'memory-match';

export const FruitOrchardZone: React.FC<FruitOrchardZoneProps> = ({
  onEarnStar,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<FruitTab>('explore');
  const [selectedFruit, setSelectedFruit] = useState<FruitItem>(FRUITS_DATA[0]);

  // Find Fruit State
  const [targetFruit, setTargetFruit] = useState<FruitItem>(FRUITS_DATA[1]);
  const [findOptions, setFindOptions] = useState<FruitItem[]>([]);
  const [findFeedback, setFindFeedback] = useState<string>('');
  const [findScore, setFindScore] = useState<number>(0);

  // Color Match Game State
  const [targetColor, setTargetColor] = useState<string>('Red');
  const [colorMatchFeedback, setColorMatchFeedback] = useState<string>('');
  const [colorScore, setColorScore] = useState<number>(0);

  // Harvest Basket State
  const [basket, setBasket] = useState<FruitItem[]>([]);

  // Memory Match State
  const [memoryCards, setMemoryCards] = useState<{ id: number; fruit: FruitItem; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);

  const startFindFruit = () => {
    const randomTarget = FRUITS_DATA[Math.floor(Math.random() * FRUITS_DATA.length)];
    setTargetFruit(randomTarget);

    const others = FRUITS_DATA.filter(f => f.id !== randomTarget.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const options = [randomTarget, ...others].sort(() => 0.5 - Math.random());
    setFindOptions(options);
    setFindFeedback(`Can you find the delicious "${randomTarget.name}"?`);
    audioService.speak(`Can you find the ${randomTarget.name}?`);
  };

  const startColorMatch = () => {
    const colors = ['Red', 'Yellow', 'Orange', 'Purple', 'Green'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setTargetColor(randomColor);
    setColorMatchFeedback(`Find a fruit that is "${randomColor}"!`);
    audioService.speak(`Find a fruit that is ${randomColor}!`);
  };

  const startMemoryMatch = () => {
    const selected4 = FRUITS_DATA.slice(0, 12).sort(() => 0.5 - Math.random()).slice(0, 4);
    const deck = [...selected4, ...selected4]
      .sort(() => 0.5 - Math.random())
      .map((fruit, idx) => ({
        id: idx,
        fruit,
        flipped: false,
        matched: false
      }));
    setMemoryCards(deck);
    setFlippedIndices([]);
    setMatchedPairs(0);
    audioService.speak('Match the pairs of orchard fruits!');
  };

  const handleSelectFruit = (fruit: FruitItem) => {
    setSelectedFruit(fruit);
    audioService.playPop();
    audioService.speak(`${fruit.name}! Color: ${fruit.colorName}! Shape: ${fruit.shape}! ${fruit.fact}`);
  };

  const handleFindChoice = (chosen: FruitItem) => {
    if (chosen.id === targetFruit.id) {
      audioService.playSuccess();
      confetti({ particleCount: 35, spread: 60 });
      setFindFeedback(`Awesome! That is the ${chosen.name}!`);
      audioService.speak(`Awesome! That is the ${chosen.name}!`);
      const next = findScore + 1;
      setFindScore(next);
      if (next % 3 === 0) {
        onEarnStar();
      }
      setTimeout(startFindFruit, 1800);
    } else {
      audioService.playPop();
      setFindFeedback(`That is the ${chosen.name}. Let's look for ${targetFruit.name}!`);
      audioService.speak(`That is the ${chosen.name}. Let's look for ${targetFruit.name}!`);
    }
  };

  const handleColorChoice = (fruit: FruitItem) => {
    if (fruit.colorName.toLowerCase().includes(targetColor.toLowerCase())) {
      audioService.playSuccess();
      confetti({ particleCount: 35, spread: 60 });
      setColorMatchFeedback(`Awesome! ${fruit.name} is ${targetColor}!`);
      audioService.speak(`Awesome! ${fruit.name} is ${targetColor}!`);
      const nextScore = colorScore + 1;
      setColorScore(nextScore);
      if (nextScore % 3 === 0) {
        onEarnStar();
      }
      setTimeout(startColorMatch, 1800);
    } else {
      audioService.playPop();
      setColorMatchFeedback(`${fruit.name} is ${fruit.colorName}. Let's find a ${targetColor} fruit!`);
      audioService.speak(`${fruit.name} is ${fruit.colorName}. Try finding a ${targetColor} fruit!`);
    }
  };

  const handleAddToBasket = (fruit: FruitItem) => {
    if (basket.length < 5) {
      audioService.playPop();
      audioService.speak(`Added ${fruit.name}!`);
      const newBasket = [...basket, fruit];
      setBasket(newBasket);
      if (newBasket.length === 5) {
        audioService.playSparkle();
        confetti({ particleCount: 50, spread: 70 });
        onEarnStar();
      }
    }
  };

  const handleFlipCard = (index: number) => {
    if (flippedIndices.length >= 2 || memoryCards[index].flipped || memoryCards[index].matched) return;

    audioService.playPop();
    const newCards = [...memoryCards];
    newCards[index].flipped = true;
    setMemoryCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [idx1, idx2] = newFlipped;
      if (newCards[idx1].fruit.id === newCards[idx2].fruit.id) {
        // Matched!
        setTimeout(() => {
          audioService.playSuccess();
          newCards[idx1].matched = true;
          newCards[idx2].matched = true;
          setMemoryCards([...newCards]);
          setFlippedIndices([]);
          const nextMatches = matchedPairs + 1;
          setMatchedPairs(nextMatches);
          if (nextMatches === 4) {
            audioService.playSparkle();
            confetti({ particleCount: 50, spread: 80 });
            onEarnStar();
          }
        }, 500);
      } else {
        // Not match, flip back
        setTimeout(() => {
          newCards[idx1].flipped = false;
          newCards[idx2].flipped = false;
          setMemoryCards([...newCards]);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div id="fruit-orchard-container" className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#FFFDF7] rounded-3xl shadow-xl border-2 border-amber-200/80">
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
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-display font-black text-xl shadow-xs">
              🍎
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-black text-stone-900">
                Fruit Orchard
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                Delicious fruits and yummy colors!
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
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            20 Fruits
          </button>
          <button
            onClick={() => {
              setActiveTab('find-fruit');
              audioService.playPop();
              startFindFruit();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'find-fruit'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            Find Fruit
          </button>
          <button
            onClick={() => {
              setActiveTab('color-match');
              audioService.playPop();
              startColorMatch();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'color-match'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            Color Match
          </button>
          <button
            onClick={() => {
              setActiveTab('harvest-basket');
              audioService.playPop();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'harvest-basket'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            Harvest Basket
          </button>
          <button
            onClick={() => {
              setActiveTab('memory-match');
              audioService.playPop();
              startMemoryMatch();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'memory-match'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            Memory Pairs
          </button>
        </div>
      </div>

      {/* Tab 1: Explore All 20 Orchard Fruits */}
      {activeTab === 'explore' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 20 Fruits Grid */}
          <div className="lg:col-span-7 bg-[#FAF8F5] p-4 rounded-3xl border border-amber-200/70">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {FRUITS_DATA.map((fruit) => (
                <button
                  key={fruit.id}
                  onClick={() => handleSelectFruit(fruit)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 cursor-pointer ${
                    selectedFruit.id === fruit.id
                      ? 'bg-amber-600 text-white shadow-md ring-3 ring-amber-300 scale-105'
                      : 'bg-[#FFFDF7] hover:bg-amber-50 border border-amber-200 text-stone-800 hover:border-amber-400'
                  }`}
                >
                  <span className="text-3xl">{fruit.emoji}</span>
                  <span className="text-[11px] font-extrabold mt-1 leading-tight text-center truncate px-1">
                    {fruit.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fruit Spotlight Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-50/90 to-amber-100/40 p-6 rounded-3xl border-2 border-amber-200/80 shadow-md">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
                Fruit Spotlight
              </span>
              <button
                onClick={() => {
                  audioService.playPop();
                  audioService.speak(`${selectedFruit.name}! Color: ${selectedFruit.colorName}! Shape: ${selectedFruit.shape}! ${selectedFruit.fact}`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF7] hover:bg-amber-50 text-amber-900 font-extrabold text-xs shadow-xs border border-amber-200 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Voice</span>
              </button>
            </div>

            <div className="my-6 text-center">
              <div className="text-7xl mb-2">{selectedFruit.emoji}</div>
              <h3 className="text-3xl font-display font-black text-stone-900">
                {selectedFruit.name}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-xl bg-[#FFFDF7] border border-amber-200 text-xs font-bold text-stone-700">
                  Color: {selectedFruit.colorName}
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#FFFDF7] border border-amber-200 text-xs font-bold text-stone-700">
                  Shape: {selectedFruit.shape}
                </span>
              </div>
            </div>

            <p className="text-sm text-stone-700 font-medium text-center bg-[#FFFDF7] p-4 rounded-2xl border border-amber-100">
              {selectedFruit.fact}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Find the Fruit */}
      {activeTab === 'find-fruit' && (
        <div className="mt-6 text-center max-w-2xl mx-auto py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-sm font-extrabold mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Score: {findScore} correct</span>
          </div>

          <div className="p-6 bg-[#FAF8F5] rounded-3xl border border-amber-200/80 mb-6">
            <h3 className="text-2xl font-display font-black text-stone-900 mb-2">
              {findFeedback || `Find the "${targetFruit.name}"!`}
            </h3>
            <p className="text-xs text-stone-600">Tap the matching fruit:</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {findOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleFindChoice(opt)}
                className="h-32 bg-[#FFFDF7] hover:bg-amber-50 border-2 border-amber-200/80 hover:border-amber-400 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-md transition-all transform active:scale-95 cursor-pointer"
              >
                <span className="text-5xl">{opt.emoji}</span>
                <span className="text-sm font-black text-stone-800">{opt.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={startFindFruit}
            className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-100/80 hover:bg-amber-200/80 text-stone-800 font-extrabold text-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Fruit</span>
          </button>
        </div>
      )}

      {/* Tab 3: Color Learning */}
      {activeTab === 'color-match' && (
        <div className="mt-6 text-center max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-sm font-extrabold mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Score: {colorScore} correct</span>
          </div>

          <div className="p-6 bg-[#FAF8F5] rounded-3xl border border-amber-200/80 mb-6">
            <h3 className="text-2xl font-display font-black text-stone-900 mb-2">
              {colorMatchFeedback || `Find a fruit that is "${targetColor}"!`}
            </h3>
            <p className="text-xs text-stone-600">Pick any fruit with this color:</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {FRUITS_DATA.slice(0, 12).map((fruit) => (
              <button
                key={fruit.id}
                onClick={() => handleColorChoice(fruit)}
                className="py-4 bg-[#FFFDF7] hover:bg-amber-50 border-2 border-amber-200/80 hover:border-amber-400 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-xs transition-all transform active:scale-95 cursor-pointer"
              >
                <span className="text-4xl">{fruit.emoji}</span>
                <span className="text-xs font-black text-stone-800">{fruit.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Harvest Basket */}
      {activeTab === 'harvest-basket' && (
        <div className="mt-6 text-center max-w-3xl mx-auto py-4">
          <div className="bg-[#FAF8F5] p-4 rounded-3xl border border-amber-200/80 mb-6">
            <h3 className="text-xl font-display font-black text-stone-900">
              Harvest Basket: <span className="text-amber-700">{basket.length}</span> / 5 Fruits Picked
            </h3>
            <p className="text-xs text-stone-600 mt-1">Tap fruits below to fill your basket!</p>
          </div>

          {/* Wooden Basket Display */}
          <div className="bg-gradient-to-b from-amber-100 to-amber-200/80 p-6 rounded-3xl border-4 border-amber-400/80 max-w-md mx-auto mb-8 shadow-inner min-h-[120px] flex items-center justify-center gap-3 flex-wrap">
            {basket.length === 0 ? (
              <span className="text-sm font-extrabold text-amber-900">Basket is empty. Tap fruits below to pick!</span>
            ) : (
              basket.map((fruit, idx) => (
                <span key={idx} className="text-5xl animate-bounce" title={fruit.name}>
                  {fruit.emoji}
                </span>
              ))
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-stone-600">Pick from Orchard:</span>
            {basket.length > 0 && (
              <button
                onClick={() => {
                  setBasket([]);
                  audioService.playPop();
                }}
                className="text-xs text-amber-800 font-extrabold hover:underline cursor-pointer"
              >
                Empty Basket
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {FRUITS_DATA.map((fruit) => (
              <button
                key={fruit.id}
                onClick={() => handleAddToBasket(fruit)}
                className="p-3 bg-[#FFFDF7] hover:bg-amber-50 border border-amber-200 hover:border-amber-400 rounded-2xl text-2xl shadow-xs transition-all transform active:scale-90 cursor-pointer"
              >
                {fruit.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Memory Match Pairs */}
      {activeTab === 'memory-match' && (
        <div className="mt-6 text-center max-w-xl mx-auto py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-extrabold text-stone-700">
              Matched Pairs: <span className="text-amber-700 font-black">{matchedPairs}</span> / 4
            </span>
            <button
              onClick={startMemoryMatch}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-800 font-extrabold text-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Shuffle Game</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {memoryCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => handleFlipCard(idx)}
                className={`h-24 sm:h-28 rounded-2xl flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-md cursor-pointer ${
                  card.flipped || card.matched
                    ? 'bg-[#FFFDF7] border-2 border-amber-400 text-4xl'
                    : 'bg-amber-600 text-white font-display font-black text-2xl hover:bg-amber-700'
                }`}
              >
                {card.flipped || card.matched ? card.fruit.emoji : '❓'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
