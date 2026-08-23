import { ExplorerCharacter, ExplorerCharacterId, UserProgress } from '../types';

export interface CharacterUnlockInfo {
  requiredStars: number;
  requiredCondition: string;
  isUnlockedByDefault: boolean;
}

export const CHARACTER_UNLOCK_CONDITIONS: Record<ExplorerCharacterId, CharacterUnlockInfo> = {
  curious_explorer: {
    requiredStars: 0,
    requiredCondition: 'Available immediately for every explorer',
    isUnlockedByDefault: true
  },
  little_inventor: {
    requiredStars: 0,
    requiredCondition: 'Available immediately for every explorer',
    isUnlockedByDefault: true
  },
  nature_explorer: {
    requiredStars: 10,
    requiredCondition: 'Earn 10 Wonder Stars to unlock Willow!',
    isUnlockedByDefault: false
  },
  creative_dreamer: {
    requiredStars: 25,
    requiredCondition: 'Earn 25 Wonder Stars to unlock Luna!',
    isUnlockedByDefault: false
  },
  forest_fawn: {
    requiredStars: 40,
    requiredCondition: 'Earn 40 Wonder Stars to befriend Bramble!',
    isUnlockedByDefault: false
  },
  little_adventurer: {
    requiredStars: 60,
    requiredCondition: 'Earn 60 Wonder Stars to unlock Koa!',
    isUnlockedByDefault: false
  },
  star_sprite: {
    requiredStars: 80,
    requiredCondition: 'Earn 80 Wonder Stars to unlock Nova!',
    isUnlockedByDefault: false
  },
  future_companion: {
    requiredStars: 100,
    requiredCondition: 'Secret upcoming friend • Coming soon to Wonder Meadow!',
    isUnlockedByDefault: false
  },

  // Backwards compatibility mappings for older save states
  little_artist: {
    requiredStars: 25,
    requiredCondition: 'Earn 25 Wonder Stars to unlock Luna!',
    isUnlockedByDefault: false
  },
  forest_friend: {
    requiredStars: 40,
    requiredCondition: 'Earn 40 Wonder Stars to befriend Bramble!',
    isUnlockedByDefault: false
  },
  tiny_inventor: {
    requiredStars: 0,
    requiredCondition: 'Available immediately for every explorer',
    isUnlockedByDefault: true
  },
  magical_companion: {
    requiredStars: 80,
    requiredCondition: 'Earn 80 Wonder Stars to unlock Nova!',
    isUnlockedByDefault: false
  },
  adventurous_kid: {
    requiredStars: 60,
    requiredCondition: 'Earn 60 Wonder Stars to unlock Koa!',
    isUnlockedByDefault: false
  }
};

export const EXPLORER_CHARACTERS: ExplorerCharacter[] = [
  {
    id: 'curious_explorer',
    name: 'Pip',
    title: 'Curious Explorer',
    tagline: 'Loves discovering secret trails, sunny flowers, and gentle surprises.',
    personality: 'Curious, brave, friendly, and full of wonder for every meadow path.',
    badge: '🌱',
    avatarEmoji: '👧',
    themeColor: '#0284C7', // Sky Blue
    secondaryColor: '#E0F2FE',
    accentColor: '#F59E0B',
    outfitDescription: 'Golden sun hat with leafy band, cozy sky-blue scarf, and warm trail boots.',
    favoriteActivity: 'Walking through Alphabet Grove & spotting wild butterflies.',
    voiceGreeting: 'Hi! I am Pip! Let’s explore Wonder Meadow together!',
    genderStyle: 'girl'
  },
  {
    id: 'little_inventor',
    name: 'Milo',
    title: 'Little Inventor',
    tagline: 'Loves building, discovering how things work, and counting gears.',
    personality: 'Playful, creative, problem-solver, and loves tinkering.',
    badge: '⚙️',
    avatarEmoji: '🧑‍🔬',
    themeColor: '#D97706', // Warm Amber
    secondaryColor: '#FEF3C7',
    accentColor: '#0284C7',
    outfitDescription: 'Brass tinker goggles, amber inventor vest, gear badge, and handy tool pouch.',
    favoriteActivity: 'Ringing the musical bells & solving number puzzles in Number Valley.',
    voiceGreeting: 'Greetings! I am Milo! Let’s discover how magical things work in Wonder Meadow!',
    genderStyle: 'boy'
  },
  {
    id: 'nature_explorer',
    name: 'Willow',
    title: 'Nature Explorer',
    tagline: 'Loves animals, singing with birds, and collecting wildflower seeds.',
    personality: 'Caring, gentle, observant, and deeply connected to meadow nature.',
    badge: '🌿',
    avatarEmoji: '🧑‍🌾',
    themeColor: '#16A34A', // Leaf Green
    secondaryColor: '#DCFCE7',
    accentColor: '#F59E0B',
    outfitDescription: 'Wildflower leaf crown, forest-green smock, and clover collecting pouch.',
    favoriteActivity: 'Listening to friendly animal calls in Animal Woods.',
    voiceGreeting: 'Hello, friend! I am Willow! The meadow animals and flowers are ready for us!',
    genderStyle: 'girl'
  },
  {
    id: 'creative_dreamer',
    name: 'Luna',
    title: 'Creative Dreamer',
    tagline: 'Loves drawing, colors, melody notes, and painting rainbow trails.',
    personality: 'Imaginative, joyful, artistic, and loves colorful adventures.',
    badge: '🎨',
    avatarEmoji: '🧑‍🎨',
    themeColor: '#9333EA', // Purple Violet
    secondaryColor: '#F3E8FF',
    accentColor: '#F472B6',
    outfitDescription: 'Starry purple beret, paint-splashed lilac smock, and rainbow pocket straps.',
    favoriteActivity: 'Mixing sparkling colors in Creative Corner.',
    voiceGreeting: 'Sparkle and smiles! I am Luna! What colorful things will we create today?',
    genderStyle: 'girl'
  },
  {
    id: 'forest_fawn',
    name: 'Bramble',
    title: 'Meadow Fawn',
    tagline: 'An original gentle forest creature with mossy blossom antlers.',
    personality: 'Gentle, sweet-hearted, soft-footed, and knows every secret hideaway.',
    badge: '🦌',
    avatarEmoji: '🦌',
    themeColor: '#B45309', // Warm Caramel
    secondaryColor: '#FEF9C3',
    accentColor: '#16A34A',
    outfitDescription: 'Caramel fawn coat with velvet deer ears, mossy blossom antlers, and clover collar.',
    favoriteActivity: 'Leaping over the stepping stones and greeting baby ducks.',
    voiceGreeting: 'Tiptoe and cheer! I am Bramble the Meadow Fawn! Let’s frolic together!',
    genderStyle: 'creature'
  },
  {
    id: 'little_adventurer',
    name: 'Koa',
    title: 'Little Adventurer',
    tagline: 'A brave hiker with an adventure compass and bouncy climbing sneakers.',
    personality: 'Energetic, encouraging, bold, and ready for every joyful quest.',
    badge: '🧭',
    avatarEmoji: '👦',
    themeColor: '#EA580C', // Sunset Orange
    secondaryColor: '#FFE4E6',
    accentColor: '#0284C7',
    outfitDescription: 'Sunset coral windbreaker, explorer visor cap, compass badge, and trail pack.',
    favoriteActivity: 'Climbing up to the Star Hill viewpoint to see the whole meadow.',
    voiceGreeting: 'Hey explorer! I am Koa! Follow me, there is a big adventure waiting!',
    genderStyle: 'boy'
  },
  {
    id: 'star_sprite',
    name: 'Nova',
    title: 'Star Sprite',
    tagline: 'A magical friend born from meadow starlight with glowing star wings.',
    personality: 'Enchanting, warm, comforting, and lights up every hidden trail.',
    badge: '✨',
    avatarEmoji: '🌟',
    themeColor: '#7C3AED', // Starlight Violet
    secondaryColor: '#EDE9FE',
    accentColor: '#FDE047',
    outfitDescription: 'Shimmering lavender starlight sprite with constellation crown and fairy dust wings.',
    favoriteActivity: 'Sprinkling golden starlight over the Star Observatory.',
    voiceGreeting: 'Twinkle and glow! I am Nova! Let’s sprinkle starlight across the meadow!',
    genderStyle: 'creature'
  },
  {
    id: 'future_companion',
    name: 'Zephyr',
    title: 'Cloud Weaver',
    tagline: 'A mysterious upcoming friend weaving warm breezes across the hills.',
    personality: 'Playful, gentle, and soon arriving in Wonder Meadow.',
    badge: '☁️',
    avatarEmoji: '☁️',
    themeColor: '#64748B',
    secondaryColor: '#F1F5F9',
    accentColor: '#38BDF8',
    outfitDescription: 'Soft billowy cloud silhouette waiting for future meadow adventures.',
    favoriteActivity: 'Floating gently over the hilltops.',
    voiceGreeting: 'Whoosh! A new friend is preparing to join Wonder Meadow soon!',
    genderStyle: 'creature',
    isFutureSlot: true
  }
];

export const DEFAULT_CHARACTER_ID: ExplorerCharacterId = 'curious_explorer';

export function getCharacterById(id?: string | null): ExplorerCharacter {
  if (!id) return EXPLORER_CHARACTERS[0];
  // Handle alias lookups
  if (id === 'little_artist') return EXPLORER_CHARACTERS.find((c) => c.id === 'creative_dreamer') || EXPLORER_CHARACTERS[3];
  if (id === 'forest_friend') return EXPLORER_CHARACTERS.find((c) => c.id === 'forest_fawn') || EXPLORER_CHARACTERS[4];
  if (id === 'tiny_inventor') return EXPLORER_CHARACTERS.find((c) => c.id === 'little_inventor') || EXPLORER_CHARACTERS[1];
  if (id === 'magical_companion') return EXPLORER_CHARACTERS.find((c) => c.id === 'star_sprite') || EXPLORER_CHARACTERS[6];
  if (id === 'adventurous_kid') return EXPLORER_CHARACTERS.find((c) => c.id === 'little_adventurer') || EXPLORER_CHARACTERS[5];

  const found = EXPLORER_CHARACTERS.find((c) => c.id === id);
  return found || EXPLORER_CHARACTERS[0];
}

export function isCharacterUnlocked(characterId: ExplorerCharacterId, progress?: UserProgress | { stars: number } | null): boolean {
  const unlockInfo = CHARACTER_UNLOCK_CONDITIONS[characterId];
  if (!unlockInfo || unlockInfo.isUnlockedByDefault) return true;
  const currentStars = progress?.stars ?? 0;
  return currentStars >= unlockInfo.requiredStars;
}
