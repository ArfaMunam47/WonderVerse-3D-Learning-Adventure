import React from 'react';
import { WorldZoneId, AccessibilitySettings, ExplorerCharacterId } from '../../types';
import { WORLD_ZONES } from '../../data/worldZones';
import { EXPLORER_CHARACTERS } from '../../data/charactersData';
import { AuthUser, UserProfile } from '../../utils/api';
import { audioService } from '../../utils/audio';
import { 
  ArrowLeft, 
  Home,
  Compass, 
  BookOpen,
  Star, 
  Volume2, 
  VolumeX, 
  Settings, 
  User,
  Shield
} from 'lucide-react';

interface TopNavBarProps {
  activeZoneId: WorldZoneId | null;
  onGoHome: () => void;
  onOpenMap: () => void;
  onOpenLearn: () => void;
  onOpenRewards: () => void;
  onOpenAccessibility: () => void;
  onOpenCaregiver: () => void;
  onOpenProfile: () => void;
  onOpenCharacterPicker: () => void;
  characterId?: ExplorerCharacterId;
  stars: number;
  accessibility: AccessibilitySettings;
  onToggleSound: () => void;
  user: AuthUser | null;
  profile: UserProfile | null;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeZoneId,
  onGoHome,
  onOpenMap,
  onOpenLearn,
  onOpenRewards,
  onOpenAccessibility,
  onOpenCaregiver,
  onOpenProfile,
  onOpenCharacterPicker,
  characterId = 'curious_explorer',
  stars,
  accessibility,
  onToggleSound,
  user,
  profile
}) => {
  const activeZone = WORLD_ZONES.find(z => z.id === activeZoneId);
  const activeChar = EXPLORER_CHARACTERS.find(c => c.id === characterId) || EXPLORER_CHARACTERS[0];

  // 1. ACTIVE LEARNING ACTIVITY HUD NAVBAR (Simple, focused, universal Back button)
  if (activeZoneId && activeZone) {
    return (
      <header
        id="wonder-meadow-learning-header"
        className="w-full z-30 px-3 md:px-6 py-2.5 flex items-center justify-between pointer-events-auto select-none bg-[#FFFDF7]/95 backdrop-blur-md border-b border-amber-200/80 shrink-0"
      >
        {/* Universal Back Button */}
        <div className="flex items-center gap-2">
          <button
            id="btn-learning-back"
            onClick={() => {
              audioService.playPop();
              onGoHome();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200/90 rounded-2xl border border-amber-300 text-stone-800 font-display font-black text-sm shadow-xs active:scale-95 transition-all cursor-pointer"
            aria-label="Back to Meadow"
          >
            <ArrowLeft className="w-4 h-4 text-sky-700" />
            <span>← Back to Meadow</span>
          </button>

          {/* Current Activity Label */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-amber-200 text-xs font-bold text-stone-800">
            <span>{activeZone.icon}</span>
            <span className="font-display font-black">{activeZone.name}</span>
          </div>
        </div>

        {/* Right Stars & Sound */}
        <div className="flex items-center gap-2">
          <div
            id="learning-star-counter"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 font-display font-black text-sm shadow-2xs"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{stars}</span>
          </div>

          <button
            onClick={onToggleSound}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
              accessibility.soundEnabled
                ? 'bg-white border-amber-200 text-sky-700 hover:bg-sky-50'
                : 'bg-rose-50 border-rose-300 text-rose-600'
            }`}
            aria-label={accessibility.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            title={accessibility.soundEnabled ? 'Sound is ON' : 'Sound is OFF'}
          >
            {accessibility.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>
    );
  }

  // 2. PRIMARY GAME WORLD HUD NAVBAR (Organized, clean, child-friendly)
  return (
    <header
      id="wonder-meadow-world-navbar"
      className="w-full z-30 px-3 md:px-5 py-2.5 flex items-center justify-between pointer-events-auto select-none bg-[#FFFDF7]/95 backdrop-blur-md border-b border-amber-200/80 shrink-0"
    >
      {/* Left: Wonder Meadow Brand & Home */}
      <div className="flex items-center gap-2">
        <button
          id="btn-nav-home"
          onClick={() => {
            audioService.playPop();
            onGoHome();
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl hover:bg-amber-100/60 text-stone-800 font-display font-black text-base md:text-lg active:scale-95 transition-all cursor-pointer"
          title="Return to Welcome"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-sky-400 text-white flex items-center justify-center text-base shadow-2xs">
            🌱
          </span>
          <span className="tracking-tight hidden sm:inline">Wonder Meadow</span>
        </button>

        {/* Quick Character Switcher Button */}
        <button
          id="btn-switch-character"
          onClick={() => {
            audioService.playPop();
            onOpenCharacterPicker();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-stone-800 border border-amber-300 shadow-2xs text-xs font-bold cursor-pointer active:scale-95 transition-all"
          title="Change Explorer Friend"
        >
          <span className="text-sm">{activeChar.avatarEmoji}</span>
          <span className="font-display font-extrabold">{activeChar.name}</span>
        </button>
      </div>

      {/* Center: Primary Navigation (Explore, Learn, Rewards) */}
      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Game Navigation">
        {/* 🗺 Explore */}
        <button
          id="btn-nav-explore"
          onClick={() => {
            audioService.playPop();
            onOpenMap();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-amber-50 text-stone-800 border border-amber-200 font-display font-bold text-xs md:text-sm shadow-2xs active:scale-95 transition-all cursor-pointer"
          title="Open World Map"
        >
          <Compass className="w-4 h-4 text-sky-600" />
          <span>Explore</span>
        </button>

        {/* 📚 Learn */}
        <button
          id="btn-nav-learn"
          onClick={() => {
            audioService.playPop();
            onOpenLearn();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-amber-50 text-stone-800 border border-amber-200 font-display font-bold text-xs md:text-sm shadow-2xs active:scale-95 transition-all cursor-pointer"
          title="Learning Activities"
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Learn</span>
        </button>

        {/* ⭐ Rewards */}
        <button
          id="btn-nav-rewards"
          onClick={() => {
            audioService.playPop();
            onOpenRewards();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-display font-black text-xs md:text-sm shadow-2xs active:scale-95 transition-all cursor-pointer"
          title="Stars and Badges"
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>{stars} Stars</span>
        </button>
      </nav>

      {/* Right: Secondary Actions (Profile, Settings, Sound) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Profile / Passport Button */}
        <button
          id="btn-open-profile"
          onClick={() => {
            audioService.playPop();
            onOpenProfile();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-white hover:bg-amber-50 text-stone-800 border border-amber-200 text-xs font-display font-bold shadow-2xs cursor-pointer active:scale-95 transition-all"
          title="Explorer Profile & Passport"
        >
          <User className="w-4 h-4 text-purple-600" />
          <span className="hidden md:inline">
            {profile?.childName || user?.childName || 'Passport'}
          </span>
        </button>

        {/* Sound Toggle */}
        <button
          id="btn-toggle-sound"
          onClick={onToggleSound}
          className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-2xs transition-all active:scale-95 cursor-pointer ${
            accessibility.soundEnabled
              ? 'bg-white border-amber-200 text-sky-700 hover:bg-sky-50'
              : 'bg-rose-50 border-rose-300 text-rose-600'
          }`}
          aria-label={accessibility.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          title={accessibility.soundEnabled ? 'Sound is ON' : 'Sound is OFF'}
        >
          {accessibility.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Settings & Accessibility / Caregiver Menu */}
        <button
          id="btn-open-settings"
          onClick={() => {
            audioService.playPop();
            onOpenAccessibility();
          }}
          className="w-9 h-9 rounded-2xl bg-white border border-amber-200 text-stone-700 flex items-center justify-center shadow-2xs hover:bg-amber-50 active:scale-95 transition-all cursor-pointer"
          aria-label="Settings & Accessibility"
          title="Settings & Accessibility"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Parent Area (Discreet shield for parents) */}
        <button
          id="btn-open-caregiver"
          onClick={() => {
            audioService.playPop();
            onOpenCaregiver();
          }}
          className="w-9 h-9 rounded-2xl bg-white border border-amber-200 text-sky-700 flex items-center justify-center shadow-2xs hover:bg-sky-50 active:scale-95 transition-all cursor-pointer"
          aria-label="Parent Area"
          title="Parent Dashboard"
        >
          <Shield className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
