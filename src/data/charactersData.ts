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
    name: 'Maxi',
    title: 'Explorer',
    tagline: 'Loves sunny nature trails and finding secret meadow paths.',
    personality: 'Curious, brave, and always ready for an outdoor adventure.',
    badge: '🌿',
    avatarEmoji: '👦',
    themeColor: '#16A34A', // Explorer Forest Green
    secondaryColor: '#DCFCE7',
    accentColor: '#F59E0B',
    outfitDescription: 'Green explorer vest with leaf badge, khaki cargo shorts, and yellow backpack.',
    favoriteActivity: 'Walking along the flower trails & spotting meadow wildlife.',
    voiceGreeting: 'Hi! I am Maxi! Let’s explore Wonder Meadow together!',
    genderStyle: 'boy'
  },
  {
    id: 'nature_explorer',
    name: 'Maya',
    title: 'Creative',
    tagline: 'Discovers magical blossoms and sparkles across the meadow.',
    personality: 'Creative, kind-hearted, and loves flower magic.',
    badge: '🌸',
    avatarEmoji: '👧',
    themeColor: '#EC4899', // Blossom Pink
    secondaryColor: '#FDF2F8',
    accentColor: '#A855F7',
    outfitDescription: 'Pink explorer jacket, lilac floral tunic, flower hairpin, and star flower wand.',
    favoriteActivity: 'Collecting sparkling petals in Creative Corner.',
    voiceGreeting: 'Sparkles and sunshine! I am Maya! Let’s make something magical!',
    genderStyle: 'girl'
  },
  {
    id: 'forest_fawn',
    name: 'Bolt',
    title: 'Robo-Kid Explorer',
    tagline: 'Curious, cheerful robot kid powered by starlight batteries and friendly curiosity.',
    personality: 'Friendly, tech-savvy, bright, and loves calculating fun paths and helping friends.',
    badge: '🤖',
    avatarEmoji: '🤖',
    themeColor: '#06B6D4', // Electric Cyan Blue
    secondaryColor: '#ECFEFF',
    accentColor: '#38BDF8', // Starlight Blue
    outfitDescription: 'Futuristic cyan and white robot plating, glowing blue smile visor screen, antenna, and explorer vest.',
    favoriteActivity: 'Scanning for secret starry meadow gadgets and lighting up dark trails.',
    voiceGreeting: 'Beep boop! Hi! I am Bolt! Let’s explore Wonder Meadow together!',
    genderStyle: 'neutral'
  },
  {
    id: 'little_inventor',
    name: 'Jojo',
    title: 'Monkey Explorer',
    tagline: 'Joyful little monkey explorer ready for sunny meadow quests and discovery.',
    personality: 'Curious, cheerful, playful monkey who loves finding hidden treasures.',
    badge: '🐵',
    avatarEmoji: '🐵',
    themeColor: '#0284C7', // Sky Adventure Blue
    secondaryColor: '#E0F2FE',
    accentColor: '#FACC15',
    outfitDescription: 'Cute monkey explorer with blue adventure jacket and golden compass in hand.',
    favoriteActivity: 'Guiding friends through sunny hills and finding secret spots.',
    voiceGreeting: 'Ooh ooh! Hey explorer! I am Jojo! Let’s discover Wonder Meadow together!',
    genderStyle: 'neutral'
  },
  {
    id: 'creative_dreamer',
    name: 'Sammy',
    title: 'Dreamer',
    tagline: 'Full of joyful ideas, bright energy, and exciting games.',
    personality: 'Imaginative, cheerful, and loves sharing happy discoveries.',
    badge: '⭐',
    avatarEmoji: '🧑',
    themeColor: '#8B5CF6', // Purple Violet
    secondaryColor: '#F3E8FF',
    accentColor: '#F59E0B',
    outfitDescription: 'Purple adventure jacket with star badge, star hairclip, and star compass.',
    favoriteActivity: 'Exploring hidden caves and pointing out fun surprises.',
    voiceGreeting: 'Sparkle and smiles! I am Sammy! What fun game will we play today?',
    genderStyle: 'neutral'
  },
  {
    id: 'little_adventurer',
    name: 'Rose',
    title: 'Kind Friend',
    tagline: 'Gentle friend who loves sweet meadow stories and quiet paths.',
    personality: 'Warm-hearted, gentle, caring, and loves peaceful adventures.',
    badge: '🌷',
    avatarEmoji: '👧',
    themeColor: '#F43F5E', // Rose Coral
    secondaryColor: '#FFF1F2',
    accentColor: '#FBBF24',
    outfitDescription: 'Cozy pink-and-lilac dress with golden trims, golden flower hairpin, and trail boots.',
    favoriteActivity: 'Reading storybooks at the Story Pavilion.',
    voiceGreeting: 'Hello sweet friend! I am Rose! Let’s share a wonderful adventure!',
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
