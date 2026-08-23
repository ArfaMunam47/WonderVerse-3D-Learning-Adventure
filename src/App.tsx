import React, { useState, useEffect, useCallback } from 'react';
import { WorldZoneId, AccessibilitySettings, UserProgress, CharacterGender, ExplorerCharacterId } from './types';
import { MeadowCanvas } from './components/3d/MeadowCanvas';
import { TopNavBar } from './components/navigation/TopNavBar';
import { WorldMapModal } from './components/world/WorldMapModal';
import { LearnModal } from './components/navigation/LearnModal';
import { RewardsModal } from './components/navigation/RewardsModal';
import { AccessibilityMenu } from './components/accessibility/AccessibilityMenu';
import { ParentCaregiverArea } from './components/parent/ParentCaregiverArea';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { CharacterSelectionScreen } from './components/welcome/CharacterSelectionScreen';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { CustomCursor } from './components/cursor/CustomCursor';
import { EXPLORER_CHARACTERS } from './data/charactersData';

// Zone Learning Activity Components
import { AlphabetGroveZone } from './components/zones/AlphabetGroveZone';
import { NumberMeadowZone } from './components/zones/NumberMeadowZone';
import { FruitOrchardZone } from './components/zones/FruitOrchardZone';
import { AnimalFriendsZone } from './components/zones/AnimalFriendsZone';
import { CreativeCornerZone } from './components/zones/CreativeCornerZone';
import { MusicBellsZone } from './components/zones/MusicBellsZone';
import { StoryPavilionZone } from './components/zones/StoryPavilionZone';
import { StarObservatoryZone } from './components/zones/StarObservatoryZone';

import { audioService } from './utils/audio';
import { api, AuthUser, UserProfile } from './utils/api';
import { authService } from './services/authService';

const STORAGE_KEY_PROGRESS = 'wonder_meadow_progress_v4';
const STORAGE_KEY_A11Y = 'wonder_meadow_a11y_v4';
const STORAGE_KEY_CHARACTER_ID = 'wonder_meadow_character_id_v4';
const STORAGE_KEY_GENDER = 'wonder_meadow_gender_v4';
const STORAGE_KEY_GUEST_NAME = 'wonder_meadow_guest_name_v4';

export default function App() {
  // Loading state during initial authentication session check
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Navigation Flow: 'welcome' -> 'character_select' -> 'world'
  const [screenMode, setScreenMode] = useState<'welcome' | 'character_select' | 'world'>('welcome');
  const [activeZone, setActiveZone] = useState<WorldZoneId | null>(null);

  // Authentication & Profile State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Explorer Character Selection State (Persisted)
  const [characterId, setCharacterId] = useState<ExplorerCharacterId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHARACTER_ID) as ExplorerCharacterId;
      if (saved && EXPLORER_CHARACTERS.some((c) => c.id === saved)) return saved;
    } catch {}
    return 'curious_explorer';
  });

  const [guestGender, setGuestGender] = useState<CharacterGender>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GENDER);
      if (saved === 'boy' || saved === 'girl') return saved;
    } catch {}
    return 'girl';
  });

  const [guestName, setGuestName] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_GUEST_NAME) || 'Explorer';
    } catch {}
    return 'Explorer';
  });

  // Modals state
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isLearnOpen, setIsLearnOpen] = useState<boolean>(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState<boolean>(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [isCaregiverOpen, setIsCaregiverOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isCharacterPickerOpen, setIsCharacterPickerOpen] = useState<boolean>(false);

  // Current effective gender & character
  const currentGender: CharacterGender = profile?.gender || user?.gender || guestGender;

  // Accessibility settings
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_A11Y);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      soundEnabled: true,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      narrationEnabled: true,
      reducedMotion: false,
      highContrast: false,
      dyslexicFont: false,
      largeText: false,
      largeHitTargets: false
    };
  });

  // User learning progress & stars
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      stars: 0,
      completedActivities: [],
      discoveredItems: [],
      stickersUnlocked: [],
      zoneVisits: {
        alphabet: 0,
        numbers: 0,
        fruits: 0,
        animals: 0,
        creative: 0,
        music: 0,
        stories: 0,
        stars: 0
      },
      favoriteZone: 'alphabet',
      lastPlayed: new Date().toISOString()
    };
  });

  // Check initial authentication session on boot and listen to auth changes
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const res = await api.getMe();
        if (isMounted && res.success && res.user && res.profile) {
          setUser(res.user);
          setProfile(res.profile);
          if (res.profile.characterId && EXPLORER_CHARACTERS.some((c) => c.id === res.profile?.characterId)) {
            setCharacterId(res.profile.characterId as ExplorerCharacterId);
          }
          if (res.progress) {
            setProgress(res.progress);
          }
          if (res.preferences) {
            setAccessibility(res.preferences);
          }
        }
      } catch (err) {
        console.warn('Session verification notice:', err);
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    initSession();

    // Subscribe to auth state updates (token refresh, sign in, sign out)
    const unsubscribe = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        const res = await api.getMe();
        if (isMounted && res.success && res.user && res.profile) {
          setUser(res.user);
          setProfile(res.profile);
          if (res.progress) setProgress(res.progress);
          if (res.preferences) setAccessibility(res.preferences);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sync audio settings
  useEffect(() => {
    audioService.setSettings(
      accessibility.soundEnabled,
      accessibility.sfxVolume,
      accessibility.narrationEnabled
    );
    try {
      localStorage.setItem(STORAGE_KEY_A11Y, JSON.stringify(accessibility));
    } catch {
      // Storage catch
    }
  }, [accessibility]);

  // Persist progress locally and sync with backend if authenticated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch {
      // Storage catch
    }
    if (user) {
      api.syncProgress(progress);
    }
  }, [progress, user]);

  // Handle Character Change and persist
  const handleSelectCharacter = useCallback((newCharId: ExplorerCharacterId) => {
    setCharacterId(newCharId);
    const charObj = EXPLORER_CHARACTERS.find((c) => c.id === newCharId);
    if (charObj) {
      const mappedGender: CharacterGender = charObj.genderStyle === 'boy' ? 'boy' : 'girl';
      setGuestGender(mappedGender);
      try {
        localStorage.setItem(STORAGE_KEY_CHARACTER_ID, newCharId);
        localStorage.setItem(STORAGE_KEY_GENDER, mappedGender);
      } catch {}

      if (user && profile) {
        api.updateProfile({
          characterId: newCharId,
          gender: mappedGender,
          avatar: charObj.avatarEmoji
        });
      }
    }
  }, [user, profile]);

  const handleSelectZone = useCallback((zoneId: WorldZoneId) => {
    setActiveZone(zoneId);
    setProgress((prev) => ({
      ...prev,
      zoneVisits: {
        ...prev.zoneVisits,
        [zoneId]: (prev.zoneVisits[zoneId] || 0) + 1
      },
      lastPlayed: new Date().toISOString()
    }));
  }, []);

  const handleEarnStar = useCallback(() => {
    audioService.playSparkle();
    setProgress((prev) => ({
      ...prev,
      stars: prev.stars + 1
    }));
  }, []);

  const handleUpdateAccessibility = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setAccessibility((prev) => {
      const updated = { ...prev, ...newSettings };
      if (user) {
        api.savePreferences(updated);
      }
      return updated;
    });
  }, [user]);

  const handleToggleSound = useCallback(() => {
    const next = !accessibility.soundEnabled;
    audioService.playPop();
    handleUpdateAccessibility({ soundEnabled: next });
  }, [accessibility.soundEnabled, handleUpdateAccessibility]);

  const handleToggleReducedMotion = useCallback(() => {
    const next = !accessibility.reducedMotion;
    audioService.playPop();
    handleUpdateAccessibility({ reducedMotion: next });
  }, [accessibility.reducedMotion, handleUpdateAccessibility]);

  const handleUpdateProfile = async (
    name: string,
    avatar: string,
    favoriteZone?: string | null,
    gender?: CharacterGender,
    newCharId?: ExplorerCharacterId
  ) => {
    const chosenGender = gender || currentGender;
    const chosenChar = newCharId || characterId;
    if (user) {
      const res = await api.updateProfile({
        childName: name,
        avatar,
        favoriteZone,
        gender: chosenGender,
        characterId: chosenChar
      });
      if (res.success && res.profile) {
        setProfile(res.profile);
        if (res.user) setUser(res.user);
        setGuestGender(chosenGender);
        if (chosenChar) setCharacterId(chosenChar);
      }
    } else {
      // Guest local profile
      setGuestGender(chosenGender);
      setGuestName(name);
      if (chosenChar) setCharacterId(chosenChar);
      try {
        localStorage.setItem(STORAGE_KEY_GENDER, chosenGender);
        localStorage.setItem(STORAGE_KEY_GUEST_NAME, name);
        if (chosenChar) localStorage.setItem(STORAGE_KEY_CHARACTER_ID, chosenChar);
      } catch {}
      setProfile({
        userId: 'guest',
        childName: name,
        avatar,
        favoriteZone,
        gender: chosenGender,
        characterId: chosenChar,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleAuthSuccess = (authData: {
    user: AuthUser;
    profile: UserProfile;
    progress?: UserProgress;
    preferences?: AccessibilitySettings;
  }) => {
    setUser(authData.user);
    setProfile(authData.profile);
    if (authData.profile?.gender) {
      setGuestGender(authData.profile.gender);
    }
    if (authData.profile?.characterId && EXPLORER_CHARACTERS.some((c) => c.id === authData.profile?.characterId)) {
      setCharacterId(authData.profile.characterId as ExplorerCharacterId);
    }
    if (authData.progress) setProgress(authData.progress);
    if (authData.preferences) setAccessibility(authData.preferences);
  };

  const handleGuestContinue = (guestData: { childName: string; gender: CharacterGender; avatar: string }) => {
    setGuestGender(guestData.gender);
    setGuestName(guestData.childName);
    try {
      localStorage.setItem(STORAGE_KEY_GENDER, guestData.gender);
      localStorage.setItem(STORAGE_KEY_GUEST_NAME, guestData.childName);
    } catch {}
    setProfile({
      userId: 'guest',
      childName: guestData.childName,
      avatar: guestData.avatar,
      gender: guestData.gender,
      characterId,
      favoriteZone: 'alphabet',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setScreenMode('world');
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setProfile(null);
    audioService.playPop();
  };

  const handleResetProgress = () => {
    const freshProgress: UserProgress = {
      stars: 0,
      completedActivities: [],
      discoveredItems: [],
      stickersUnlocked: [],
      zoneVisits: {
        alphabet: 0,
        numbers: 0,
        fruits: 0,
        animals: 0,
        creative: 0,
        music: 0,
        stories: 0,
        stars: 0
      },
      favoriteZone: 'alphabet',
      lastPlayed: new Date().toISOString()
    };
    setProgress(freshProgress);
    if (user) {
      api.syncProgress(freshProgress);
    }
  };

  if (isAuthLoading) {
    return (
      <div
        id="wonder-meadow-app-loading"
        className="flex flex-col items-center justify-center w-screen h-screen bg-[#E0F2FE] select-none"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-3xl bg-white/90 shadow-md flex items-center justify-center text-3xl border border-sky-200 animate-bounce">
            🌿
          </div>
          <p className="font-display font-black text-sky-900 text-base tracking-wide">
            Entering Wonder Meadow...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="wonder-meadow-app"
      className={`flex flex-col w-screen h-screen overflow-hidden select-none bg-[#E0F2FE] ${
        accessibility.reducedMotion ? 'reduced-motion' : ''
      } ${accessibility.highContrast ? 'high-contrast' : ''} ${
        accessibility.dyslexicFont ? 'font-serif text-lg' : ''
      }`}
    >
      {/* Interactive Custom Cursor */}
      <CustomCursor />

      {/* 1. STORYBOOK WELCOME SCREEN */}
      {screenMode === 'welcome' && (
        <WelcomeScreen
          onStartAdventure={() => setScreenMode('character_select')}
          onOpenParentArea={() => setIsCaregiverOpen(true)}
          soundEnabled={accessibility.soundEnabled}
          onToggleSound={handleToggleSound}
          reducedMotion={accessibility.reducedMotion}
          onToggleReducedMotion={handleToggleReducedMotion}
        />
      )}

      {/* 2. CHOOSE YOUR FRIEND / CHARACTER SELECTION SCREEN */}
      {screenMode === 'character_select' && (
        <CharacterSelectionScreen
          selectedCharacterId={characterId}
          onSelectCharacter={handleSelectCharacter}
          progress={progress}
          onConfirm={(pickedId) => {
            handleSelectCharacter(pickedId);
            setScreenMode('world');
          }}
          onBack={() => setScreenMode('welcome')}
          onOpenParentArea={() => setIsCaregiverOpen(true)}
        />
      )}

      {/* 3. PRIMARY GAME WORLD & EXPLORATION VIEW */}
      {screenMode === 'world' && (
        <>
          {/* Top Navigation Bar */}
          <TopNavBar
            activeZoneId={activeZone}
            onGoHome={() => {
              if (activeZone) {
                setActiveZone(null);
              } else {
                setScreenMode('welcome');
              }
            }}
            onOpenMap={() => setIsMapOpen(true)}
            onOpenLearn={() => setIsLearnOpen(true)}
            onOpenRewards={() => setIsRewardsOpen(true)}
            onOpenAccessibility={() => setIsAccessibilityOpen(true)}
            onOpenCaregiver={() => setIsCaregiverOpen(true)}
            onOpenCharacterPicker={() => setIsCharacterPickerOpen(true)}
            characterId={characterId}
            onOpenProfile={() => {
              if (user) {
                setIsProfileOpen(true);
              } else {
                setIsAuthOpen(true);
              }
            }}
            stars={progress.stars}
            accessibility={accessibility}
            onToggleSound={handleToggleSound}
            user={user}
            profile={profile}
          />

          {/* 3D World Viewport */}
          <main className="relative flex-1 w-full min-h-0 overflow-hidden">
            <MeadowCanvas
              activeZone={activeZone}
              onSelectZone={handleSelectZone}
              onOpenMap={() => setIsMapOpen(true)}
              reducedMotion={accessibility.reducedMotion}
              gender={currentGender}
              characterId={characterId}
              destinationZone={profile?.favoriteZone || progress.favoriteZone}
              onEarnStar={handleEarnStar}
            />

            {/* Active Zone Learning Overlays */}
            {activeZone && (
              <div
                id="active-zone-view-overlay"
                className="absolute inset-0 z-20 p-3 md:p-6 overflow-y-auto flex items-start justify-center animate-in fade-in zoom-in-95 pointer-events-auto bg-amber-950/30 backdrop-blur-xs"
              >
                <div className="w-full max-w-5xl my-auto">
                  {activeZone === 'alphabet' && (
                    <AlphabetGroveZone
                      onEarnStar={handleEarnStar}
                      onBack={() => setActiveZone(null)}
                      highContrast={accessibility.highContrast}
                    />
                  )}
                  {activeZone === 'numbers' && (
                    <NumberMeadowZone
                      onEarnStar={handleEarnStar}
                      onBack={() => setActiveZone(null)}
                    />
                  )}
                  {activeZone === 'fruits' && (
                    <FruitOrchardZone
                      onEarnStar={handleEarnStar}
                      onBack={() => setActiveZone(null)}
                    />
                  )}
                  {activeZone === 'animals' && (
                    <AnimalFriendsZone
                      onEarnStar={handleEarnStar}
                      onBack={() => setActiveZone(null)}
                    />
                  )}
                  {activeZone === 'creative' && (
                    <CreativeCornerZone
                      onEarnStar={handleEarnStar}
                      onBack={() => setActiveZone(null)}
                    />
                  )}
                  {activeZone === 'music' && (
                    <MusicBellsZone
                      onEarnStar={handleEarnStar}
                      onBack={() => setActiveZone(null)}
                    />
                  )}
                  {activeZone === 'stories' && (
                    <StoryPavilionZone
                      onEarnStar={handleEarnStar}
                      onBack={() => setActiveZone(null)}
                    />
                  )}
                  {activeZone === 'stars' && (
                    <StarObservatoryZone
                      totalStars={progress.stars}
                      onEarnStar={handleEarnStar}
                      onBack={() => setActiveZone(null)}
                    />
                  )}
                </div>
              </div>
            )}
          </main>
        </>
      )}

      {/* IN-GAME CHARACTER PICKER MODAL (Switch characters anytime) */}
      {isCharacterPickerOpen && (
        <CharacterSelectionScreen
          selectedCharacterId={characterId}
          onSelectCharacter={handleSelectCharacter}
          progress={progress}
          onConfirm={(pickedId) => {
            handleSelectCharacter(pickedId);
            setIsCharacterPickerOpen(false);
          }}
          onBack={() => setIsCharacterPickerOpen(false)}
          isIngameModal={true}
        />
      )}

      {/* LEARN ADVENTURES MODAL */}
      <LearnModal
        isOpen={isLearnOpen}
        onClose={() => setIsLearnOpen(false)}
        onSelectZone={(zId) => {
          setIsLearnOpen(false);
          handleSelectZone(zId);
        }}
        activeZoneId={activeZone}
        zoneVisits={progress.zoneVisits}
      />

      {/* REWARDS & FRIENDS MODAL */}
      <RewardsModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        progress={progress}
        activeCharacterId={characterId}
        onSelectCharacter={handleSelectCharacter}
      />

      {/* USER PROFILE & PASSPORT MODAL */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        profile={profile}
        progress={progress}
        accessibility={accessibility}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
        onOpenAuthModal={() => {
          setIsProfileOpen(false);
          setIsAuthOpen(true);
        }}
      />

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onGuestContinue={handleGuestContinue}
      />

      {/* WORLD MAP MODAL */}
      <WorldMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectZone={(zId) => {
          setIsMapOpen(false);
          handleSelectZone(zId);
        }}
        activeZoneId={activeZone}
      />

      {/* ACCESSIBILITY & COMFORT MENU */}
      <AccessibilityMenu
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        settings={accessibility}
        onUpdateSettings={handleUpdateAccessibility}
      />

      {/* PARENT & CAREGIVER AREA */}
      <ParentCaregiverArea
        isOpen={isCaregiverOpen}
        onClose={() => setIsCaregiverOpen(false)}
        progress={progress}
        user={user}
        profile={profile}
        accessibility={accessibility}
        onUpdateAccessibility={handleUpdateAccessibility}
        onResetProgress={handleResetProgress}
        onSelectZone={(zId) => {
          setIsCaregiverOpen(false);
          handleSelectZone(zId);
        }}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}
