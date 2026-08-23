import React, { useState } from 'react';
import { audioService } from '../../utils/audio';
import { AuthUser, UserProfile } from '../../utils/api';
import { CharacterGender } from '../../types';
import { ArrowRight, Heart, Star, Sparkles, User, Check } from 'lucide-react';

interface EntryWelcomeScreenProps {
  onEnterWorld: (customName?: string, gender?: CharacterGender) => void;
  onOpenAuth: () => void;
  user: AuthUser | null;
  profile: UserProfile | null;
  currentGender?: CharacterGender;
}

export const EntryWelcomeScreen: React.FC<EntryWelcomeScreenProps> = ({
  onEnterWorld,
  onOpenAuth,
  user,
  profile,
  currentGender = 'girl'
}) => {
  const [selectedGender, setSelectedGender] = useState<CharacterGender>(
    profile?.gender || user?.gender || currentGender
  );
  const [guestName, setGuestName] = useState(
    profile?.childName || user?.childName || ''
  );

  const handleEnter = () => {
    audioService.playSparkle();
    const effectiveName = user
      ? (profile?.childName || user.childName)
      : (guestName.trim() || 'Explorer');
    const greeting = user
      ? `Welcome back, ${effectiveName}! Let’s explore Wonder Meadow!`
      : `Welcome, ${effectiveName}! Let’s explore and play!`;
    audioService.speak(greeting);
    onEnterWorld(effectiveName, selectedGender);
  };

  return (
    <div
      id="wonder-meadow-welcome-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#E0F2FE] via-[#FFFDF7] to-[#FEF3C7] select-none text-center animate-in fade-in"
    >
      <div className="max-w-md w-full p-6 md:p-7 bg-[#FFFDF7]/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-amber-300 flex flex-col items-center relative overflow-hidden">
        {/* Friendly Meadow Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-400 to-sky-600 text-white flex items-center justify-center text-3xl shadow-md mb-2">
          {user ? (profile?.avatar || user.avatar || '🌱') : '🌱'}
        </div>

        <h1 className="font-display font-black text-3xl md:text-4xl text-stone-900 tracking-tight">
          Wonder Meadow
        </h1>

        <p className="font-display font-bold text-sm md:text-base text-sky-700 mt-0.5">
          {user
            ? `Welcome back, ${profile?.childName || user.childName}!`
            : 'A magical world to play, learn, and grow!'}
        </p>

        {/* Character Selection Option (Before Entering) */}
        {!user && (
          <div className="w-full mt-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3 text-left">
            <span className="block text-[11px] font-black text-stone-700 uppercase tracking-wider font-display mb-2">
              Choose Your Explorer:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  audioService.playPop();
                  setSelectedGender('girl');
                }}
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  selectedGender === 'girl'
                    ? 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-300 font-bold shadow-xs'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <span className="text-2xl">👧</span>
                <div>
                  <span className="block text-xs font-display font-black">Girl Explorer</span>
                  <span className="block text-[9px] text-stone-500">Pigtails & Coral Hoodie</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  audioService.playPop();
                  setSelectedGender('boy');
                }}
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  selectedGender === 'boy'
                    ? 'border-sky-500 bg-sky-50 text-sky-950 ring-2 ring-sky-300 font-bold shadow-xs'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <span className="text-2xl">👦</span>
                <div>
                  <span className="block text-xs font-display font-black">Boy Explorer</span>
                  <span className="block text-[9px] text-stone-500">Cap & Sky Blue Hoodie</span>
                </div>
              </button>
            </div>

            <div className="mt-2.5">
              <label className="block text-[10px] font-bold text-stone-600 mb-1">
                Your Explorer Name (Optional):
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Maya, Leo, Pippin"
                maxLength={20}
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-sky-500"
              />
            </div>
          </div>
        )}

        {/* Enter Meadow Primary Button */}
        <button
          id="btn-enter-meadow"
          onClick={handleEnter}
          className="mt-4 w-full max-w-xs py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-display font-black text-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          autoFocus
        >
          <span>{user ? 'Continue Adventure' : 'Enter the Meadow'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Sign In / Create Passport Secondary Option */}
        {!user && (
          <button
            type="button"
            onClick={() => {
              audioService.playPop();
              onOpenAuth();
            }}
            className="mt-2 text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 cursor-pointer py-1"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In / Create Explorer Passport</span>
          </button>
        )}

        {/* Friendly Trust Indicators */}
        <div className="mt-4 pt-3 border-t border-amber-200/80 w-full flex items-center justify-center gap-4 text-xs font-bold text-stone-600">
          <span className="flex items-center gap-1 text-amber-800">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>Earn Stars</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Child-Safe</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-rose-800">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500" />
            <span>Ad-Free</span>
          </span>
        </div>
      </div>
    </div>
  );
};
