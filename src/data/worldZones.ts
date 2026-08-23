import {
  WorldZone,
  LetterItem,
  NumberItem,
  FruitItem,
  AnimalItem,
  EmotionItem,
  StoryItem,
  NurserySong
} from '../types';

export const WORLD_ZONES: WorldZone[] = [
  {
    id: 'alphabet',
    name: 'Alphabet Grove',
    shortName: 'Letters',
    tagline: 'Let’s explore letters and words!',
    landmark: 'Letter Gateway & 26 Stations',
    iconName: 'Sparkles',
    icon: '🌱',
    themeColor: '#0284C7', // Sky Blue
    accentColor: '#38BDF8',
    bgColor: '#FFFDF7',
    coordinates: [-90, 0, 0],
    description: 'Walk through the grand letter arch into 26 interactive alphabet learning stations.',
    learningFocus: ['Letter Names', 'Letter Sounds', 'Easy Words', 'Alphabet Order'],
    totalStars: 5
  },
  {
    id: 'numbers',
    name: 'Number Valley',
    shortName: 'Numbers',
    tagline: 'Let’s count numbers 1 to 20!',
    landmark: 'Number Stepping Stones',
    iconName: 'Hash',
    icon: '🔢',
    themeColor: '#3B82F6', // Blue
    accentColor: '#93C5FD',
    bgColor: '#FFFDF7',
    coordinates: [0, 0, 95],
    description: 'Step across number stones, count friendly ducks, and add numbers together.',
    learningFocus: ['Numbers 1 to 20', 'Counting Objects', 'Matching Numbers', 'Easy Adding'],
    totalStars: 5
  },
  {
    id: 'fruits',
    name: 'Fruit Orchard',
    shortName: 'Fruits',
    tagline: 'Pick yummy fruits and match colors!',
    landmark: '20 Fruit Trees & Bushes',
    iconName: 'Apple',
    icon: '🍎',
    themeColor: '#F59E0B', // Golden Amber
    accentColor: '#FDE68A',
    bgColor: '#FFFDF7',
    coordinates: [80, 0, 75],
    description: 'Pick fresh fruits from 20 trees and bushes, sort colors, and play fun matching games.',
    learningFocus: ['Fruit Names', 'Bright Colors', 'Simple Shapes', 'Matching Pairs'],
    totalStars: 5
  },
  {
    id: 'animals',
    name: 'Animal Woods',
    shortName: 'Animals',
    tagline: 'Meet friendly animals and hear their sounds!',
    landmark: 'Woodland Treehouse & Glades',
    iconName: 'PawPrint',
    icon: '🐾',
    themeColor: '#FB7185', // Soft Coral Pink
    accentColor: '#FECDD3',
    bgColor: '#FFFDF7',
    coordinates: [-75, 0, -70],
    description: 'Discover friendly animals in forest glades, hear what they say, and learn fun facts.',
    learningFocus: ['Animal Names', 'Animal Sounds', 'Animal Homes', 'Caring for Friends'],
    totalStars: 5
  },
  {
    id: 'creative',
    name: 'Creative Corner',
    shortName: 'Drawing',
    tagline: 'Paint and draw beautiful pictures!',
    landmark: 'Rainbow Paint Pavilion',
    iconName: 'Palette',
    icon: '🎨',
    themeColor: '#8B5CF6', // Soft Lavender
    accentColor: '#DDD6FE',
    bgColor: '#FFFDF7',
    coordinates: [-65, 0, 80],
    description: 'Draw with crayons, brushes, and markers. Add fun stickers and save your art.',
    learningFocus: ['Drawing', 'Fun Colors', 'Stickers', 'Creativity'],
    totalStars: 5
  },
  {
    id: 'music',
    name: 'Music Garden',
    shortName: 'Music',
    tagline: 'Play songs, poems, and rainbow chimes!',
    landmark: 'Playable Xylophone Stage',
    iconName: 'Music',
    icon: '🎵',
    themeColor: '#0284C7', // Sky Blue
    accentColor: '#BAE6FD',
    bgColor: '#FFFDF7',
    coordinates: [90, 0, 0],
    description: 'Step on rainbow xylophone stones, sing classic nursery songs, and tap bell flowers.',
    learningFocus: ['Nursery Songs', 'Rhyming Poems', 'Instruments', 'Rhythm & Beats'],
    totalStars: 5
  },
  {
    id: 'stories',
    name: 'Story Meadow',
    shortName: 'Stories',
    tagline: 'Listen to gentle illustrated stories!',
    landmark: 'Storybook Cottage & Pagoda',
    iconName: 'BookOpen',
    icon: '📚',
    themeColor: '#EA580C', // Warm Coral Orange
    accentColor: '#FED7AA',
    bgColor: '#FFFDF7',
    coordinates: [0, 0, -90],
    description: 'Visit the Storybook Cottage, turn illustrated pages, and listen to warm fables.',
    learningFocus: ['Story Pictures', 'Friendly Voiceover', 'Kind Morals', 'Easy Words'],
    totalStars: 5
  },
  {
    id: 'stars',
    name: 'Star Observatory',
    shortName: 'Stars',
    tagline: 'See your earned stars and happy badges!',
    landmark: 'Hilltop Observatory Dome',
    iconName: 'Star',
    icon: '⭐',
    themeColor: '#F59E0B', // Golden Yellow
    accentColor: '#FEF08A',
    bgColor: '#FFFDF7',
    coordinates: [75, 0, -75],
    description: 'Climb the starlight hill, look through the telescope, explore feelings, and practice calm breathing.',
    learningFocus: ['Star Rewards', 'Feelings & Emotions', 'Badges', 'Celebration'],
    totalStars: 5
  }
];

export const ALPHABET_DATA: LetterItem[] = [
  { letter: 'A', word: 'Apple', phonics: '/æ/ like Apple', icon: '🍎', color: '#EF4444', description: 'Sweet, crisp red fruit that grows on orchard trees!' },
  { letter: 'B', word: 'Bear', phonics: '/b/ like Bear', icon: '🐻', color: '#D97706', description: 'A cozy furry friend who loves honey and berries.' },
  { letter: 'C', word: 'Cat', phonics: '/k/ like Cat', icon: '🐱', color: '#3B82F6', description: 'A soft playful friend with whiskers that purrs.' },
  { letter: 'D', word: 'Duck', phonics: '/d/ like Duck', icon: '🦆', color: '#0D9488', description: 'Swims gently in the meadow pond and quacks.' },
  { letter: 'E', word: 'Elephant', phonics: '/ɛ/ like Elephant', icon: '🐘', color: '#8B5CF6', description: 'A gentle giant friend with a long playful trunk.' },
  { letter: 'F', word: 'Fish', phonics: '/f/ like Fish', icon: '🐟', color: '#0284C7', description: 'Glides gracefully through crystal clear stream water.' },
  { letter: 'G', word: 'Giraffe', phonics: '/dʒ/ like Giraffe', icon: '🦒', color: '#F59E0B', description: 'Has a tall spotted neck to reach sunny treetops.' },
  { letter: 'H', word: 'House', phonics: '/h/ like House', icon: '🏡', color: '#EC4899', description: 'A warm cozy place full of kindness and love.' },
  { letter: 'I', word: 'Iguana', phonics: '/ɪ/ like Iguana', icon: '🦎', color: '#10B981', description: 'A peaceful gentle lizard basking in the warm sunshine.' },
  { letter: 'J', word: 'Juice', phonics: '/dʒ/ like Juice', icon: '🧃', color: '#F97316', description: 'Refreshing fruity drink made from fresh orchard fruit.' },
  { letter: 'K', word: 'Kangaroo', phonics: '/k/ like Kangaroo', icon: '🦘', color: '#B45309', description: 'Bounces high and carries little joey babies in a pouch.' },
  { letter: 'L', word: 'Lion', phonics: '/l/ like Lion', icon: '🦁', color: '#EAB308', description: 'A brave kind friend with a fluffy golden mane.' },
  { letter: 'M', word: 'Moon', phonics: '/m/ like Moon', icon: '🌙', color: '#6366F1', description: 'Glows gently like a nightlight in the evening sky.' },
  { letter: 'N', word: 'Nest', phonics: '/n/ like Nest', icon: '🪺', color: '#78350F', description: 'A cozy twig cradle for baby chirping birds.' },
  { letter: 'O', word: 'Owl', phonics: '/aʊ/ like Owl', icon: '🦉', color: '#8B5CF6', description: 'A wise gentle night friend who says Hoo-Hoo!' },
  { letter: 'P', word: 'Penguin', phonics: '/p/ like Penguin', icon: '🐧', color: '#334155', description: 'Waddles happily on snow and slides on its belly.' },
  { letter: 'Q', word: 'Queen', phonics: '/kw/ like Queen', icon: '👑', color: '#A855F7', description: 'Wears a shining golden crown with sparkling gems.' },
  { letter: 'R', word: 'Rainbow', phonics: '/r/ like Rainbow', icon: '🌈', color: '#EC4899', description: 'A bridge of seven bright colors across the sky.' },
  { letter: 'S', word: 'Sun', phonics: '/s/ like Sun', icon: '☀️', color: '#EAB308', description: 'Warms the whole meadow and helps flowers bloom.' },
  { letter: 'T', word: 'Tree', phonics: '/t/ like Tree', icon: '🌳', color: '#15803D', description: 'Grows strong with leafy branches that shelter birds.' },
  { letter: 'U', word: 'Umbrella', phonics: '/ʌ/ like Umbrella', icon: '☂️', color: '#0284C7', description: 'Keeps us dry when gentle summer rain showers fall.' },
  { letter: 'V', word: 'Violin', phonics: '/v/ like Violin', icon: '🎻', color: '#B45309', description: 'Plays sweet harmonious tunes in the Music Garden.' },
  { letter: 'W', word: 'Whale', phonics: '/w/ like Whale', icon: '🐳', color: '#0284C7', description: 'A friendly ocean giant spraying water from its spout.' },
  { letter: 'X', word: 'Xylophone', phonics: '/z/ like Xylophone', icon: '🎶', color: '#EC4899', description: 'Rainbow chime bars that ring like gentle bells.' },
  { letter: 'Y', word: 'Yacht', phonics: '/j/ like Yacht', icon: '⛵', color: '#0284C7', description: 'A clean sailing boat that glides with the breeze.' },
  { letter: 'Z', word: 'Zebra', phonics: '/z/ like Zebra', icon: '🦓', color: '#1E293B', description: 'Has black and white stripes like a gentle optical pattern.' }
];

export const NUMBERS_DATA: NumberItem[] = [
  { number: 1, word: 'One', itemEmoji: '⭐', itemName: 'Shining Star', color: '#3B82F6' },
  { number: 2, word: 'Two', itemEmoji: '🐥', itemName: 'Yellow Chicks', color: '#F59E0B' },
  { number: 3, word: 'Three', itemEmoji: '🍎', itemName: 'Crisp Apples', color: '#EF4444' },
  { number: 4, word: 'Four', itemEmoji: '🦋', itemName: 'Fluttering Butterflies', color: '#EC4899' },
  { number: 5, word: 'Five', itemEmoji: '🌸', itemName: 'Pink Blossoms', color: '#10B981' },
  { number: 6, word: 'Six', itemEmoji: '🍓', itemName: 'Sweet Strawberries', color: '#F97316' },
  { number: 7, word: 'Seven', itemEmoji: '🌈', itemName: 'Rainbow Arches', color: '#8B5CF6' },
  { number: 8, word: 'Eight', itemEmoji: '🎈', itemName: 'Floating Balloons', color: '#06B6D4' },
  { number: 9, word: 'Nine', itemEmoji: '🍄', itemName: 'Woodland Mushrooms', color: '#D97706' },
  { number: 10, word: 'Ten', itemEmoji: '🐝', itemName: 'Honey Bees', color: '#EAB308' },
  { number: 11, word: 'Eleven', itemEmoji: '🌼', itemName: 'Sun Daisies', color: '#84CC16' },
  { number: 12, word: 'Twelve', itemEmoji: '🍒', itemName: 'Red Cherries', color: '#E11D48' },
  { number: 13, word: 'Thirteen', itemEmoji: '🍂', itemName: 'Autumn Leaves', color: '#B45309' },
  { number: 14, word: 'Fourteen', itemEmoji: '🐚', itemName: 'Stream Pebbles', color: '#64748B' },
  { number: 15, word: 'Fifteen', itemEmoji: '🥕', itemName: 'Sweet Carrots', color: '#EA580C' },
  { number: 16, word: 'Sixteen', itemEmoji: '🪺', itemName: 'Little Nests', color: '#78350F' },
  { number: 17, word: 'Seventeen', itemEmoji: '🍇', itemName: 'Purple Grapes', color: '#9333EA' },
  { number: 18, word: 'Eighteen', itemEmoji: '🍉', itemName: 'Juicy Watermelons', color: '#16A34A' },
  { number: 19, word: 'Nineteen', itemEmoji: '🍊', itemName: 'Sweet Oranges', color: '#F97316' },
  { number: 20, word: 'Twenty', itemEmoji: '🌟', itemName: 'Golden Wonder Stars', color: '#EAB308' }
];

export const FRUITS_DATA: FruitItem[] = [
  { id: 'apple', name: 'Apple', colorName: 'Red', colorHex: '#EF4444', shape: 'Round', emoji: '🍎', fact: 'Apples float in water because 25% of their volume is air!' },
  { id: 'banana', name: 'Banana', colorName: 'Yellow', colorHex: '#EAB308', shape: 'Curved', emoji: '🍌', fact: 'Bananas grow pointing upward toward the warm sunshine.' },
  { id: 'orange', name: 'Orange', colorName: 'Orange', colorHex: '#F97316', shape: 'Round', emoji: '🍊', fact: 'Oranges are bursting with healthy Vitamin C.' },
  { id: 'strawberry', name: 'Strawberry', colorName: 'Red', colorHex: '#EF4444', shape: 'Heart', emoji: '🍓', fact: 'Strawberries wear their tiny seeds on the outside!' },
  { id: 'grape', name: 'Grape', colorName: 'Purple', colorHex: '#8B5CF6', shape: 'Oval cluster', emoji: '🍇', fact: 'Grapes grow in happy clusters on gentle vineyard vines.' },
  { id: 'watermelon', name: 'Watermelon', colorName: 'Green & Red', colorHex: '#10B981', shape: 'Oval', emoji: '🍉', fact: 'Over 92% of a juicy watermelon is pure refreshing water!' },
  { id: 'lemon', name: 'Lemon', colorName: 'Yellow', colorHex: '#FBBF24', shape: 'Oval', emoji: '🍋', fact: 'Lemons have a bright, zesty scent that awakens the senses.' },
  { id: 'peach', name: 'Peach', colorName: 'Peach Pink', colorHex: '#FB7185', shape: 'Round', emoji: '🍑', fact: 'Peaches have super soft fuzzy skin like velvet.' },
  { id: 'cherry', name: 'Cherry', colorName: 'Deep Red', colorHex: '#E11D48', shape: 'Round pair', emoji: '🍒', fact: 'Cherries often grow connected in cute pairs on stems.' },
  { id: 'pear', name: 'Pear', colorName: 'Green', colorHex: '#84CC16', shape: 'Teardrop', emoji: '🍐', fact: 'Pears become sweeter and softer the longer they rest.' },
  { id: 'pineapple', name: 'Pineapple', colorName: 'Golden Yellow', colorHex: '#F59E0B', shape: 'Oval crown', emoji: '🍍', fact: 'Pineapples wear a spiky leafy crown like nature’s royalty.' },
  { id: 'mango', name: 'Mango', colorName: 'Golden Orange', colorHex: '#EA580C', shape: 'Kidney shape', emoji: '🥭', fact: 'Known as the king of tropical fruits in sunny groves.' },
  { id: 'kiwi', name: 'Kiwi', colorName: 'Brown & Green', colorHex: '#65A30D', shape: 'Oval', emoji: '🥝', fact: 'Fuzzy brown outside with bright emerald green inside!' },
  { id: 'blueberry', name: 'Blueberry', colorName: 'Deep Blue', colorHex: '#3B82F6', shape: 'Small Sphere', emoji: '🫐', fact: 'Blueberries grow on cozy woodland bushes in summer.' },
  { id: 'coconut', name: 'Coconut', colorName: 'Brown', colorHex: '#78350F', shape: 'Round', emoji: '🥥', fact: 'Coconuts can float across ocean waters to plant new trees.' },
  { id: 'avocado', name: 'Avocado', colorName: 'Dark Green', colorHex: '#15803D', shape: 'Pear-shaped', emoji: '🥑', fact: 'Creamy green fruit with a big round wooden seed.' },
  { id: 'papaya', name: 'Papaya', colorName: 'Orange', colorHex: '#F97316', shape: 'Elongated', emoji: '🍈', fact: 'Has hundreds of shiny black round pearl seeds inside.' },
  { id: 'plum', name: 'Plum', colorName: 'Deep Purple', colorHex: '#7E22CE', shape: 'Round', emoji: '🫐', fact: 'Sweet and tart fruit that makes delicious jams.' },
  { id: 'pomegranate', name: 'Pomegranate', colorName: 'Ruby Red', colorHex: '#BE123C', shape: 'Round', emoji: '🍎', fact: 'Filled with hundreds of sparkling sweet ruby seeds!' },
  { id: 'fig', name: 'Fig', colorName: 'Purple-Brown', colorHex: '#6B21A8', shape: 'Teardrop', emoji: '🌰', fact: 'One of the oldest fruits grown in ancient orchards.' }
];

export const ANIMALS_DATA: AnimalItem[] = [
  // Farm (6)
  { id: 'cow', name: 'Cow', soundText: 'Moo-Moo!', emoji: '🐮', diet: 'Fresh Green Clover', habitat: 'farm', habitatName: 'Farm Pasture', funFact: 'Cows have best friend companions and love grassy pastures.' },
  { id: 'sheep', name: 'Sheep', soundText: 'Baa-Baa!', emoji: '🐑', diet: 'Sweet Meadow Grass', habitat: 'farm', habitatName: 'Farm Pasture', funFact: 'Sheep have super soft fluffy wool that keeps them warm.' },
  { id: 'horse', name: 'Horse', soundText: 'Neigh-Neigh!', emoji: '🐴', diet: 'Crisp Apples & Hay', habitat: 'farm', habitatName: 'Farm Pasture', funFact: 'Horses can sleep both lying down and standing up!' },
  { id: 'chicken', name: 'Chicken', soundText: 'Cluck-Cluck!', emoji: '🐔', diet: 'Golden Grain Seeds', habitat: 'farm', habitatName: 'Farm Pasture', funFact: 'Chickens talk to each other with over 30 distinct friendly sounds.' },
  { id: 'goat', name: 'Goat', soundText: 'Maaa-Maaa!', emoji: '🐐', diet: 'Leaves & Shrubs', habitat: 'farm', habitatName: 'Farm Pasture', funFact: 'Goats are amazing agile climbers that can balance on rocks.' },
  { id: 'pig', name: 'Pig', soundText: 'Oink-Oink!', emoji: '🐷', diet: 'Crunchy Veggies', habitat: 'farm', habitatName: 'Farm Pasture', funFact: 'Pigs are super smart, friendly, and love playing games.' },

  // Forest (6)
  { id: 'bear', name: 'Bear', soundText: 'Grrr-Hummm!', emoji: '🐻', diet: 'Sweet Honey & Berries', habitat: 'forest', habitatName: 'Woodland Forest', funFact: 'Bears have an incredible sense of smell to find ripe berries.' },
  { id: 'rabbit', name: 'Rabbit', soundText: 'Thump-Thump!', emoji: '🐰', diet: 'Crunchy Carrots', habitat: 'forest', habitatName: 'Woodland Forest', funFact: 'Rabbits binky (jump and twist in the air) when super happy!' },
  { id: 'fox', name: 'Fox', soundText: 'Yip-Yip!', emoji: '🦊', diet: 'Forest Berries', habitat: 'forest', habitatName: 'Woodland Forest', funFact: 'Foxes use their fluffy bushy tails like a warm blanket in winter.' },
  { id: 'owl', name: 'Owl', soundText: 'Hoo-Hoo!', emoji: '🦉', diet: 'Night Insects', habitat: 'forest', habitatName: 'Woodland Forest', funFact: 'Owls can turn their heads almost all the way around!' },
  { id: 'deer', name: 'Deer', soundText: 'Bleat-Bleat!', emoji: '🦌', diet: 'Acorns & Tender Leaves', habitat: 'forest', habitatName: 'Woodland Forest', funFact: 'Baby fawns have gentle spots to camouflage in dappled forest light.' },
  { id: 'squirrel', name: 'Squirrel', soundText: 'Chitter-Chatter!', emoji: '🐿️', diet: 'Crunchy Acorns', habitat: 'forest', habitatName: 'Woodland Forest', funFact: 'Squirrels plant thousands of new trees by burying hidden acorns.' },

  // Jungle (6)
  { id: 'lion', name: 'Lion', soundText: 'Roaaar!', emoji: '🦁', diet: 'Healthy Treats', habitat: 'jungle', habitatName: 'Tropical Jungle', funFact: 'Lions live in supportive family groups called prides.' },
  { id: 'elephant', name: 'Elephant', soundText: 'Pawoo-Trumpet!', emoji: '🐘', diet: 'Banana Leaves', habitat: 'jungle', habitatName: 'Tropical Jungle', funFact: 'Elephants can hug friends using their gentle long trunks.' },
  { id: 'monkey', name: 'Monkey', soundText: 'Ooh-Ooh Aah-Aah!', emoji: '🐵', diet: 'Sweet Bananas', habitat: 'jungle', habitatName: 'Tropical Jungle', funFact: 'Monkeys use their strong tails like an extra helping hand.' },
  { id: 'giraffe', name: 'Giraffe', soundText: 'Soft Hummm!', emoji: '🦒', diet: 'Sunny Treetop Leaves', habitat: 'jungle', habitatName: 'Tropical Jungle', funFact: 'A giraffe is the tallest mammal on Earth with a blue tongue!' },
  { id: 'zebra', name: 'Zebra', soundText: 'Whinny-Bark!', emoji: '🦓', diet: 'Savannah Grass', habitat: 'jungle', habitatName: 'Tropical Jungle', funFact: 'No two zebras have the exact same black and white stripe pattern!' },
  { id: 'tiger', name: 'Tiger', soundText: 'Chuff-Roar!', emoji: '🐯', diet: 'Rich Protein Treats', habitat: 'jungle', habitatName: 'Tropical Jungle', funFact: 'Tigers are exceptional swimmers and love relaxing in cool ponds.' },

  // Water (4)
  { id: 'duck', name: 'Duck', soundText: 'Quack-Quack!', emoji: '🦆', diet: 'Water Pond Plants', habitat: 'water', habitatName: 'Stream & Pond', funFact: 'Duck feathers are naturally waterproof to stay warm and dry.' },
  { id: 'dolphin', name: 'Dolphin', soundText: 'Click-Whistle!', emoji: '🐬', diet: 'Ocean Fish', habitat: 'water', habitatName: 'Stream & Ocean', funFact: 'Dolphins communicate using unique signature whistle names!' },
  { id: 'turtle', name: 'Turtle', soundText: 'Gentle Hiss!', emoji: '🐢', diet: 'Lily Pads & Seaweed', habitat: 'water', habitatName: 'Stream & Pond', funFact: 'Turtles carry their cozy shell house wherever they swim.' },
  { id: 'whale', name: 'Whale', soundText: 'Ocean Song!', emoji: '🐳', diet: 'Tiny Plankton', habitat: 'water', habitatName: 'Stream & Ocean', funFact: 'Blue whales are the largest, gentlest creatures to ever live on Earth.' }
];

export const EMOTIONS_DATA: EmotionItem[] = [
  { id: 'happy', name: 'Happy', emoji: '😊', description: 'Feeling joyful, sunny, and full of smiles!', copingTip: 'Share your warm smile or give a friendly hug to someone nearby!' },
  { id: 'calm', name: 'Calm', emoji: '😌', description: 'Feeling relaxed, peaceful, and centered like a quiet lake.', copingTip: 'Take slow, gentle deep breaths and listen to the birds singing.' },
  { id: 'curious', name: 'Curious', emoji: '🧐', description: 'Wondering about new ideas and eager to discover things.', copingTip: 'Ask fun questions and explore new paths in Wonder Meadow!' },
  { id: 'sad', name: 'Sad', emoji: '🥺', description: 'Feeling down, teary, or needing gentle comfort.', copingTip: 'It is okay to cry. Wrap yourself in a cozy blanket or talk with someone you love.' },
  { id: 'angry', name: 'Angry', emoji: '😤', description: 'Feeling frustrated or having a volcano rumble inside.', copingTip: 'Breathe in slowly like smelling a flower, and breathe out like blowing bubbles.' },
  { id: 'silly', name: 'Silly', emoji: '🤪', description: 'Feeling playful, giggly, and full of goofy wiggles.', copingTip: 'Do a funny little wiggle dance or tell a silly joke!' },
  { id: 'surprised', name: 'Surprised', emoji: '😲', description: 'Feeling startled or amazed by something unexpected.', copingTip: 'Take a soft pause and look closely at the wonder around you.' },
  { id: 'proud', name: 'Proud', emoji: '🥰', description: 'Feeling great about trying your best and practicing.', copingTip: 'Celebrate your efforts with a high five or a happy victory dance!' }
];

export const MUSIC_NOTES = [
  { pitch: 'C', solfege: 'Do', colorHex: '#EF4444' }, // Red
  { pitch: 'D', solfege: 'Re', colorHex: '#F97316' }, // Orange
  { pitch: 'E', solfege: 'Mi', colorHex: '#FBBF24' }, // Yellow
  { pitch: 'F', solfege: 'Fa', colorHex: '#10B981' }, // Green
  { pitch: 'G', solfege: 'Sol', colorHex: '#06B6D4' }, // Cyan
  { pitch: 'A', solfege: 'La', colorHex: '#3B82F6' }, // Blue
  { pitch: 'B', solfege: 'Ti', colorHex: '#8B5CF6' }, // Purple
  { pitch: 'C2', solfege: 'Do', colorHex: '#EC4899' }  // Pink
];

export const NURSERY_SONGS: NurserySong[] = [
  {
    id: 'twinkle',
    title: 'Twinkle, Twinkle, Little Star',
    type: 'nursery_song',
    icon: '⭐',
    theme: 'Night Sky & Wonder',
    learningObjective: 'Pitch matching, cosmic wonder, and steady tempo',
    visualSceneTag: 'night-sky',
    lyrics: 'Twinkle, twinkle, little star, how I wonder what you are! Up above the world so high, like a diamond in the sky.',
    verses: [
      'Twinkle, twinkle, little star,',
      'How I wonder what you are!',
      'Up above the world so high,',
      'Like a diamond in the sky.',
      'When the blazing sun is gone,',
      'When he nothing shines upon,',
      'Then you show your little light,',
      'Twinkle, twinkle, through the night.'
    ],
    melodyNotes: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0],
    tempoBpm: 84
  },
  {
    id: 'mary',
    title: 'Mary Had a Little Lamb',
    type: 'nursery_song',
    icon: '🐑',
    theme: 'Animal Companionship',
    learningObjective: 'Melody step-downs, animal kindness, and rhythm',
    visualSceneTag: 'pasture-meadow',
    lyrics: 'Mary had a little lamb, its fleece was white as snow, and everywhere that Mary went, the lamb was sure to go!',
    verses: [
      'Mary had a little lamb,',
      'Its fleece was white as snow.',
      'And everywhere that Mary went,',
      'The lamb was sure to go!',
      'It followed her to school one day,',
      'Which was against the rule,',
      'It made the children laugh and play,',
      'To see a lamb at school.'
    ],
    melodyNotes: [2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 4, 4],
    tempoBpm: 92
  },
  {
    id: 'wheels',
    title: 'The Wheels on the Bus',
    type: 'nursery_song',
    icon: '🚌',
    theme: 'Action & Motion',
    learningObjective: 'Auditory repetition, rhythm clapping, and community helpers',
    visualSceneTag: 'rolling-road',
    lyrics: 'The wheels on the bus go round and round, round and round, all through the town!',
    verses: [
      'The wheels on the bus go round and round,',
      'Round and round, round and round.',
      'The wipers on the bus go swish, swish, swish,',
      'Swish, swish, swish, swish, swish, swish.',
      'The horn on the bus goes beep, beep, beep,',
      'Beep, beep, beep, all through the town!'
    ],
    melodyNotes: [0, 3, 3, 3, 3, 5, 4, 3, 2, 1, 2, 3, 0],
    tempoBpm: 104
  },
  {
    id: 'macdonald',
    title: 'Old MacDonald Had a Farm',
    type: 'nursery_song',
    icon: '🚜',
    theme: 'Farm Animals & Sounds',
    learningObjective: 'Phonics imitation, animal sounds, and joy',
    visualSceneTag: 'animal-farm',
    lyrics: 'Old MacDonald had a farm, E-I-E-I-O! And on that farm he had some ducks, E-I-E-I-O!',
    verses: [
      'Old MacDonald had a farm, E-I-E-I-O!',
      'And on that farm he had some ducks, E-I-E-I-O!',
      'With a quack-quack here, and a quack-quack there,',
      'Here a quack, there a quack, everywhere a quack-quack!',
      'Old MacDonald had a farm, E-I-E-I-O!'
    ],
    melodyNotes: [4, 4, 4, 1, 2, 2, 1, 6, 6, 5, 5, 4],
    tempoBpm: 98
  },
  {
    id: 'caterpillar-poem',
    title: 'The Fuzzy Little Caterpillar',
    type: 'poem',
    icon: '🐛',
    theme: 'Metamorphosis & Nature',
    learningObjective: 'Gentle poetry, rhyme awareness, and nature transformation',
    visualSceneTag: 'flower-garden',
    lyrics: 'Fuzzy little caterpillar crawling on a leaf, spin a cozy chrysalis, fast asleep beneath!',
    verses: [
      'Fuzzy little caterpillar crawling on a leaf,',
      'Munching on the clover petals, resting underneath.',
      'Spinning a tiny silken home, so snug and safe and tight,',
      'Dreaming of the sunny sky and flowers in the light.',
      'Wake up, little butterfly, spread your colorful wings,',
      'Fly into Wonder Meadow as the robin softly sings!'
    ],
    melodyNotes: [0, 2, 4, 5, 4, 2, 0, 2, 4, 4, 2, 0],
    tempoBpm: 80
  },
  {
    id: 'rainbow-bells-song',
    title: 'The Wonder Meadow Rainbow Song',
    type: 'rhythm_game',
    icon: '🌈',
    theme: 'Colors & Harmony',
    learningObjective: 'Pitch discrimination (Do-Re-Mi-Fa-Sol-La-Ti-Do) and color synchronization',
    visualSceneTag: 'rainbow-bells',
    lyrics: 'Red, orange, yellow, green, brightest colors you have seen! Blue and purple, pink and bright, making music in the light!',
    verses: [
      'Red, orange, yellow, green,',
      'Brightest colors you have seen!',
      'Blue and purple, pink and bright,',
      'Making music in the light!',
      'Tap the chime and ring the bell,',
      'Every note a song will tell!'
    ],
    melodyNotes: [0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 0],
    tempoBpm: 100
  }
];

export const STORIES_DATA: StoryItem[] = [
  {
    id: 'bear-honey',
    title: 'The Little Bear’s Honey Quest',
    moral: 'Sharing with friends makes everything sweeter.',
    learningObjective: 'Empathy, friendship, and positive sharing habits',
    characters: ['Barnaby the Bear', 'Pippin the Bunny', 'Oliver the Owl'],
    scenes: [
      {
        sceneNumber: 1,
        title: 'A Sunny Morning',
        illustration: '🐻🧺',
        narration: 'Barnaby the little bear woke up on a bright sunny morning with a cheerful rumble in his tummy. He polished his wooden basket and set off across the clover meadow.',
        caption: 'Barnaby starts his morning journey with high spirits.',
        environmentTag: 'meadow-morning',
        interactionPrompt: 'Tap Barnaby to help him pack his wooden basket!'
      },
      {
        sceneNumber: 2,
        title: 'The Fruit Orchard Discovery',
        illustration: '🍎🍯',
        narration: 'Barnaby hopped past the blooming apple trees in the Fruit Orchard. Right beneath a golden branch, he found sweet crisp apples and a honeycomb glistening in the sunshine.',
        caption: 'The orchard is full of juicy fruits and fresh clover nectar.',
        environmentTag: 'orchard-grove',
        interactionPrompt: 'Pick a red apple from the tree for the basket.'
      },
      {
        sceneNumber: 3,
        title: 'Meeting Pippin by the Stream',
        illustration: '🐰🌊',
        narration: 'As he crossed the wooden footbridge over the babbling brook, Barnaby saw Pippin the bunny sitting quietly on a smooth pebble, looking hungry.',
        caption: 'Pippin had hopped all morning and hadn’t found breakfast yet.',
        environmentTag: 'stream-bridge',
        interactionPrompt: 'Wave hello to Pippin across the water.'
      },
      {
        sceneNumber: 4,
        title: 'A Delicious Picnic to Share',
        illustration: '🍓🧺',
        narration: '"Would you like to share my sweet apples and honey?" asked Barnaby with a warm smile. Pippin’s ears perked up with joy as they spread a picnic cloth together.',
        caption: 'Kindness turns a simple snack into a joyful celebration.',
        environmentTag: 'picnic-grove',
        interactionPrompt: 'Pass half of the golden apple to Pippin!'
      },
      {
        sceneNumber: 5,
        title: 'A Friendship Under the Whispering Oak',
        illustration: '🎉🌳',
        narration: 'Oliver the Owl watched from his cozy branch and hooted softly in approval. Barnaby and Pippin laughed and played tag until the golden sun dipped low.',
        caption: 'Sharing good things makes smiles twice as bright and hearts twice as happy.',
        environmentTag: 'whispering-oak',
        interactionPrompt: 'Tap both friends to give them a happy celebration spin!'
      },
      {
        sceneNumber: 6,
        title: 'Sweet Dreams in Wonder Meadow',
        illustration: '🌙⭐',
        narration: 'As fireflies danced over the sparkling pond, Barnaby walked home knowing that true happiness is found in the joy we share with others.',
        caption: 'The stars twinkle over Wonder Meadow as all the friends sleep peacefully.',
        environmentTag: 'night-meadow',
        interactionPrompt: 'Tap the twinkling star to say goodnight!'
      }
    ]
  },
  {
    id: 'brave-squirrel',
    title: 'The Brave Squirrel’s Big Acorn',
    moral: 'Asking for help and working together makes big challenges easy.',
    learningObjective: 'Collaboration, courage, and asking for assistance',
    characters: ['Sammy Squirrel', 'Daphne Duck', 'Fiona Frog'],
    scenes: [
      {
        sceneNumber: 1,
        title: 'The High Treetop Treasure',
        illustration: '🐿️🌳',
        narration: 'High in the highest branches of the Whispering Oak, Sammy the squirrel spotted the largest, smoothest golden acorn he had ever seen.',
        caption: 'Sammy loved collecting acorns for his family’s winter pantry.',
        environmentTag: 'whispering-oak',
        interactionPrompt: 'Tap the golden acorn to help Sammy reach it!'
      },
      {
        sceneNumber: 2,
        title: 'The Rolling Splash',
        illustration: '🌰💦',
        narration: 'Whoosh! The acorn slipped and tumbled down the grassy hill, bouncing across the stone path and landing in the center of the lily pond!',
        caption: 'Sammy’s big acorn was floating right out in the deep water.',
        environmentTag: 'pond-edge',
        interactionPrompt: 'Follow the ripples across the water surface.'
      },
      {
        sceneNumber: 3,
        title: 'A Feathered Friend Appears',
        illustration: '🦆🌊',
        narration: 'Sammy was worried because squirrels cannot swim far. Just then, Daphne the duck glided over with a friendly quack: "Don’t worry Sammy, climb on my back!"',
        caption: 'Daphne is a champion swimmer on the pond.',
        environmentTag: 'sparkling-pond',
        interactionPrompt: 'Hop Sammy safely onto Daphne’s warm back!'
      },
      {
        sceneNumber: 4,
        title: 'Teamwork on the Waves',
        illustration: '🌿🤝',
        narration: 'Together they paddled between the green lily pads. Fiona the frog held a long water reed to gently steer the golden acorn into Daphne’s reach.',
        caption: 'Three friends working together made the rescue smooth and fun.',
        environmentTag: 'sparkling-pond',
        interactionPrompt: 'Guide the water reed toward the acorn!'
      },
      {
        sceneNumber: 5,
        title: 'Safe on the Grassy Bank',
        illustration: '🌟🦆',
        narration: 'With a gentle heave, Daphne brought Sammy and the golden acorn safely back to the warm clover shore. Everyone cheered happily!',
        caption: 'Sammy thanked his friends with crunchy sunflower seeds.',
        environmentTag: 'pond-bank',
        interactionPrompt: 'Share a high five with Daphne and Fiona!'
      },
      {
        sceneNumber: 6,
        title: 'The Lesson of True Courage',
        illustration: '🌈🐿️',
        narration: 'Sammy learned that being brave doesn’t mean doing everything all alone—it means having the courage to reach out and work together with friends.',
        caption: 'Wonder Meadow is always kinder when we help each other.',
        environmentTag: 'meadow-sunshine',
        interactionPrompt: 'Ring the celebration bell!'
      }
    ]
  },
  {
    id: 'duckling-song',
    title: 'The Duckling Who Loved to Sing',
    moral: 'Your unique voice and special talents are a wonderful gift.',
    learningObjective: 'Self-confidence, artistic expression, and celebrating individuality',
    characters: ['Pip the Duckling', 'Maestro Bullfrog', 'Chime Flowers'],
    scenes: [
      {
        sceneNumber: 1,
        title: 'A Different Kind of Voice',
        illustration: '🦆🎶',
        narration: 'While all the other ducklings in the pond quacked in unison, little Pip loved to sing cheerful musical melodies: "Do-Re-Mi, La-La-Loo!"',
        caption: 'Pip loved melody and rhythm more than standard quacking.',
        environmentTag: 'sparkling-pond',
        interactionPrompt: 'Tap Pip to hear her cheerful note!'
      },
      {
        sceneNumber: 2,
        title: 'Practice in the Music Garden',
        illustration: '🌸🎵',
        narration: 'Pip waddled over to the Music Garden. She tapped her orange bill against the rainbow chime flowers, discovering that each blossom made a beautiful bell tone.',
        caption: 'The chime flowers glowed each time Pip sang their pitch.',
        environmentTag: 'music-garden',
        interactionPrompt: 'Tap the rainbow chime flowers in order!'
      },
      {
        sceneNumber: 3,
        title: 'The Frog Chorus Listens',
        illustration: '🐸🦆',
        narration: 'Maestro Bullfrog hopped onto a mossy log. "What delightful harmony!" he croaked. "Would you lead our evening meadow concert, Pip?"',
        caption: 'The pond frogs wanted to sing along with Pip’s sweet melody.',
        environmentTag: 'frog-log',
        interactionPrompt: 'Count 3 happy frogs on the log.'
      },
      {
        sceneNumber: 4,
        title: 'The Sunset Meadow Symphony',
        illustration: '🌅🎶',
        narration: 'As the sun painted the sky in shades of peach and lavender, animals from every corner of Wonder Meadow gathered around the Music Gazebo to listen.',
        caption: 'Bears, bunnies, owls, and deer listened with wide happy eyes.',
        environmentTag: 'sunset-gazebo',
        interactionPrompt: 'Light up the musical lanterns!'
      },
      {
        sceneNumber: 5,
        title: 'A Standing Ovation',
        illustration: '🎉🦆',
        narration: 'Pip sang her heart out with clarity and joy. When the final chime rang, the entire meadow erupted in clapping and cheerful hoots and chirps!',
        caption: 'Pip beamed with pride as her friends cheered.',
        environmentTag: 'music-gazebo',
        interactionPrompt: 'Send flying confetti to celebrate Pip!'
      },
      {
        sceneNumber: 6,
        title: 'Singing with Confidence',
        illustration: '💖✨',
        narration: 'Pip knew she didn’t have to quack like everyone else. By sharing her own authentic song, she brought music and harmony to the whole world.',
        caption: 'Be yourself—your unique gifts make the world brighter.',
        environmentTag: 'night-sky',
        interactionPrompt: 'Sing along with your best happy voice!'
      }
    ]
  },
  {
    id: 'starlight-dance',
    title: 'The Star That Wanted to Dance',
    moral: 'Even the smallest light can brighten the biggest night.',
    learningObjective: 'Self-worth, peaceful bedtime calm, and kindness',
    characters: ['Nova the Star', 'Oliver Owl', 'Forest Fireflies'],
    scenes: [
      {
        sceneNumber: 1,
        title: 'High in the Velvet Sky',
        illustration: '⭐🌙',
        narration: 'High above Wonder Meadow, a tiny starlight named Nova sparkled warmly. Nova watched the fireflies dancing near the Star Observatory and wished to join them.',
        caption: 'Nova was small, but her heart shone with pure golden light.',
        environmentTag: 'star-observatory',
        interactionPrompt: 'Trace Nova’s golden starlight path.'
      },
      {
        sceneNumber: 2,
        title: 'A Gentle Descent',
        illustration: '✨🪲',
        narration: 'With a soft hum, Nova drifted down on a beam of moonlight, illuminating the mossy stone steps and the gentle flowing stream.',
        caption: 'The forest below glowed with a cozy, magical warmth.',
        environmentTag: 'forest-trail',
        interactionPrompt: 'Count 4 glowing fireflies as they flutter.'
      },
      {
        sceneNumber: 3,
        title: 'Guiding the Sleepy Animals',
        illustration: '🦉⭐',
        narration: 'Oliver the wise owl greeted her: "Nova, your gentle light is guiding the little baby squirrels and rabbits safely back to their cozy burrows!"',
        caption: 'Nova’s shine made the dark woods feel safe and peaceful.',
        environmentTag: 'whispering-oak',
        interactionPrompt: 'Light the pathway for the baby bunny.'
      },
      {
        sceneNumber: 4,
        title: 'The Starlight Waltz',
        illustration: '💫🎶',
        narration: 'The fireflies circled around Nova in a shimmering spiral. Together they performed the Starlight Waltz, casting soothing golden patterns on the meadow flowers.',
        caption: 'The evening breeze carried gentle lullaby chimes.',
        environmentTag: 'meadow-waltz',
        interactionPrompt: 'Spin with the fireflies in rhythm!'
      },
      {
        sceneNumber: 5,
        title: 'Back to the Night Constellation',
        illustration: '🌌⭐',
        narration: 'Having brought safety and comfort to all the meadow friends, Nova floated back up into the observatory sky, shining brighter than ever before.',
        caption: 'Nova took her proud place in the Wonder Meadow constellation.',
        environmentTag: 'starry-sky',
        interactionPrompt: 'Place Nova gently into the golden star crown.'
      },
      {
        sceneNumber: 6,
        title: 'Peaceful Slumber',
        illustration: '💤🌟',
        narration: 'All across Wonder Meadow, friends tucked into their warm beds under the loving watch of Nova’s gentle glow, ready for tomorrow’s adventures.',
        caption: 'Goodnight Wonder Meadow. Sweet dreams filled with wonder.',
        environmentTag: 'dream-meadow',
        interactionPrompt: 'Whisper "Sweet dreams" and tap to finish!'
      }
    ]
  }
];
