import { ExplorerCharacter, ExplorerCharacterId, UserProgress } from '../types';

export interface CharacterUnlockInfo {
  requiredStars: number;
  requiredCondition: string;
  isUnlockedByDefault: boolean;
}

export const CHARACTER_UNLOCK_CONDITIONS: Record<ExplorerCharacterId, CharacterUnlockInfo> = {
  curious_explorer: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  },
  nature_explorer: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  },
  forest_fawn: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  },
  little_inventor: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  },
  creative_dreamer: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  },
  little_adventurer: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  },
  star_sprite: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  },
  future_companion: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  },

  // Backwards compatibility mappings for older save states
  little_artist: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  },
  forest_friend: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  },
  tiny_inventor: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  },
  magical_companion: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  },
  adventurous_kid: {
    requiredStars: 0,
    requiredCondition: 'Available immediately',
    isUnlockedByDefault: true
  }
};

export const EXPLORER_CHARACTERS: ExplorerCharacter[] = [
  {
    id: 'curious_explorer',
    name: 'Meadow Explorer',
    title: 'Signature Style',
    tagline: 'Loves sunny nature trails and peaceful meadow paths in her classic sage floral dress.',
    personality: 'Curious, sweet, and always ready for a joyful meadow adventure.',
    badge: '🌿',
    avatarEmoji: '👧',
    themeColor: '#0F766E', // Forest Teal / Sage Green
    secondaryColor: '#DCFCE7',
    accentColor: '#F59E0B',
    outfitDescription: 'Classic sage-green smocked floral frock with short puff sleeves.',
    favoriteActivity: 'Walking along the flower trails & listening to meadow birds.',
    voiceGreeting: 'Hey! Welcome to Wonder Meadow! Let’s explore together!',
    genderStyle: 'girl'
  },
  {
    id: 'nature_explorer',
    name: 'Blossom Artist',
    title: 'Creative Style',
    tagline: 'Discovers magical blossoms and sparkles across the meadow holding a daisy flower.',
    personality: 'Creative, kind-hearted, and loves flower magic.',
    badge: '🌸',
    avatarEmoji: '👧',
    themeColor: '#DB2777', // Blossom Rose Pink
    secondaryColor: '#FDF2F8',
    accentColor: '#A855F7',
    outfitDescription: 'Soft rose-pink floral dress holding a bright meadow blossom.',
    favoriteActivity: 'Collecting sparkling petals in Creative Corner.',
    voiceGreeting: 'Sparkles and sunshine! Let’s make something magical and beautiful together!',
    genderStyle: 'girl'
  },
  {
    id: 'forest_fawn',
    name: 'Sunny Adventurer',
    title: 'Outdoor Style',
    tagline: 'Sunny explorer with a cute straw sun hat ready for warm sunny trail quests.',
    personality: 'Cheerful, warm, bright, and loves finding sunny secrets.',
    badge: '🌻',
    avatarEmoji: '👧',
    themeColor: '#D97706', // Sunny Gold Amber
    secondaryColor: '#FEF3C7',
    accentColor: '#F59E0B',
    outfitDescription: 'Pastel yellow sun dress with matching straw sun hat.',
    favoriteActivity: 'Exploring sunny hills and discovering hidden fruit orchards.',
    voiceGreeting: 'Hello sunshine! Let’s discover the warmest, happiest trails in Wonder Meadow!',
    genderStyle: 'girl'
  },
  {
    id: 'little_inventor',
    name: 'Lavender Dreamer',
    title: 'Story Style',
    tagline: 'Gentle friend in a cozy lavender floral dress with starry ribbons for bedtime tales.',
    personality: 'Gentle, thoughtful, and loves peaceful storybook adventures.',
    badge: '✨',
    avatarEmoji: '👧',
    themeColor: '#7C3AED', // Violet Lavender
    secondaryColor: '#F5F3FF',
    accentColor: '#EC4899',
    outfitDescription: 'Soft lavender dress with delicate star embroidery and lilac ribbon headband.',
    favoriteActivity: 'Listening to calm stories at the Story Pavilion.',
    voiceGreeting: 'Hello sweet friend! What peaceful story or game will we explore today?',
    genderStyle: 'girl'
  },
  {
    id: 'creative_dreamer',
    name: 'Starlight Friend',
    title: 'Dreamer Style',
    tagline: 'Full of joyful ideas, bright energy, and exciting games.',
    personality: 'Imaginative, cheerful, and loves sharing happy discoveries.',
    badge: '⭐',
    avatarEmoji: '👧',
    themeColor: '#8B5CF6',
    secondaryColor: '#F3E8FF',
    accentColor: '#F59E0B',
    outfitDescription: 'Lavender star adventure dress with golden flower hairpins.',
    favoriteActivity: 'Exploring starry meadows and night sky constellations.',
    voiceGreeting: 'Sparkle and smiles! Let’s have a wonderful adventure!',
    genderStyle: 'girl'
  },
  {
    id: 'little_adventurer',
    name: 'Rose Blossom',
    title: 'Kind Friend',
    tagline: 'Gentle friend who loves sweet meadow stories and quiet paths.',
    personality: 'Warm-hearted, gentle, caring, and loves peaceful adventures.',
    badge: '🌷',
    avatarEmoji: '👧',
    themeColor: '#F43F5E',
    secondaryColor: '#FFF1F2',
    accentColor: '#FBBF24',
    outfitDescription: 'Cozy rose dress with golden trims and flower hairpins.',
    favoriteActivity: 'Reading storybooks at the Story Pavilion.',
    voiceGreeting: 'Hello sweet friend! I’m so excited to play with you!',
    genderStyle: 'girl'
  }
];

export const DEFAULT_CHARACTER_ID: ExplorerCharacterId = 'curious_explorer';

export function getCharacterById(id?: string | null): ExplorerCharacter {
  if (!id) return EXPLORER_CHARACTERS[0];
  // Handle alias lookups
  if (id === 'little_artist') return EXPLORER_CHARACTERS.find((c) => c.id === 'creative_dreamer') || EXPLORER_CHARACTERS[3];
  if (id === 'forest_friend') return EXPLORER_CHARACTERS.find((c) => c.id === 'forest_fawn') || EXPLORER_CHARACTERS[4];
  if (id === 'tiny_inventor') return EXPLORER_CHARACTERS.find((c) => c.id === 'little_inventor') || EXPLORER_CHARACTERS[1];
  if (id === 'magical_companion') return EXPLORER_CHARACTERS.find((c) => c.id === 'forest_fawn') || EXPLORER_CHARACTERS[4];
  if (id === 'adventurous_kid') return EXPLORER_CHARACTERS.find((c) => c.id === 'little_adventurer') || EXPLORER_CHARACTERS[5];
  if (id === 'star_sprite') return EXPLORER_CHARACTERS.find((c) => c.id === 'forest_fawn') || EXPLORER_CHARACTERS[4];

  const found = EXPLORER_CHARACTERS.find((c) => c.id === id);
  return found || EXPLORER_CHARACTERS[0];
}

export function isCharacterUnlocked(characterId: ExplorerCharacterId, progress?: UserProgress | { stars: number } | null): boolean {
  const unlockInfo = CHARACTER_UNLOCK_CONDITIONS[characterId];
  if (!unlockInfo || unlockInfo.isUnlockedByDefault) return true;
  const currentStars = progress?.stars ?? 0;
  return currentStars >= unlockInfo.requiredStars;
}
