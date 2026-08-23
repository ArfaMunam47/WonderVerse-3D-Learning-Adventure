import React, { useState } from 'react';
import { ANIMALS_DATA } from '../../data/worldZones';
import { AnimalItem, AnimalHabitat } from '../../types';
import { audioService } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Volume2, RefreshCw, Award, ArrowLeft, Heart, HelpCircle } from 'lucide-react';

interface AnimalFriendsZoneProps {
  onEarnStar: () => void;
  onBack: () => void;
}

type AnimalTab = 'explore' | 'sound-game' | 'feed-animal' | 'habitat-match';

export const AnimalFriendsZone: React.FC<AnimalFriendsZoneProps> = ({
  onEarnStar,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<AnimalTab>('explore');
  const [selectedHabitat, setSelectedHabitat] = useState<AnimalHabitat | 'all'>('all');
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalItem>(ANIMALS_DATA[0]);

  // Sound Game State
  const [targetAnimal, setTargetAnimal] = useState<AnimalItem>(ANIMALS_DATA[0]);
  const [soundOptions, setSoundOptions] = useState<AnimalItem[]>([]);
  const [soundFeedback, setSoundFeedback] = useState<string>('');
  const [soundScore, setSoundScore] = useState<number>(0);

  // Feeding Game State
  const [fedAnimals, setFedAnimals] = useState<string[]>([]);

  // Habitat Match Game State
  const [habitatTarget, setHabitatTarget] = useState<AnimalItem>(ANIMALS_DATA[1]);
  const [habitatFeedback, setHabitatFeedback] = useState<string>('');
  const [habitatScore, setHabitatScore] = useState<number>(0);

  const filteredAnimals = selectedHabitat === 'all'
    ? ANIMALS_DATA
    : ANIMALS_DATA.filter(a => a.habitat === selectedHabitat);

  const startSoundGame = () => {
    const randomAnimal = ANIMALS_DATA[Math.floor(Math.random() * ANIMALS_DATA.length)];
    setTargetAnimal(randomAnimal);

    const others = ANIMALS_DATA.filter(a => a.id !== randomAnimal.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const options = [randomAnimal, ...others].sort(() => 0.5 - Math.random());
    setSoundOptions(options);
    setSoundFeedback(`Who says "${randomAnimal.soundText}"?`);
    audioService.speak(`Who makes the sound ${randomAnimal.soundText}?`);
  };

  const startHabitatGame = () => {
    const randomAnimal = ANIMALS_DATA[Math.floor(Math.random() * ANIMALS_DATA.length)];
    setHabitatTarget(randomAnimal);
    setHabitatFeedback(`Where does the ${randomAnimal.name} live?`);
    audioService.speak(`Where does the ${randomAnimal.name} live?`);
  };

  const handleSelectAnimal = (animal: AnimalItem) => {
    setSelectedAnimal(animal);
    audioService.playPop();
    audioService.speak(`${animal.name}! ${animal.soundText} Habitat: ${animal.habitatName}. Fun fact: ${animal.funFact}`);
  };

  const handleSoundGuess = (chosen: AnimalItem) => {
    if (chosen.id === targetAnimal.id) {
      audioService.playSuccess();
      confetti({ particleCount: 35, spread: 60 });
      setSoundFeedback(`Yay! That is the ${chosen.name}! ${chosen.soundText}`);
      audioService.speak(`Yay! The ${chosen.name} says ${chosen.soundText}!`);
      const nextScore = soundScore + 1;
      setSoundScore(nextScore);
      if (nextScore % 3 === 0) {
        onEarnStar();
      }
      setTimeout(startSoundGame, 1800);
    } else {
      audioService.playPop();
      setSoundFeedback(`That is the ${chosen.name}. Who says "${targetAnimal.soundText}"?`);
      audioService.speak(`That is the ${chosen.name}. Try again!`);
    }
  };

  const handleFeed = (animal: AnimalItem) => {
    audioService.playSparkle();
    audioService.speak(`Yum! You gave delicious ${animal.diet} to ${animal.name}!`);
    if (!fedAnimals.includes(animal.id)) {
      const next = [...fedAnimals, animal.id];
      setFedAnimals(next);
      if (next.length === 5) {
        confetti({ particleCount: 50, spread: 70 });
        onEarnStar();
      }
    }
  };

  const handleHabitatGuess = (chosenHabitat: AnimalHabitat) => {
    if (chosenHabitat === habitatTarget.habitat) {
      audioService.playSuccess();
      confetti({ particleCount: 35, spread: 60 });
      setHabitatFeedback(`Super! The ${habitatTarget.name} lives in the ${habitatTarget.habitatName}!`);
      audioService.speak(`Super! The ${habitatTarget.name} lives in the ${habitatTarget.habitatName}!`);
      const next = habitatScore + 1;
      setHabitatScore(next);
      if (next % 3 === 0) {
        onEarnStar();
      }
      setTimeout(startHabitatGame, 1800);
    } else {
      audioService.playPop();
      setHabitatFeedback(`Try again! Where does the ${habitatTarget.name} feel most at home?`);
      audioService.speak(`Try again!`);
    }
  };

  return (
    <div id="animal-friends-container" className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#FFFDF7] rounded-3xl shadow-xl border-2 border-amber-200/80">
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
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-display font-black text-xl shadow-xs">
              🐾
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-black text-stone-900">
                Animal Friends
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                Meet friendly animals and their sounds!
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
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            Meet Animals
          </button>
          <button
            onClick={() => {
              setActiveTab('sound-game');
              audioService.playPop();
              startSoundGame();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'sound-game'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            Sound Guess
          </button>
          <button
            onClick={() => {
              setActiveTab('feed-animal');
              audioService.playPop();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'feed-animal'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            Feed Friends
          </button>
          <button
            onClick={() => {
              setActiveTab('habitat-match');
              audioService.playPop();
              startHabitatGame();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'habitat-match'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-100/60'
            }`}
          >
            Animal Homes
          </button>
        </div>
      </div>

      {/* Tab 1: Habitat Safari (Explore 22 animals) */}
      {activeTab === 'explore' && (
        <div className="mt-6">
          {/* Habitat Filter Pills */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            <span className="text-xs font-extrabold text-stone-600 mr-1">Choose Home:</span>
            {[
              { id: 'all', label: 'All Friends (22)' },
              { id: 'farm', label: '🌾 Farm' },
              { id: 'forest', label: '🌲 Forest' },
              { id: 'jungle', label: '🌴 Jungle' },
              { id: 'water', label: '🌊 Water' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedHabitat(tab.id as AnimalHabitat | 'all');
                  audioService.playPop();
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  selectedHabitat === tab.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-stone-700 border border-amber-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Animals Grid */}
            <div className="lg:col-span-7 bg-[#FAF8F5] p-4 rounded-3xl border border-amber-200/70">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[380px] overflow-y-auto p-1">
                {filteredAnimals.map((animal) => (
                  <button
                    key={animal.id}
                    onClick={() => handleSelectAnimal(animal)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 cursor-pointer ${
                      selectedAnimal.id === animal.id
                        ? 'bg-rose-600 text-white shadow-md ring-3 ring-rose-300 scale-105'
                        : 'bg-[#FFFDF7] hover:bg-rose-50 border border-amber-200 text-stone-800 hover:border-rose-300'
                    }`}
                  >
                    <span className="text-3xl">{animal.emoji}</span>
                    <span className="text-[11px] font-extrabold mt-1 leading-tight text-center truncate px-1">
                      {animal.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Animal Spotlight Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-amber-50/80 to-rose-50/70 p-6 rounded-3xl border-2 border-amber-200/80 shadow-md">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
                  {selectedAnimal.habitatName}
                </span>
                <button
                  onClick={() => {
                    audioService.playPop();
                    audioService.speak(`${selectedAnimal.name}! ${selectedAnimal.soundText} ${selectedAnimal.funFact}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF7] hover:bg-rose-50 text-rose-800 font-extrabold text-xs shadow-xs border border-amber-200 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Hear Sound</span>
                </button>
              </div>

              <div className="my-6 text-center">
                <div className="text-7xl mb-2">{selectedAnimal.emoji}</div>
                <h3 className="text-3xl font-display font-black text-stone-900">
                  {selectedAnimal.name}
                </h3>
                <div className="text-sm font-black text-rose-700 mt-1">
                  "{selectedAnimal.soundText}"
                </div>
              </div>

              <div className="space-y-2 text-xs font-medium">
                <div className="bg-[#FFFDF7] p-3 rounded-2xl border border-amber-100 flex items-center justify-between">
                  <span className="text-stone-600 font-extrabold">Yummy Snack:</span>
                  <span className="text-stone-900 font-extrabold">{selectedAnimal.diet}</span>
                </div>
                <div className="bg-[#FFFDF7] p-3 rounded-2xl border border-amber-100 text-stone-700">
                  {selectedAnimal.funFact}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sound Guess Game */}
      {activeTab === 'sound-game' && (
        <div className="mt-6 text-center max-w-2xl mx-auto py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-sm font-extrabold mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Score: {soundScore} correct</span>
          </div>

          <div className="p-6 bg-[#FAF8F5] rounded-3xl border border-amber-200/80 mb-6">
            <h3 className="text-2xl font-display font-black text-stone-900 mb-2">
              {soundFeedback || `Who says "${targetAnimal.soundText}"?`}
            </h3>
            <p className="text-xs text-stone-600">Choose the animal:</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {soundOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSoundGuess(opt)}
                className="h-32 bg-[#FFFDF7] hover:bg-rose-50 border-2 border-amber-200/80 hover:border-rose-400 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-md transition-all transform active:scale-95 cursor-pointer"
              >
                <span className="text-5xl">{opt.emoji}</span>
                <span className="text-sm font-black text-stone-800">{opt.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={startSoundGame}
            className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-100/80 hover:bg-amber-200/80 text-stone-800 font-extrabold text-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Next Animal Sound</span>
          </button>
        </div>
      )}

      {/* Tab 3: Feed & Care */}
      {activeTab === 'feed-animal' && (
        <div className="mt-6 text-center max-w-3xl mx-auto py-4">
          <div className="bg-[#FAF8F5] p-4 rounded-3xl border border-amber-200/80 mb-6">
            <h3 className="text-xl font-display font-black text-stone-900">
              Cared for <span className="text-rose-600">{fedAnimals.length}</span> / 5 Friends
            </h3>
            <p className="text-xs text-stone-600 mt-1">Tap an animal to feed them!</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ANIMALS_DATA.slice(0, 8).map((animal) => {
              const isFed = fedAnimals.includes(animal.id);
              return (
                <div
                  key={animal.id}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-between gap-2 ${
                    isFed
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-[#FFFDF7] border-amber-200'
                  }`}
                >
                  <span className="text-5xl">{animal.emoji}</span>
                  <div className="text-center">
                    <div className="text-sm font-black text-stone-800">{animal.name}</div>
                    <div className="text-[11px] text-stone-500 font-bold">{animal.diet}</div>
                  </div>
                  <button
                    onClick={() => handleFeed(animal)}
                    className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition-all transform active:scale-95 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-200" />
                    <span>{isFed ? 'Fed with Love ❤️' : 'Feed Friend'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Habitat Match */}
      {activeTab === 'habitat-match' && (
        <div className="mt-6 text-center max-w-2xl mx-auto py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-sm font-extrabold mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Score: {habitatScore} correct</span>
          </div>

          <div className="p-6 bg-[#FAF8F5] rounded-3xl border border-amber-200/80 mb-6">
            <div className="text-6xl mb-2">{habitatTarget.emoji}</div>
            <h3 className="text-2xl font-display font-black text-stone-900 mb-1">
              {habitatFeedback || `Where does the ${habitatTarget.name} live?`}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'farm', label: '🌾 Farm Pasture', desc: 'Barns and sunny green grass' },
              { id: 'forest', label: '🌲 Woodland Forest', desc: 'Big leafy trees and quiet paths' },
              { id: 'jungle', label: '🌴 Tropical Jungle', desc: 'Vines and wild jungle trees' },
              { id: 'water', label: '🌊 Stream & Ocean', desc: 'Ponds, rivers, and blue water' }
            ].map(h => (
              <button
                key={h.id}
                onClick={() => handleHabitatGuess(h.id as AnimalHabitat)}
                className="p-5 bg-[#FFFDF7] hover:bg-amber-50 border-2 border-amber-200 hover:border-rose-400 rounded-3xl text-left shadow-xs transition-all transform active:scale-95 cursor-pointer"
              >
                <div className="font-display font-black text-base text-stone-900">{h.label}</div>
                <div className="text-xs text-stone-600 mt-1">{h.desc}</div>
              </button>
            ))}
          </div>

          <button
            onClick={startHabitatGame}
            className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-100/80 hover:bg-amber-200/80 text-stone-800 font-extrabold text-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Animal Friend</span>
          </button>
        </div>
      )}
    </div>
  );
};
