import React, { useState } from 'react';
import { UserProgress, AccessibilitySettings, WorldZoneId, ExplorerCharacterId } from '../../types';
import { WORLD_ZONES } from '../../data/worldZones';
import { EXPLORER_CHARACTERS, CHARACTER_UNLOCK_CONDITIONS, isCharacterUnlocked } from '../../data/charactersData';
import { AuthUser, UserProfile } from '../../utils/api';
import { audioService } from '../../utils/audio';
import { CharacterVisual } from '../welcome/CharacterVisual';
import { 
  X, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Award, 
  CheckCircle2, 
  Download, 
  Star, 
  ShieldCheck, 
  Sliders, 
  BookOpen, 
  Users, 
  Volume2, 
  Eye, 
  Type, 
  RotateCcw, 
  Sparkles, 
  Smile, 
  Check,
  User,
  Heart,
  Menu
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ParentCaregiverAreaProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  user?: AuthUser | null;
  profile?: UserProfile | null;
  accessibility?: AccessibilitySettings;
  onUpdateAccessibility?: (settings: Partial<AccessibilitySettings>) => void;
  onResetProgress: () => void;
  onSelectZone?: (zoneId: WorldZoneId) => void;
  onUpdateProfile?: (name: string, avatar: string, favoriteZone?: string | null, gender?: 'girl' | 'boy') => void;
}

type ParentTabId = 'overview' | 'learning_zones' | 'progress' | 'my_child' | 'characters' | 'settings';

interface LearningZoneGuide {
  id: string;
  zoneId: WorldZoneId;
  name: string;
  category: string;
  icon: string;
  themeColor: string;
  badge: string;
  description: string;
  skills: string[];
  sampleActivities: string[];
}

const LEARNING_ZONE_GUIDES: LearningZoneGuide[] = [
  {
    id: 'alphabet-grove',
    zoneId: 'alphabet',
    name: 'Alphabet Grove',
    category: 'Letters & Phonics Sounds',
    icon: '🌳',
    themeColor: '#0284C7',
    badge: 'Early Literacy',
    description: 'Children explore letters through an interactive natural environment rather than repetitive flashcards.',
    skills: [
      'Letter Recognition (A to Z uppercase & lowercase)',
      'Letter Sound Pronunciation & Phonics',
      'Word & Object Associations (e.g. A is for Apple)',
      'Alphabetical Ordering & Letter Paths',
      'Obstacle Problem Solving with Letters'
    ],
    sampleActivities: [
      'Interactive letter trees with native audio pronunciation',
      'Alphabet Gate challenge to open meadow paths',
      'Letter finding & balloon popping activities'
    ]
  },
  {
    id: 'color-meadow',
    zoneId: 'fruits',
    name: 'Color Meadow & Fruit Orchard',
    category: 'Colors, Matching & Sorting',
    icon: '🎨',
    themeColor: '#F59E0B',
    badge: 'Visual & Sensory',
    description: 'Children discover and differentiate colors through nature exploration and interactive sorting.',
    skills: [
      'Color Identification (Red, Yellow, Blue, Green, Purple, Orange)',
      'Visual Object & Color Matching',
      'Color Sorting & Gathering from Orchard Trees',
      'Color Blooming Bridges & Obstacles'
    ],
    sampleActivities: [
      'Picking distinct fruits from orchard trees',
      'Matching colors to solve the flower bridge obstacle',
      'Color basket sorting activities'
    ]
  },
  {
    id: 'number-trail',
    zoneId: 'numbers',
    name: 'Number Trail & Valley',
    category: 'Numbers & Counting',
    icon: '🔢',
    themeColor: '#3B82F6',
    badge: 'Early Numeracy',
    description: 'Children practice basic numbers and counting through tactile 3D interactions and stepping stone trails.',
    skills: [
      'Number Recognition (1 through 20)',
      '1-to-1 Counting Correspondence',
      'Counting Friendly Ducks on the Pond',
      'Stepping Stone Arithmetic & Sequencing'
    ],
    sampleActivities: [
      'Hop along numbered stepping stones across the brook',
      'Count ducks swimming in the central pond',
      'Collect and group meadow items by number'
    ]
  },
  {
    id: 'shape-garden',
    zoneId: 'creative',
    name: 'Shape Garden & Creative Corner',
    category: 'Shapes, Geometry & Art',
    icon: '🔷',
    themeColor: '#8B5CF6',
    badge: 'Spatial & Creative',
    description: 'Children discover circles, squares, triangles, rectangles, and diamonds through 3D exploration.',
    skills: [
      'Geometric Shape Recognition (Circle, Square, Triangle, Rectangle, Star)',
      'Spatial Reasoning & Shape Matching in Nature',
      'Creative Expression with Brushes & Stamps',
      'Fine Motor Coordination'
    ],
    sampleActivities: [
      'Discover shapes embedded in meadow architecture',
      'Canvas drawing and sticker placement',
      'Shape outline matching'
    ]
  },
  {
    id: 'nature-discovery',
    zoneId: 'animals',
    name: 'Nature Discovery & Animal Woods',
    category: 'Plants, Animals & Care',
    icon: '🌿',
    themeColor: '#10B981',
    badge: 'Nature & Science',
    description: 'Children explore living creatures, natural habitats, gentle sounds, and learn empathy for wildlife.',
    skills: [
      'Animal Identification & Habitat Recognition',
      'Real Animal Sounds & Audio Cues',
      'Flora & Fauna Appreciation (Trees, Flowers, Butterflies)',
      'Gentle Interaction & Care for Living Creatures'
    ],
    sampleActivities: [
      'Interact with woodland creatures in their treehouse habitats',
      'Listen to bird songs and frog croaks by the stream',
      'Follow fluttering butterflies along the flower path'
    ]
  }
];

const SAFE_AVATAR_CHOICES = [
  { emoji: '🌱', name: 'Little Sprout' },
  { emoji: '🐰', name: 'Pippin Bunny' },
  { emoji: '🦊', name: 'Rusty Fox' },
  { emoji: '🦉', name: 'Oliver Owl' },
  { emoji: '🦆', name: 'Daphne Duck' },
  { emoji: '🐻', name: 'Barnaby Bear' },
  { emoji: '🦋', name: 'Meadow Flutter' },
  { emoji: '⭐', name: 'Wonder Star' },
  { emoji: '🐱', name: 'Milo Kitten' },
  { emoji: '🐶', name: 'Bella Pup' }
];

export const ParentCaregiverArea: React.FC<ParentCaregiverAreaProps> = ({
  isOpen,
  onClose,
  progress,
  user,
  profile,
  accessibility = {
    soundEnabled: true,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    narrationEnabled: true,
    reducedMotion: false,
    highContrast: false,
    dyslexicFont: false,
    largeText: false,
    largeHitTargets: false
  },
  onUpdateAccessibility,
  onResetProgress,
  onSelectZone,
  onUpdateProfile
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<ParentTabId>('overview');
  const [num1] = useState(Math.floor(Math.random() * 5) + 3);
  const [num2] = useState(Math.floor(Math.random() * 4) + 2);
  const [userAnswer, setUserAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // My Child edit state
  const [childNameInput, setChildNameInput] = useState(profile?.childName || user?.childName || 'Explorer');
  const [childAvatarInput, setChildAvatarInput] = useState(profile?.avatar || user?.avatar || '🌱');
  const [childFavoriteZone, setChildFavoriteZone] = useState<string>(profile?.favoriteZone || progress.favoriteZone || 'alphabet');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer.trim(), 10) === num1 + num2) {
      audioService.playSuccess();
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      audioService.playPop();
      setErrorMsg('Incorrect answer. Please try again.');
    }
  };

  const handleSaveChildProfile = () => {
    if (onUpdateProfile) {
      onUpdateProfile(childNameInput.trim() || 'Explorer', childAvatarInput, childFavoriteZone, 'girl');
    }
    audioService.playSuccess();
    confetti({ particleCount: 30, spread: 50 });
    setSavedSuccessMsg('Child profile saved successfully!');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  const handleDownloadCertificate = () => {
    audioService.playSparkle();
    const certWindow = window.open('', '_blank');
    if (!certWindow) return;
    certWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Wonder Meadow - Certificate of Curiosity</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; text-align: center; padding: 40px; background: #F6F8F2; color: #1F2937; margin: 0; }
          .cert { border: 10px double #0284C7; padding: 40px; background: #FFF; border-radius: 28px; max-width: 680px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          h1 { color: #0369A1; font-size: 32px; margin-bottom: 4px; }
          h2 { color: #D97706; font-size: 26px; margin-top: 20px; }
          .badge { display: inline-block; padding: 6px 18px; border-radius: 20px; background: #E0F2FE; color: #0369A1; font-weight: bold; font-size: 14px; margin-top: 8px; }
          .stars { font-size: 40px; margin: 16px 0; color: #F59E0B; }
          .body-text { font-size: 16px; line-height: 1.6; color: #4B5563; max-width: 520px; margin: 0 auto; }
          .footer { margin-top: 36px; padding-top: 20px; border-top: 1px dashed #CBD5E1; font-size: 13px; color: #64748B; }
        </style>
      </head>
      <body>
        <div class="cert">
          <h1>🌱 WONDER MEADOW 🌱</h1>
          <div class="badge">Official Certificate of Curiosity & Discovery</div>
          <div class="stars">⭐⭐⭐⭐⭐</div>
          <p class="body-text">This certifies that our young explorer has successfully discovered</p>
          <h2>${progress.stars} Wonder Stars</h2>
          <p class="body-text">
            For practicing letters in Alphabet Grove, counting along the Number Trail, exploring vibrant colors in Fruit Orchard, caring for animal friends, and solving meadow challenges!
          </p>
          <div class="footer">
            <p>Explorer: ${childNameInput} • Issued: ${new Date().toLocaleDateString()}</p>
            <p>Wonder Meadow: A safe, kind, exploration-first early learning world</p>
          </div>
        </div>
        <script>
          window.print();
        </script>
      </body>
      </html>
    `);
    certWindow.document.close();
  };

  const navItems: { id: ParentTabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'learning_zones', label: 'Learning Zones', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'progress', label: 'Child Progress', icon: <Award className="w-4 h-4" /> },
    { id: 'my_child', label: 'My Child', icon: <User className="w-4 h-4" /> },
    { id: 'characters', label: 'Characters', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Sliders className="w-4 h-4" /> }
  ];

  return (
    <div
      id="parent-caregiver-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="parent-portal-heading"
    >
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[92vh] bg-[#FFFDF7] rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col">
        
        {/* 1. TOP HEADER & NAVBAR */}
        <header className="px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-100/80 via-sky-100/70 to-emerald-100/80 border-b border-amber-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Global Back Button */}
            <button
              type="button"
              id="parent-back-btn"
              onClick={() => {
                audioService.playPop();
                onClose();
              }}
              className="h-9 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 shadow-xs flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 transition-all"
              aria-label="Back to Game"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs text-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 id="parent-portal-heading" className="text-sm sm:text-base font-display font-black text-stone-900 leading-tight">
                  Wonder Meadow Parent Dashboard
                </h3>
                <p className="text-[10px] sm:text-[11px] text-stone-600 font-bold hidden sm:block">
                  Pedagogy, curriculum guide, progress, and settings
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white hover:bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200 shadow-xs cursor-pointer active:scale-95"
            aria-label="Close Parent Area"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* 2. ADULT VERIFICATION GATE (Before Unlock) */}
        {!isUnlocked ? (
          <div className="p-6 sm:p-10 text-center flex flex-col items-center justify-center bg-[#FAF8F5] flex-1 overflow-y-auto">
            <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 shadow-xs border border-amber-200">
              <Lock className="w-7 h-7" />
            </div>

            <h4 className="font-display font-black text-lg sm:text-xl text-stone-900 mb-1">
              Parent & Caregiver Verification
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 max-w-sm mb-5 font-medium leading-relaxed">
              To view curriculum insights, safety details, and child progress, please answer this question:
            </p>

            <form onSubmit={handleVerifyGate} className="flex flex-col items-center gap-3.5 w-full max-w-xs">
              <div className="font-display font-black text-2xl text-stone-900 bg-white px-6 py-2.5 rounded-2xl border-2 border-amber-300 shadow-xs w-full text-center">
                {num1} + {num2} = ?
              </div>

              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type answer"
                className="w-full px-4 py-2.5 text-center text-base font-bold rounded-2xl border-2 border-stone-300 focus:border-sky-500 focus:outline-none bg-white shadow-xs"
                autoFocus
              />

              {errorMsg && (
                <div className="text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-display font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Enter Parent Dashboard</span>
              </button>
            </form>
          </div>
        ) : (
          /* 3. UNLOCKED PARENT EXPERIENCE */
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF8F5]">
            {/* Navigation Tabs Bar */}
            <div className="px-3 sm:px-6 pt-2.5 pb-2 bg-white border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  id={`tab-parent-${item.id}`}
                  onClick={() => {
                    audioService.playPop();
                    setActiveTab(item.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === item.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Content Area with smooth scrolling */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              
              {/* --- TAB 1: OVERVIEW --- */}
              {activeTab === 'overview' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-gradient-to-r from-sky-50 via-emerald-50 to-amber-50 p-4 sm:p-5 rounded-3xl border-2 border-sky-200 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                        🌱
                      </div>
                      <div>
                        <h4 className="font-display font-black text-base sm:text-lg text-stone-900 mb-1">
                          How Wonder Meadow Supports Early Learning
                        </h4>
                        <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed">
                          Wonder Meadow is designed for children ages 3 to 7. Rather than repetitive drills or flashcards, children explore an open natural world where literacy, numeracy, spatial reasoning, and nature concepts are discovered organically through adventure and gentle problem solving.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl">⭐</span>
                        <h5 className="text-xs font-display font-black text-amber-950">Earned Stars</h5>
                      </div>
                      <p className="text-2xl font-display font-black text-amber-600">{progress.stars}</p>
                      <p className="text-[11px] text-stone-600 mt-0.5">Stars earned by collecting items & solving obstacles</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl">🌳</span>
                        <h5 className="text-xs font-display font-black text-sky-950">Active Zones</h5>
                      </div>
                      <p className="text-2xl font-display font-black text-sky-600">5 Learning Areas</p>
                      <p className="text-[11px] text-stone-600 mt-0.5">Letters, Numbers, Colors, Shapes & Nature</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl">🛡️</span>
                        <h5 className="text-xs font-display font-black text-emerald-950">Child Safety</h5>
                      </div>
                      <p className="text-xs font-bold text-emerald-700 mt-1">100% Ad-Free</p>
                      <p className="text-[11px] text-stone-600 mt-0.5">No in-app purchases, no external trackers</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                    <h5 className="text-xs font-display font-black text-stone-900 mb-2">Quick Accessibility Toggles</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdateAccessibility) {
                            onUpdateAccessibility({ soundEnabled: !accessibility.soundEnabled });
                          }
                          audioService.playPop();
                        }}
                        className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between cursor-pointer hover:bg-stone-100"
                      >
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-stone-700" />
                          <span className="text-xs font-bold text-stone-800">Sound Effects & Voice</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${accessibility.soundEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                          {accessibility.soundEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdateAccessibility) {
                            onUpdateAccessibility({ reducedMotion: !accessibility.reducedMotion });
                          }
                          audioService.playPop();
                        }}
                        className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between cursor-pointer hover:bg-stone-100"
                      >
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-stone-700" />
                          <span className="text-xs font-bold text-stone-800">Calm Motion</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${accessibility.reducedMotion ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'}`}>
                          {accessibility.reducedMotion ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 2: LEARNING ZONES --- */}
              {activeTab === 'learning_zones' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl">
                    <h4 className="text-xs font-display font-black text-sky-950">Curriculum Map</h4>
                    <p className="text-xs text-sky-800 mt-0.5">Explore each zone's specific learning targets and start an activity directly:</p>
                  </div>

                  <div className="space-y-3">
                    {LEARNING_ZONE_GUIDES.map((guide) => (
                      <div
                        key={guide.id}
                        className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl text-white shadow-xs shrink-0"
                              style={{ backgroundColor: guide.themeColor }}
                            >
                              {guide.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-display font-black text-stone-900">{guide.name}</h5>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                                  {guide.badge}
                                </span>
                              </div>
                              <p className="text-xs text-stone-600">{guide.category}</p>
                            </div>
                          </div>

                          {onSelectZone && (
                            <button
                              type="button"
                              onClick={() => {
                                audioService.playPop();
                                onClose();
                                onSelectZone(guide.zoneId);
                              }}
                              className="h-8 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 shrink-0"
                            >
                              <span>Try Zone</span>
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed font-medium">
                          {guide.description}
                        </p>

                        <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                          <h6 className="text-[11px] font-bold uppercase tracking-wider text-stone-800 mb-1.5">
                            Core Skills Practiced:
                          </h6>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-stone-600">
                            {guide.skills.map((skill, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- TAB 3: CHILD PROGRESS --- */}
              {activeTab === 'progress' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-center sm:text-left">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl shadow-xs">
                        ⭐
                      </div>
                      <div>
                        <h4 className="text-base font-display font-black text-amber-950">
                          {progress.stars} Wonder Stars Earned
                        </h4>
                        <p className="text-xs text-amber-900">
                          Based on real items collected and obstacles solved.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadCertificate}
                      className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Print Certificate</span>
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                    <h5 className="text-xs font-display font-black text-stone-900 mb-3">Zone Visit History</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center">
                        <span className="text-xl">🌳</span>
                        <div className="text-xs font-bold text-stone-800 mt-1">Alphabet Grove</div>
                        <div className="text-sm font-black text-sky-600">{progress.zoneVisits?.alphabet || 0} visits</div>
                      </div>
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center">
                        <span className="text-xl">🔢</span>
                        <div className="text-xs font-bold text-stone-800 mt-1">Number Trail</div>
                        <div className="text-sm font-black text-blue-600">{progress.zoneVisits?.numbers || 0} visits</div>
                      </div>
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center">
                        <span className="text-xl">🎨</span>
                        <div className="text-xs font-bold text-stone-800 mt-1">Fruit Orchard</div>
                        <div className="text-sm font-black text-amber-600">{progress.zoneVisits?.fruits || 0} visits</div>
                      </div>
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center">
                        <span className="text-xl">🌿</span>
                        <div className="text-xs font-bold text-stone-800 mt-1">Animal Woods</div>
                        <div className="text-sm font-black text-emerald-600">{progress.zoneVisits?.animals || 0} visits</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 4: MY CHILD --- */}
              {activeTab === 'my_child' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-display font-black text-stone-900">
                        Child Profile & Safe Avatar
                      </h4>
                      {savedSuccessMsg && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          {savedSuccessMsg}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Child's Explorer Name:
                      </label>
                      <input
                        type="text"
                        value={childNameInput}
                        onChange={(e) => setChildNameInput(e.target.value)}
                        placeholder="Enter name"
                        className="w-full max-w-xs px-3.5 py-2 text-sm font-bold rounded-xl border-2 border-stone-300 focus:border-sky-500 focus:outline-none bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-2">
                        Select Safe Avatar:
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {SAFE_AVATAR_CHOICES.map((choice) => (
                          <button
                            key={choice.emoji}
                            type="button"
                            onClick={() => {
                              audioService.playPop();
                              setChildAvatarInput(choice.emoji);
                            }}
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                              childAvatarInput === choice.emoji
                                ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300'
                                : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            <span className="text-2xl">{choice.emoji}</span>
                            <span className="text-[10px] font-bold text-stone-700 text-center truncate w-full">
                              {choice.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Favorite Learning Zone:
                      </label>
                      <select
                        value={childFavoriteZone}
                        onChange={(e) => setChildFavoriteZone(e.target.value)}
                        className="px-3 py-2 text-xs font-bold rounded-xl border-2 border-stone-300 bg-white"
                      >
                        <option value="alphabet">Alphabet Grove (Letters & Phonics)</option>
                        <option value="numbers">Number Trail (Counting & Math)</option>
                        <option value="fruits">Fruit Orchard (Colors & Sorting)</option>
                        <option value="animals">Animal Woods (Creatures & Care)</option>
                        <option value="creative">Creative Corner (Shapes & Art)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveChildProfile}
                      className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Child Profile</span>
                    </button>
                  </div>
                </div>
              )}

              {/* --- TAB 5: CHARACTERS --- */}
              {activeTab === 'characters' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl">
                    <h4 className="text-xs font-display font-black text-sky-950">Explorer Friends Directory</h4>
                    <p className="text-xs text-sky-800 mt-0.5">8 distinct Wonder Meadow companions that inspire curiosity and creativity:</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXPLORER_CHARACTERS.map((char) => {
                      const isUnlocked = isCharacterUnlocked(char.id, progress);
                      const condition = CHARACTER_UNLOCK_CONDITIONS[char.id];

                      return (
                        <div
                          key={char.id}
                          className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-3.5"
                        >
                          <div className="shrink-0">
                            <CharacterVisual
                              characterId={char.id}
                              isUnlocked={isUnlocked}
                              isSelected={false}
                              size="sm"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-xs font-display font-black text-stone-900">{char.name}</h5>
                              <span className="text-[10px]">{char.badge}</span>
                            </div>
                            <p className="text-[11px] font-bold text-stone-600">{char.title}</p>
                            <p className="text-[10px] text-stone-500 truncate mt-0.5">{char.outfitDescription}</p>

                            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold">
                              {isUnlocked && !char.isFutureSlot ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  Unlocked & Ready
                                </span>
                              ) : char.isFutureSlot ? (
                                <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  Future Expansion
                                </span>
                              ) : (
                                <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Requires {condition.requiredStars}⭐</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- TAB 6: SETTINGS --- */}
              {activeTab === 'settings' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                    <h4 className="text-xs font-display font-black text-stone-900 uppercase tracking-wider">
                      Audio & Accessibility Controls
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-stone-800">Master Audio</p>
                          <p className="text-[11px] text-stone-500">Enable voiceover greetings and environmental effects</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateAccessibility) {
                              onUpdateAccessibility({ soundEnabled: !accessibility.soundEnabled });
                            }
                            audioService.playPop();
                          }}
                          className={`h-8 px-3.5 rounded-xl font-display font-bold text-xs cursor-pointer ${
                            accessibility.soundEnabled
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {accessibility.soundEnabled ? 'Enabled' : 'Muted'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-stone-800">Calm Motion Mode</p>
                          <p className="text-[11px] text-stone-500">Reduces camera rotation and high-speed animations for sensitive eyes</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateAccessibility) {
                              onUpdateAccessibility({ reducedMotion: !accessibility.reducedMotion });
                            }
                            audioService.playPop();
                          }}
                          className={`h-8 px-3.5 rounded-xl font-display font-bold text-xs cursor-pointer ${
                            accessibility.reducedMotion
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {accessibility.reducedMotion ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-stone-800">Large Touch Targets</p>
                          <p className="text-[11px] text-stone-500">Increases hit areas for little fingers on tablets</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateAccessibility) {
                              onUpdateAccessibility({ largeHitTargets: !accessibility.largeHitTargets });
                            }
                            audioService.playPop();
                          }}
                          className={`h-8 px-3.5 rounded-xl font-display font-bold text-xs cursor-pointer ${
                            accessibility.largeHitTargets
                              ? 'bg-sky-600 text-white'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {accessibility.largeHitTargets ? 'Enabled' : 'Standard'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reset Progress Section with Safe Confirmation */}
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-3">
                    <div>
                      <h5 className="text-xs font-display font-black text-rose-950">Reset Explorer Progress</h5>
                      <p className="text-[11px] text-rose-800 mt-0.5">
                        Clears collected stars, unlocked badges, and resets the meadow back to the beginning.
                      </p>
                    </div>

                    {!confirmResetOpen ? (
                      <button
                        type="button"
                        onClick={() => {
                          audioService.playPop();
                          setConfirmResetOpen(true);
                        }}
                        className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Progress...</span>
                      </button>
                    ) : (
                      <div className="bg-white p-3 rounded-xl border border-rose-300 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <span className="text-xs font-bold text-rose-900">Are you sure? This cannot be undone.</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmResetOpen(false)}
                            className="h-8 px-3 rounded-lg bg-stone-100 text-stone-700 text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onResetProgress();
                              setConfirmResetOpen(false);
                              audioService.playSuccess();
                            }}
                            className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Yes, Reset
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
