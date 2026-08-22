<div align="center">

# 🌼 Wonder Meadow

### A magical, calming 3D learning world for early learners — explore, discover, and learn through play.

<p align="center">
  <strong>Built with 🧡 using Three.js, Node.js & Vanilla JavaScript</strong>
</p>

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-2.0.0-brightgreen)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Three.js](https://img.shields.io/badge/Three.js-3D-black)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Zero-Dependency](https://img.shields.io/badge/Zero—Dependency-Server-success)
![Accessible](https://img.shields.io/badge/Accessible-Yes-brightgreen)
![Responsive](https://img.shields.io/badge/Responsive-Yes-success)

</div>

---

## 🌟 About

**Wonder Meadow** is a **3D educational world** designed for young children, with a special focus on **sensory-friendly, pressure-free learning**. Instead of quizzes and timers, children explore whimsical 3D zones — popping bubbles, tapping flowers, meeting animal friends, and learning the alphabet — all with gentle voice narration, playful sounds, and sparkly rewards.

Every interaction earns **stars, coins, and badges**. There is **no wrong answer and no way to lose** — only more to discover. Progress is saved locally in the browser, and optional **child learner profiles** can be created on the server for persistent, per-child progress tracking and learning analytics.

---

## 🎮 Features

### 🗺️ Eight Explore Zones

| Zone | What You Learn |
|------|----------------|
| 🫧 **Bubble Pond** | Cause & effect, bubbles |
| 🎈 **Balloon Meadow** | Balloons, colors |
| 🌸 **Flower Garden** | Colors (10 colors) |
| ⭐ **Star Meadow** | Numbers 1–20 |
| 🍎 **Fruit Orchard** | Fruits & vegetables |
| 🐾 **Animal Friends** | 8 animals with sounds |
| 🔤 **Alphabet Grove** | Letters A–Z with words |
| 🔷 **Shape Sky** | 10 shapes |

### 🧩 Learning Games

- **🔗 Matching Game** — tap a picture, then tap its matching name
- **🃏 Memory Game** — flip two cards to find a pair

### 🏆 Rewards & Progress

- ⭐ Stars for every unique discovery
- 🪙 Coin rewards with animated HUD feedback
- 🎖️ Badge system — 9 achievements that unlock as children explore
- 📈 Progress panel showing letter/animal/fruit/shape/number mastery
- 💾 **Local Storage** save system
- 👤 **Optional server-side learner profiles** with persistent progress, session logs, and learning analytics

### 🎵 Audio & Voice

- 🔊 Procedural sound effects (Web Audio API — no audio files needed)
- 🎼 Ambient background music
- 🗣️ Speech synthesis with **spoken word captions** (caption bubble)
- 🎤 Friendly encouragement spoken after interactions

### ♿ Accessibility & Settings

A full settings panel makes the world adaptable to each child's needs:

- 🎚️ Music volume slider
- 🔊 SFX volume slider
- 🗣️ Spoken words on/off toggle
- 🐢 Animation speed slider (0.5×–1.5×)
- 🌗 **High Contrast Mode**
- 🎨 **Color-Blind Friendly Mode**
- 🧘 **Reduced Motion Mode**

### ✨ Premium Visual Polish

- 🌌 Animated shader-line background canvas
- 🪄 Magic sparkle cursor with trail (desktop)
- 💥 Confetti particle bursts on rewards
- 🔦 Interactive spotlight hover effects
- 🎴 Card flip / shine effects on game tiles

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|----------|
| Node.js (built-in `http`) | Static file + REST API server (zero-dependency) |
| HTML5 & CSS3 | Structure & styling (rounded, storybook feel) |
| Vanilla JavaScript (ES6+) | Game logic, 3D scene, UI, audio, speech |
| Three.js (r128) | 3D rendering, WebGL scene, OrbitControls camera |
| Web Audio API | Procedural sound effects & music |
| Web Speech API | Spoken words, captions & encouragement |
| Local Storage | Progress & settings persistence (offline save) |
| JSON file store (`data/db.json`) | Server-side learner profiles, progress, analytics |

---

## 📂 Project Structure

```text
wonder-meadow/
│
├── server.js                 # Node.js HTTP server + REST API (zero-dependency)
├── package.json
│
├── data/
│   └── db.json               # Auto-created JSON store (profiles, progress, sessions)
│
└── public/
    ├── index.html            # Single-page app (menus, screens, game canvas)
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── data.js           # Learning content (colors, shapes, animals, fruits…)
    │   ├── audio.js          # Web Audio engine — SFX, music, speech
    │   ├── particles.js      # Confetti / sparkle particle system
    │   ├── objects.js        # 3D object builders (flowers, animals, letters…)
    │   ├── world.js          # Zone / world construction
    │   ├── game.js           # App class — render loop, input, rewards, achievements
    │   ├── ui.js             # Menus, screens, HUD, badges, games hub
    │   ├── shader-bg.js      # Premium animated shader background
    │   ├── spotlight.js      # Interactive spotlight hover effects
    │   ├── card-effects.js   # Card flip / shine effects
    │   ├── cursor.js         # Magic sparkle cursor
    │   └── ...
    └── assets/
        └── favicons / icons
```

---

---

## 🔌 REST API

The server exposes a small JSON API for **child learner profiles**, **progress tracking**, and **learning analytics**.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profiles` | List all learner profiles |
| `POST` | `/api/profiles` | Create a profile `{ name, age?, avatar? }` |
| `GET` | `/api/profiles/:id` | Get one profile |
| `PUT` | `/api/profiles/:id` | Update a profile |
| `DELETE` | `/api/profiles/:id` | Delete a profile |
| `GET` | `/api/progress/:id` | Get progress for a profile |
| `POST` | `/api/progress/:id` | Merge incremental progress (unions arrays, sums counters) |
| `GET` | `/api/analytics/:id` | Learning analytics: favorite zone, time per zone, milestones, suggested focus |

**Progress model** tracks:
- `unlockedLetters` — letters learned
- `masteredAnimals` — animals mastered
- `completedQuizzes` — quizzes completed
- `stars`, `coins` — reward currencies
- `achievements` — unlocked badges
- `totalPlaySeconds` + `zoneTimeSeconds` — engagement analytics
- `sessions` — rolling session log (capped at 500 entries)

Data is stored as a pretty-printed JSON file at `data/db.json` (auto-created on first run). The `db.*` repository layer is the only code that touches storage, so swapping in SQLite/Postgres later requires no route changes.

---

## 🕹️ How to Play

1. Tap **▶ Play** to enter the 3D world — or **↻ Continue** to resume a saved game.
2. **Tap or click** anything you see — flowers, animals, stars, balloons, and more. Every tap earns sparkles, sounds, and a friendly voice.
3. **Drag** gently to look around the world (OrbitControls — right click/zoom to move closer or further).
4. Use the **🗺️ map button** to travel to a new zone (smooth animated camera flight).
5. Tap **🧩 Learning Games** in the main menu to play the **Matching** or **Memory** games.
6. Track badges in **🏆 My Progress** — 9 achievements to unlock!
7. Tap **⏸️** any time to pause, open settings, or return to the main menu.

---

## 🏆 Achievements

| Badge | How to Earn |
|-------|-------------|
| 🏅 First Discovery | Make your first interaction |
| 🎨 Color Explorer | Tap every color flower in the Flower Garden |
| ⭐ Shape Star | Tap every shape in Shape Sky |
| 🐾 Animal Friend | Tap every animal in Animal Friends |
| 🍎 Orchard Hero | Tap every fruit in the Fruit Orchard |
| 🔤 Alphabet Champion | Tap every letter in the Alphabet Grove |
| 🔢 Counting Star | Tap every number in Star Meadow |
| 🧭 Curious Explorer | Reach 50 total interactions |
| 🌟 Master Explorer | Reach 200 total interactions |

---

## 🎯 Design Philosophy

Wonder Meadow is built around one core idea: **learning should never feel like a test.**

- **No timers, no scores, no losing.** Every interaction is a reward.
- **Positive reinforcement only** — gentle encouraging voice messages ("Great job!", "Wonderful!").
- **Calm, rounded, low-contrast-friendly visuals** with optional High Contrast and Color-Blind modes.
- **Reduce Motion mode** halves animation speed and minimizes motion for sensory-sensitive children.
- **Tap = discover** — simple enough for a 3-year-old, delightful enough to keep exploring.

---

## 🧭 Roadmap

- 🚗 Vehicle Valley zone
- 🐠 Ocean Animals zone
- 🦖 Dinosaurs zone
- 🎼 Musical Instruments
- 🏅 Learning Levels
- 🤖 Adaptive difficulty / personalized learning
- 👨‍👩‍👧 Parent dashboard with analytics charts
- 🌙 Day & Night cycle

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve Wonder Meadow:

1. **Fork** the repository
2. Create a feature branch:

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit** your changes:

   ```bash
   git commit -m "Add amazing feature"
   ```

4. **Push** the branch:

   ```bash
   git push origin feature/YourFeature
   ```

5. Open a **Pull Request**

### Adding new learning content

All learning content lives in **`public/js/data.js`** as plain arrays — adding a new fruit, animal, shape, or letter requires no changes to the 3D or UI code. Just add an entry:

```js
animals: [
  { name: "Dog", color: 0xC98A4B, sound: "woof" },
  // … add your new animal here
]
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

**Made with 🧡 for curious little minds.**

</div>
