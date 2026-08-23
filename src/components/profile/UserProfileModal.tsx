import React, { useState } from 'react';
import { UserProgress, AccessibilitySettings } from '../../types';
import { AuthUser, UserProfile, api } from '../../utils/api';
import { audioService } from '../../utils/audio';
import { WORLD_ZONES } from '../../data/worldZones';
import {
  X,
  User,
  Sparkles,
  LogOut,
  Award,
  BookOpen,
  Music,
  CheckCircle2,
  Heart,
  Settings,
  Edit2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  profile: UserProfile | null;
  progress: UserProgress;
  accessibility: AccessibilitySettings;
  onUpdateProfile: (name: string, avatar: string, favoriteZone?: string | null, gender?: 'girl' | 'boy') => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
}

const AVATAR_CHOICES = [
  { emoji: '🐰', name: 'Pippin Bunny' },
  { emoji: '🦉', name: 'Oliver Owl' },
  { emoji: '🦊', name: 'Rusty Fox' },
  { emoji: '🦆', name: 'Daphne Duck' },
  { emoji: '🐻', name: 'Barnaby Bear' },
  { emoji: '🐸', name: 'Finley Frog' },
  { emoji: '🐱', name: 'Milo Kitten' },
  { emoji: '🐶', name: 'Bella Pup' },
  { emoji: '🦋', name: 'Pip Butterfly' },
  { emoji: '⭐', name: 'Nova Star' }
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  profile,
  progress,
  accessibility,
  onUpdateProfile,
  onLogout,
  onOpenAuthModal
}) => {
  if (!isOpen) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.childName || user?.childName || 'Explorer');
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar || user?.avatar || '🐰');
  const [selectedGender, setSelectedGender] = useState<'girl' | 'boy'>(profile?.gender || user?.gender || 'girl');
  const [favoriteZone, setFavoriteZone] = useState<string | null>(profile?.favoriteZone || progress.favoriteZone || 'alphabet');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile(editName.trim() || 'Explorer', selectedAvatar, favoriteZone, selectedGender);
      audioService.playSuccess();
      confetti({ particleCount: 35, spread: 60 });
      setIsEditing(false);
    } catch {
      // Handled
    } finally {
      setIsSaving(false);
    }
  };

  const completedCount = progress.completedActivities?.length || 0;
  const discoveredCount = progress.discoveredItems?.length || 0;

  return (
    <div
      id="user-profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div
        id="user-profile-modal-card"
        className="w-full max-w-lg bg-[#FFFDF7] rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-400 p-4 text-white relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30">
              {selectedAvatar}
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-xl font-display font-black text-white drop-shadow-xs">
                {user ? `${profile?.childName || user.childName}'s Meadow Passport` : 'Explorer Passport'}
              </h2>
              <p className="text-xs text-white/90 font-medium">
                {user ? user.email : 'Explore as Guest'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Guest Prompt Banner if not logged in */}
          {!user && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-black text-amber-950 font-display">Save Your Wonder Journey</h3>
                <p className="text-[11px] text-amber-900 mt-0.5">Sign in to save your stars and badges permanently on all devices.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  audioService.playPop();
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shrink-0 shadow-xs cursor-pointer"
              >
                Sign In / Sign Up
              </button>
            </div>
          )}

          {/* Child Profile & Avatar Section */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-stone-700 uppercase tracking-wider font-display">
                Explorer Character
              </span>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    audioService.playPop();
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Customize</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer bg-emerald-100/80 px-2.5 py-1 rounded-lg"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Child's Explorer Name:
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={25}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-sm font-bold text-stone-800 focus:outline-sky-500"
                    placeholder="Enter explorer name"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
                    3D Explorer Character:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        audioService.playPop();
                        setSelectedGender('girl');
                      }}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer text-left ${
                        selectedGender === 'girl'
                          ? 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-300 font-bold'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="text-2xl">👧</span>
                      <div>
                        <span className="block text-xs font-display font-black">Girl Explorer</span>
                        <span className="block text-[10px] text-stone-500">Pigtails & Hoodie</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        audioService.playPop();
                        setSelectedGender('boy');
                      }}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer text-left ${
                        selectedGender === 'boy'
                          ? 'border-sky-500 bg-sky-50 text-sky-950 ring-2 ring-sky-300 font-bold'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="text-2xl">👦</span>
                      <div>
                        <span className="block text-xs font-display font-black">Boy Explorer</span>
                        <span className="block text-[10px] text-stone-500">Cap & Hoodie</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
                    Choose Your Meadow Friend Avatar:
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_CHOICES.map((choice) => (
                      <button
                        key={choice.emoji}
                        type="button"
                        onClick={() => {
                          audioService.playPop();
                          setSelectedAvatar(choice.emoji);
                        }}
                        className={`p-2 rounded-xl text-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                          selectedAvatar === choice.emoji
                            ? 'bg-sky-600 text-white shadow-xs scale-105 ring-2 ring-sky-400'
                            : 'bg-white hover:bg-amber-100/70 border border-amber-200'
                        }`}
                        title={choice.name}
                      >
                        <span>{choice.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Favorite Meadow Area:
                  </label>
                  <select
                    value={favoriteZone || ''}
                    onChange={(e) => setFavoriteZone(e.target.value || null)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-stone-800"
                  >
                    {WORLD_ZONES.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.icon} {z.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 bg-white rounded-2xl border border-amber-200 shadow-2xs">
                  {selectedAvatar}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-display font-black text-stone-900">
                      {profile?.childName || user?.childName || 'Little Explorer'}
                    </h4>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-100 border border-amber-300 text-[10px] font-extrabold text-amber-900">
                      {(profile?.gender || user?.gender || selectedGender) === 'boy' ? '👦 Boy' : '👧 Girl'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-medium mt-0.5 flex items-center gap-1.5">
                    <span>Favorite:</span>
                    <span className="font-bold text-sky-700">
                      {WORLD_ZONES.find(z => z.id === (favoriteZone || 'alphabet'))?.name || 'Alphabet Grove'}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Learning Progress Summary */}
          <div>
            <h3 className="text-xs font-black text-stone-700 uppercase tracking-wider font-display mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Learning Milestones</span>
            </h3>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-amber-100/60 border border-amber-300/80 rounded-2xl p-3">
                <span className="text-2xl font-display font-black text-amber-700 block">
                  {progress.stars} ⭐
                </span>
                <span className="text-[11px] font-bold text-stone-700">Wonder Stars</span>
              </div>

              <div className="bg-sky-100/60 border border-sky-300/80 rounded-2xl p-3">
                <span className="text-2xl font-display font-black text-sky-700 block">
                  {completedCount} 🏆
                </span>
                <span className="text-[11px] font-bold text-stone-700">Activities Done</span>
              </div>

              <div className="bg-emerald-100/60 border border-emerald-300/80 rounded-2xl p-3">
                <span className="text-2xl font-display font-black text-emerald-700 block">
                  {discoveredCount} 🔍
                </span>
                <span className="text-[11px] font-bold text-stone-700">Meadow Discoveries</span>
              </div>
            </div>
          </div>

          {/* Zone Visits Breakdown */}
          <div>
            <h3 className="text-xs font-black text-stone-700 uppercase tracking-wider font-display mb-2">
              Explored Destinations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WORLD_ZONES.map((zone) => {
                const visits = progress.zoneVisits?.[zone.id] || 0;
                return (
                  <div
                    key={zone.id}
                    className="p-2 bg-white rounded-xl border border-stone-200 flex items-center gap-2 text-left"
                  >
                    <span className="text-xl shrink-0">{zone.icon}</span>
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-bold text-stone-800 truncate font-display">{zone.name}</p>
                      <p className="text-[10px] text-stone-600 font-medium">{visits} visits</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          {user ? (
            <button
              type="button"
              onClick={() => {
                audioService.playPop();
                onLogout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold border border-rose-200 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                audioService.playPop();
                onClose();
                onOpenAuthModal();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shadow-xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Create Account / Log In</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-900 text-xs font-black shadow-xs cursor-pointer font-display"
          >
            Back to Meadow
          </button>
        </div>
      </div>
    </div>
  );
};
