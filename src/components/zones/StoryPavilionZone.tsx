import React, { useState } from 'react';
import { STORIES_DATA } from '../../data/worldZones';
import { StoryItem, StoryScene } from '../../types';
import { audioService } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Volume2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowLeft,
  Award,
  RefreshCw,
  Loader2,
  Wand2,
  Heart,
  MessageCircle
} from 'lucide-react';

interface StoryPavilionZoneProps {
  onEarnStar: () => void;
  onBack: () => void;
}

export const StoryPavilionZone: React.FC<StoryPavilionZoneProps> = ({
  onEarnStar,
  onBack
}) => {
  const [allStories, setAllStories] = useState<StoryItem[]>(STORIES_DATA);
  const [selectedStory, setSelectedStory] = useState<StoryItem>(STORIES_DATA[0]);
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [storiesCompleted, setStoriesCompleted] = useState<string[]>([]);
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);
  const [generationTheme, setGenerationTheme] = useState<string>('Kindness & Sharing');
  const [generationCharacter, setGenerationCharacter] = useState<string>('Barnaby the Bear');
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  const activeScene: StoryScene = selectedStory.scenes[currentSceneIdx] || selectedStory.scenes[0];
  const sceneNarration = activeScene.narration || activeScene.text || '';

  const handleSelectStory = (story: StoryItem) => {
    setSelectedStory(story);
    setCurrentSceneIdx(0);
    audioService.playPop();
    audioService.speak(`Let's read: ${story.title}!`);
  };

  const handleNextScene = () => {
    if (currentSceneIdx < selectedStory.scenes.length - 1) {
      const nextIdx = currentSceneIdx + 1;
      setCurrentSceneIdx(nextIdx);
      audioService.playPop();
      const scene = selectedStory.scenes[nextIdx];
      const narration = scene.narration || scene.text || '';
      audioService.speak(narration);
    } else {
      // Completed the story!
      audioService.playSparkle();
      confetti({ particleCount: 55, spread: 75 });
      if (!storiesCompleted.includes(selectedStory.id)) {
        setStoriesCompleted(prev => [...prev, selectedStory.id]);
        onEarnStar();
      }
      audioService.speak(`The End! Moral: ${selectedStory.moral}`);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIdx > 0) {
      const prevIdx = currentSceneIdx - 1;
      setCurrentSceneIdx(prevIdx);
      audioService.playPop();
      const scene = selectedStory.scenes[prevIdx];
      const narration = scene.narration || scene.text || '';
      audioService.speak(narration);
    }
  };

  const handleReadAloud = () => {
    audioService.playPop();
    audioService.speak(sceneNarration);
  };

  const handleInteractivePromptTap = () => {
    audioService.playSparkle();
    confetti({ particleCount: 25, spread: 45 });
    if (activeScene.interactionPrompt) {
      audioService.speak("Wonderful! You helped in the story!");
    }
  };

  // Generate new AI story using server-side endpoint
  const handleGenerateAiStory = async () => {
    setIsGeneratingStory(true);
    audioService.playPop();
    try {
      const response = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: generationTheme,
          characterName: generationCharacter,
          ageGroup: '3-6'
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const newStory: StoryItem = data.story || data;
      setAllStories(prev => [newStory, ...prev]);
      setSelectedStory(newStory);
      setCurrentSceneIdx(0);
      setShowAiModal(false);
      audioService.playSuccess();
      confetti({ particleCount: 50, spread: 70 });
      audioService.speak(`New magical story created: ${newStory.title}!`);
    } catch (err) {
      console.error('Failed to generate story via AI API:', err);
      // Fallback gentle offline generated story
      const fallbackStory: StoryItem = {
        id: `story-custom-${Date.now()}`,
        title: `${generationCharacter} and the Rainbow Blossom`,
        moral: 'Kindness and curiosity help the whole meadow bloom.',
        characters: [generationCharacter, 'Pippin Bunny'],
        scenes: [
          {
            sceneNumber: 1,
            title: 'A Gentle Sunrise',
            illustration: '🌸✨',
            narration: `${generationCharacter} woke up in Wonder Meadow to find a sparkling rainbow blossom near the whispering stream.`,
            caption: 'A sunny morning in the meadow.',
            environmentTag: 'meadow-sunrise',
            interactionPrompt: 'Tap the blossom to smell the sweet floral scent!'
          },
          {
            sceneNumber: 2,
            title: 'Sharing the Petals',
            illustration: '🐰🌿',
            narration: `Pippin Bunny hopped over with a cheerful smile. Together they watered the flower and watched colorful butterflies dance.`,
            caption: 'True friendship makes every moment special.',
            environmentTag: 'clover-patch',
            interactionPrompt: 'Wave to the butterflies!'
          },
          {
            sceneNumber: 3,
            title: 'A Golden Star Dream',
            illustration: '🌙⭐',
            narration: `Under the evening sky, all the meadow friends rested peacefully, thankful for sharing joy and smiles.`,
            caption: 'Sweet dreams over Wonder Meadow.',
            environmentTag: 'night-sky',
            interactionPrompt: 'Tap the star to make a bedtime wish!'
          }
        ]
      };
      setAllStories(prev => [fallbackStory, ...prev]);
      setSelectedStory(fallbackStory);
      setCurrentSceneIdx(0);
      setShowAiModal(false);
      audioService.playSuccess();
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <div id="story-pavilion-container" className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#FFFDF7] rounded-3xl shadow-xl border-2 border-amber-200/80">
      {/* Header with Back Navigation & AI Story Generator */}
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
              📖
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-black text-stone-900">
                Story Pavilion
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                Listen to gentle illustrated stories with kind lessons
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Story Maker Trigger */}
          <button
            onClick={() => {
              audioService.playPop();
              setShowAiModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-display font-black text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>Make New Story</span>
          </button>

          {/* Stories Completed Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-extrabold">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Read: {storiesCompleted.length} / {allStories.length}</span>
          </div>
        </div>
      </div>

      {/* Story Book Carousel & Reader */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Story Selection Shelf */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-extrabold text-stone-600 uppercase tracking-wider block">
            Choose a Story:
          </span>
          <div className="max-h-[460px] overflow-y-auto space-y-2.5 pr-1">
            {allStories.map((story) => {
              const isSelected = selectedStory.id === story.id;
              const isDone = storiesCompleted.includes(story.id);

              return (
                <button
                  key={story.id}
                  onClick={() => handleSelectStory(story)}
                  className={`w-full p-3 rounded-2xl text-left transition-all border-2 flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-300'
                      : 'bg-[#FAF8F5] hover:bg-[#FFFDF7] border-amber-200'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#FFFDF7] border border-amber-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    {story.scenes[0]?.illustration || '📖'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-black text-sm text-stone-900 truncate">
                      {story.title}
                    </div>
                    <div className="text-[11px] text-stone-500 font-bold truncate">
                      Lesson: {story.moral}
                    </div>
                  </div>
                  {isDone && (
                    <span className="text-amber-600 font-extrabold text-xs shrink-0">★ Done</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Illustrated Storybook Viewer */}
        <div className="lg:col-span-8 bg-gradient-to-b from-amber-50/70 to-orange-50/50 p-6 rounded-3xl border-2 border-amber-200/80 shadow-md flex flex-col justify-between min-h-[460px]">
          <div>
            {/* Story Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-amber-200/80">
              <div>
                <h3 className="text-lg md:text-xl font-display font-black text-stone-900">
                  {selectedStory.title}
                </h3>
                <span className="text-xs text-amber-800 font-extrabold">
                  Page {currentSceneIdx + 1} of {selectedStory.scenes.length}
                </span>
              </div>

              <button
                onClick={handleReadAloud}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF7] hover:bg-amber-100 text-amber-900 font-extrabold text-xs shadow-xs border border-amber-200 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Read to Me</span>
              </button>
            </div>

            {/* Illustration & Scene Visual */}
            <div className="my-6 text-center">
              <div className="text-7xl md:text-8xl my-3 animate-bounce">
                {activeScene.illustration}
              </div>
              {activeScene.title && (
                <div className="font-display font-black text-base text-stone-900 mb-2">
                  {activeScene.title}
                </div>
              )}
              <div className="bg-[#FFFDF7] p-5 rounded-2xl border border-amber-200/80 shadow-xs max-w-xl mx-auto">
                <p className="text-base md:text-lg text-stone-800 font-medium leading-relaxed">
                  {sceneNarration}
                </p>
                {activeScene.caption && (
                  <p className="text-xs text-stone-500 mt-2 font-semibold italic">
                    "{activeScene.caption}"
                  </p>
                )}
              </div>

              {/* Interactive Scene Prompt */}
              {activeScene.interactionPrompt && (
                <button
                  onClick={handleInteractivePromptTap}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-extrabold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{activeScene.interactionPrompt}</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Scene Carousel Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-amber-200 mt-4">
            <button
              onClick={handlePrevScene}
              disabled={currentSceneIdx === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded-2xl font-extrabold text-sm transition-all cursor-pointer ${
                currentSceneIdx === 0
                  ? 'opacity-40 bg-amber-50 text-stone-400 cursor-not-allowed border border-amber-200'
                  : 'bg-[#FFFDF7] hover:bg-amber-100 text-stone-700 shadow-xs border border-amber-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Scene Dots */}
            <div className="flex items-center gap-1.5">
              {selectedStory.scenes.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentSceneIdx
                      ? 'w-6 bg-amber-500'
                      : idx < currentSceneIdx
                      ? 'w-2.5 bg-amber-300'
                      : 'w-2.5 bg-amber-100'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextScene}
              className="flex items-center gap-1 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>
                {currentSceneIdx === selectedStory.scenes.length - 1 ? 'Finish Story ★' : 'Next Page'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Story Creation Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-orange-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 mb-4 text-orange-600 font-display font-extrabold text-lg">
              <Wand2 className="w-5 h-5" />
              <span>AI Meadow Story Creator</span>
            </div>
            <p className="text-xs text-stone-600 mb-4">
              Choose a theme and character to generate a brand new interactive illustrated story:
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Story Theme:</label>
                <select
                  value={generationTheme}
                  onChange={(e) => setGenerationTheme(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="Kindness & Sharing">Kindness & Sharing</option>
                  <option value="Courage & Teamwork">Courage & Teamwork</option>
                  <option value="Wonder of Nature">Wonder of Nature</option>
                  <option value="Bedtime Lullaby & Calm">Bedtime Lullaby & Calm</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Main Meadow Character:</label>
                <select
                  value={generationCharacter}
                  onChange={(e) => setGenerationCharacter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="Barnaby the Bear">Barnaby the Bear 🐻</option>
                  <option value="Pippin the Bunny">Pippin the Bunny 🐰</option>
                  <option value="Daphne the Duck">Daphne the Duck 🦆</option>
                  <option value="Sammy the Squirrel">Sammy the Squirrel 🐿️</option>
                  <option value="Oliver the Owl">Oliver the Owl 🦉</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-sm font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAiStory}
                disabled={isGeneratingStory}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isGeneratingStory ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing Story...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Story</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
