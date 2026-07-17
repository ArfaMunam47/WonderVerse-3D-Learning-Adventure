/**
 * data.js
 * ---------------------------------------------------------------------------
 * Pure data: every learning category the game teaches lives here as plain
 * arrays/objects. Keeping this separate from game logic means new content
 * (a new fruit, a new animal) can be added without touching any 3D or UI code.
 * ---------------------------------------------------------------------------
 */

const GAME_DATA = {

  // ---- Colors (used by flowers in the Flower Garden zone) -----------------
  colors: [
    { name: "Red",    hex: 0xE84545 },
    { name: "Orange", hex: 0xFF9F43 },
    { name: "Yellow", hex: 0xFFD93D },
    { name: "Green",  hex: 0x6BCB77 },
    { name: "Blue",   hex: 0x4D96FF },
    { name: "Purple", hex: 0xA66DD4 },
    { name: "Pink",   hex: 0xFF8FC7 },
    { name: "Brown",  hex: 0xA9743C },
    { name: "Black",  hex: 0x3A3A3A },
    { name: "White",  hex: 0xF6F6F6 }
  ],

  // ---- Shapes (Shape Sky zone) ---------------------------------------------
  shapes: [
    { name: "Circle",    sides: 32 },
    { name: "Square",    sides: 4  },
    { name: "Triangle",  sides: 3  },
    { name: "Star",      sides: -1 },
    { name: "Heart",     sides: -2 },
    { name: "Diamond",   sides: 4, rotate: true },
    { name: "Oval",      sides: 32, squash: true },
    { name: "Pentagon",  sides: 5  },
    { name: "Hexagon",   sides: 6  },
    { name: "Rectangle", sides: 4, wide: true }
  ],

  // ---- Animals (Animal Friends zone) --------------------------------------
  animals: [
    { name: "Lion",     color: 0xE0A030, sound: "roar" },
    { name: "Elephant", color: 0x9FA8B0, sound: "trumpet" },
    { name: "Tiger",    color: 0xE48A2B, sound: "growl" },
    { name: "Rabbit",   color: 0xF0E6DA, sound: "hop" },
    { name: "Cat",      color: 0xE8B84B, sound: "meow" },
    { name: "Dog",      color: 0xC98A4B, sound: "woof" },
    { name: "Monkey",   color: 0x9A6E4E, sound: "cheer" },
    { name: "Panda",    color: 0xF5F5F5, sound: "snuggle" },
    { name: "Giraffe",  color: 0xFFD57F, sound: "hum" },
    { name: "Zebra",    color: 0xF2F2F2, sound: "neigh" }
  ],

  // ---- Fruits (Fruit Orchard zone) ----------------------------------------
  fruits: [
    { name: "Apple",      color: 0xE8453B, colorName: "Red",    letter: "A" },
    { name: "Banana",     color: 0xFFE156, colorName: "Yellow", letter: "B" },
    { name: "Orange",     color: 0xFF9F1C, colorName: "Orange", letter: "O" },
    { name: "Mango",      color: 0xFFB347, colorName: "Orange", letter: "M" },
    { name: "Strawberry", color: 0xFF4D6D, colorName: "Red",    letter: "S" },
    { name: "Grapes",     color: 0x9B5DE5, colorName: "Purple", letter: "G" },
    { name: "Watermelon", color: 0x4CD97B, colorName: "Green",  letter: "W" },
    { name: "Pineapple",  color: 0xF9C74F, colorName: "Yellow", letter: "P" }
  ],

  // ---- Ocean Animals (Ocean Play zone) -------------------------------------
  oceanAnimals: [
    { name: "Whale",    color: 0x7FB6FF, sound: "swish" },
    { name: "Dolphin",  color: 0x4D96FF, sound: "squeak" },
    { name: "Shark",    color: 0x9CA3AF, sound: "chomp" },
    { name: "Turtle",   color: 0x6BCB77, sound: "glub" },
    { name: "Octopus",  color: 0xFF8FC7, sound: "bubble" },
    { name: "Seahorse", color: 0xFFD93D, sound: "tap" }
  ],

  // ---- Birds (Bird Nest zone) ----------------------------------------------
  birds: [
    { name: "Parrot", color: 0x6BCB77, sound: "tweet" },
    { name: "Swan",   color: 0xF8F8F8, sound: "hiss" },
    { name: "Owl",    color: 0x9A7D5C, sound: "hoot" },
    { name: "Robin",  color: 0xFF8FC7, sound: "chirp" },
    { name: "Eagle",  color: 0x7D6BFF, sound: "soar" },
    { name: "Penguin",color: 0x3A3A3A, sound: "waddle" }
  ],

  // ---- Vehicles (Vehicle Valley zone) --------------------------------------
  vehicles: [
    { name: "Car",   color: 0xE84545, sound: "beep" },
    { name: "Bus",   color: 0xFFD93D, sound: "honk" },
    { name: "Boat",  color: 0x4D96FF, sound: "splash" },
    { name: "Plane", color: 0xF6F6F6, sound: "zoom" },
    { name: "Train", color: 0x6BCB77, sound: "chug" },
    { name: "Rocket", color: 0xA66DD4, sound: "blast" }
  ],

  // ---- Musical Instruments (Music Park zone) ------------------------------
  instruments: [
    { name: "Drum",    color: 0xE84545, sound: "boom" },
    { name: "Guitar",  color: 0x4D96FF, sound: "strum" },
    { name: "Piano",   color: 0xFFD93D, sound: "ding" },
    { name: "Violin",  color: 0x6BCB77, sound: "violin" },
    { name: "Xylophone", color: 0xFF8FC7, sound: "sparkle" },
    { name: "Trumpet", color: 0xA66DD4, sound: "toot" }
  ],

  // ---- Numbers 1-20 (Star Sky counting zone) ------------------------------
  numbers: Array.from({ length: 20 }, (_, i) => ({ value: i + 1 })),

  // ---- Alphabet A-Z, each paired with a friendly word ---------------------
  alphabet: [
    { letter: "A", word: "Apple" },   { letter: "B", word: "Ball" },
    { letter: "C", word: "Cat" },     { letter: "D", word: "Dog" },
    { letter: "E", word: "Elephant" },{ letter: "F", word: "Fish" },
    { letter: "G", word: "Grape" },   { letter: "H", word: "Hat" },
    { letter: "I", word: "Ice cream" },{ letter: "J", word: "Jam" },
    { letter: "K", word: "Kite" },    { letter: "L", word: "Lion" },
    { letter: "M", word: "Moon" },    { letter: "N", word: "Nest" },
    { letter: "O", word: "Orange" },  { letter: "P", word: "Panda" },
    { letter: "Q", word: "Queen" },   { letter: "R", word: "Rainbow" },
    { letter: "S", word: "Sun" },     { letter: "T", word: "Tree" },
    { letter: "U", word: "Umbrella" },{ letter: "V", word: "Van" },
    { letter: "W", word: "Whale" },   { letter: "X", word: "Xylophone" },
    { letter: "Y", word: "Yoyo" },    { letter: "Z", word: "Zebra" }
  ],

  // ---- Encouragement lines spoken/shown after any interaction -------------
  encouragements: [
    "Great job!", "Amazing!", "Well done!", "Keep exploring!",
    "Wonderful!", "You did it!", "Super!", "Fantastic!", "Yay!"
  ],

  // ---- Musical notes for musical objects (frequencies in Hz) --------------
  notes: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]
};
