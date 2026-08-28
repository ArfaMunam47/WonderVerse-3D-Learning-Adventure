export type WorldZoneId = 
  | 'alphabet'
  | 'numbers'
  | 'fruits'
  | 'animals'
  | 'creative'
  | 'music'
  | 'stories'
  | 'stars';

export interface WorldZone {
  id: WorldZoneId;
  name: string;
  shortName: string;
  tagline: string;
  landmark: string;
  iconName: string;
  icon: string;
  themeColor: string;
  accentColor: string;
  bgColor: string;
  coordinates: [number, number, number]; // [x, y, z] in 3D world
  description: string;
  learningFocus: string[];
  totalStars: number;
}

export interface AccessibilitySettings {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  narrationEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  dyslexicFont: boolean;
  largeText: boolean;
  largeHitTargets: boolean;
}

export interface UserProgress {
  stars: number;
  coins?: number;
  gems?: number;
  clovers?: number;
  completedActivities: string[];
  discoveredItems: string[];
  stickersUnlocked: string[];
  zoneVisits: Record<WorldZoneId, number>;
  favoriteZone: WorldZoneId | null;
  lastPlayed: string;
  discoveredEmotions?: string[];
}

export interface LetterItem {
  letter: string;
  word: string;
  phonics: string;
  icon: string;
  color: string;
  description: string;
}

export interface NumberItem {
  number: number;
  word: string;
  itemEmoji: string;
  itemName: string;
  color: string;
}

export interface FruitItem {
  id: string;
  name: string;
  colorName: string;
  colorHex: string;
  shape: string;
  emoji: string;
  fact: string;
}

export type AnimalHabitat = 'farm' | 'forest' | 'jungle' | 'water';

export interface AnimalItem {
  id: string;
  name: string;
  soundName?: string;
  soundText: string;
  emoji: string;
  diet: string;
  habitat: AnimalHabitat;
  habitatName: string;
  funFact: string;
}

export interface EmotionItem {
  id: string;
  name: string;
  emoji: string;
  color?: string;
  description: string;
  prompt?: string;
  tip?: string;
  copingTip?: string;
}

export interface StoryScene {
  sceneNumber?: number;
  title?: string;
  illustration: string;
  text?: string;
  narration?: string;
  caption?: string;
  environmentTag?: string;
  interactionPrompt?: string;
}

export interface StoryItem {
  id: string;
  title: string;
  moral: string;
  learningObjective?: string;
  characters?: string[];
  scenes: StoryScene[];
  isAiGenerated?: boolean;
}

export type StoryBook = StoryItem;

export type MusicInstrumentType = 'piano' | 'xylophone' | 'bells' | 'drum';

export interface NurserySong {
  id: string;
  title: string;
  type?: string;
  icon: string;
  theme?: string;
  lyrics?: string;
  verses?: string[];
  melodyNotes: number[]; // Index into 0-7 notes
  tempoBpm?: number;
  rhythmPattern?: string;
  visualSceneTag?: string;
  instrumentSuggested?: string;
  learningObjective?: string;
  isAiGenerated?: boolean;
}

export type CharacterGender = 'boy' | 'girl';

export type ExplorerCharacterId = 
  | 'curious_explorer'
  | 'little_inventor'
  | 'nature_explorer'
  | 'creative_dreamer'
  | 'forest_fawn'
  | 'little_adventurer'
  | 'star_sprite'
  | 'future_companion'
  | 'little_artist'
  | 'forest_friend'
  | 'tiny_inventor'
  | 'magical_companion'
  | 'adventurous_kid';

export interface ExplorerCharacter {
  id: ExplorerCharacterId;
  name: string;
  title: string;
  tagline: string;
  personality: string;
  badge: string;
  avatarEmoji: string;
  themeColor: string;
  secondaryColor: string;
  accentColor: string;
  outfitDescription: string;
  favoriteActivity: string;
  voiceGreeting: string;
  genderStyle?: 'girl' | 'boy' | 'neutral' | 'creature';
  isFutureSlot?: boolean;
  avatarIllustration?: string;
}

export interface UserProfile {
  userId: string;
  childName: string;
  avatar: string;
  gender: CharacterGender;
  characterId?: ExplorerCharacterId;
  bio?: string;
  favoriteZone?: string | null;
  createdAt: string;
  updatedAt: string;
}
