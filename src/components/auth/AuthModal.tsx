import React, { useState } from 'react';
import { api, AuthUser, UserProfile } from '../../utils/api';
import { UserProgress, AccessibilitySettings, CharacterGender } from '../../types';
import { audioService } from '../../utils/audio';
import { X, Sparkles, User, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Compass, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (authData: {
    user: AuthUser;
    profile: UserProfile;
    progress?: UserProgress;
    preferences?: AccessibilitySettings;
  }) => void;
  onGuestContinue?: (guestData: { childName: string; gender: CharacterGender; avatar: string }) => void;
}

const AVATAR_OPTIONS = ['🐰', '🦉', '🦊', '🦆', '🐻', '🐸', '🐱', '🐶'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onGuestContinue
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'signup' | 'guest'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [childName, setChildName] = useState('');
  const [gender, setGender] = useState<CharacterGender>('girl');
  const [selectedAvatar, setSelectedAvatar] = useState('🐰');
  const [role, setRole] = useState<'parent' | 'child'>('parent');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'guest') {
      const name = childName.trim() || 'Explorer';
      if (onGuestContinue) {
        onGuestContinue({
          childName: name,
          gender,
          avatar: selectedAvatar
        });
      }
      audioService.playSuccess();
      confetti({ particleCount: 40, spread: 60 });
      onClose();
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter an email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const res = await api.signup({
          email: email.trim(),
          password,
          childName: childName.trim() || 'Explorer',
          gender,
          avatar: selectedAvatar,
          role
        });

        if (res.success && res.user && res.profile) {
          audioService.playSuccess();
          confetti({ particleCount: 50, spread: 70 });
          onAuthSuccess({
            user: res.user,
            profile: res.profile,
            progress: res.progress,
            preferences: res.preferences
          });
          onClose();
        } else {
          setErrorMessage(res.error || "We couldn't create your account. Please try again.");
          audioService.playPop();
        }
      } else {
        const res = await api.login({
          email: email.trim(),
          password
        });

        if (res.success && res.user && res.profile) {
          audioService.playSuccess();
          confetti({ particleCount: 40, spread: 60 });
          onAuthSuccess({
            user: res.user,
            profile: res.profile,
            progress: res.progress,
            preferences: res.preferences
          });
          onClose();
        } else {
          setErrorMessage(res.error || 'The email or password is incorrect.');
          audioService.playPop();
        }
      }
    } catch {
      setErrorMessage("We couldn't connect right now. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-md bg-[#FFFDF7] rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-sky-600 via-amber-500 to-emerald-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <h2 id="auth-modal-title" className="text-lg font-display font-black text-white">
              {mode === 'signup' ? 'Create Explorer Passport' : mode === 'guest' ? 'Continue as Guest' : 'Welcome Back to Meadow'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-amber-50/50">
          <button
            type="button"
            onClick={() => {
              audioService.playPop();
              setMode('signup');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-xs font-black font-display uppercase tracking-wider transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'text-sky-800 border-b-2 border-sky-600 bg-[#FFFDF7]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              audioService.playPop();
              setMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-xs font-black font-display uppercase tracking-wider transition-colors cursor-pointer ${
              mode === 'login'
                ? 'text-sky-800 border-b-2 border-sky-600 bg-[#FFFDF7]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              audioService.playPop();
              setMode('guest');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-xs font-black font-display uppercase tracking-wider transition-colors cursor-pointer ${
              mode === 'guest'
                ? 'text-sky-800 border-b-2 border-sky-600 bg-[#FFFDF7]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Guest
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {(mode === 'signup' || mode === 'guest') && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Child's Explorer Name:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Maya, Leo, Oliver"
                  maxLength={25}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:outline-sky-500 focus:border-sky-500"
                  required={mode === 'signup'}
                />
              </div>
            </div>
          )}

          {/* Character Gender / Appearance Selection */}
          {(mode === 'signup' || mode === 'guest') && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Choose Explorer Character:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    audioService.playPop();
                    setGender('girl');
                  }}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                    gender === 'girl'
                      ? 'border-rose-500 bg-rose-50/80 shadow-xs ring-2 ring-rose-300'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <span className="text-3xl">👧</span>
                  <div>
                    <span className="block font-display font-black text-xs text-stone-900">
                      Girl Explorer
                    </span>
                    <span className="block text-[10px] text-stone-500">
                      Pigtails & Coral Hoodie
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audioService.playPop();
                    setGender('boy');
                  }}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                    gender === 'boy'
                      ? 'border-sky-500 bg-sky-50/80 shadow-xs ring-2 ring-sky-300'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <span className="text-3xl">👦</span>
                  <div>
                    <span className="block font-display font-black text-xs text-stone-900">
                      Boy Explorer
                    </span>
                    <span className="block text-[10px] text-stone-500">
                      Cap & Sky Blue Hoodie
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {(mode === 'signup' || mode === 'guest') && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Pick Your Meadow Animal Companion:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      audioService.playPop();
                      setSelectedAvatar(av);
                    }}
                    className={`py-2 text-2xl rounded-xl border transition-all cursor-pointer ${
                      selectedAvatar === av
                        ? 'bg-sky-600 border-sky-600 text-white shadow-xs scale-105'
                        : 'bg-white border-stone-200 hover:bg-amber-50'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode !== 'guest' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {mode === 'signup' ? 'Parent / Family Email:' : 'Email Address:'}
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:outline-sky-500 focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Password:
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:outline-sky-500 focus:border-sky-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-stone-300 text-white font-display font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] mt-3"
          >
            {isLoading ? (
              <span>Connecting to Wonder Meadow...</span>
            ) : mode === 'signup' ? (
              <>
                <span>Begin My Meadow Adventure</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'guest' ? (
              <>
                <span>Explore Wonder Meadow as Guest</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Log In & Enter Meadow</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick 1-Click Parent Demo Button */}
          {mode !== 'guest' && (
            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                audioService.playPop();
                try {
                  const res = await api.signup({
                    email: `parent_${Math.floor(Math.random() * 8999 + 1000)}@family.wonder`,
                    password: 'password123',
                    childName: childName.trim() || 'Oliver',
                    gender,
                    avatar: selectedAvatar,
                    role: 'parent'
                  });
                  if (res.success && res.user && res.profile) {
                    audioService.playSuccess();
                    confetti({ particleCount: 50, spread: 70 });
                    onAuthSuccess({
                      user: res.user,
                      profile: res.profile,
                      progress: res.progress,
                      preferences: res.preferences
                    });
                    onClose();
                  }
                } catch {
                  setErrorMessage('Could not initialize demo profile.');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full py-2 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-display font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>⚡ 1-Click Test Parent Account (Instant Access)</span>
            </button>
          )}
        </form>

        {/* Footer Note */}
        <div className="p-3 bg-amber-50/70 border-t border-amber-200/60 text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <p className="text-[11px] text-stone-600 font-medium">
            100% Ad-Free • Child Privacy Protected • No In-App Tricks
          </p>
        </div>
      </div>
    </div>
  );
};
