<div align="center">
<br />

<img src="https://img.shields.io/badge/status-in%20active%20development-amber?style=for-the-badge" alt="Status: In Active Development" />
<img src="https://img.shields.io/badge/react-19-blue?style=for-the-badge&logo=react" alt="React 19" />
<img src="https://img.shields.io/badge/three.js-3D-blue?style=for-the-badge&logo=threedotjs" alt="Three.js 3D" />
<img src="https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />

<br />

# 🌱 Wonder Meadow

### A gentle 3D learning world where every child can explore, play, discover, and grow at their own pace.

**Wonder Meadow** is being built as a real, everyday learning companion for young children — from toddlers just beginning to explore to children with Down syndrome and other developmental differences who thrive when learning is visual, unhurried, and full of joy.

<br />
</div>

---

## ✨ Why Wonder Meadow Exists

Wonder Meadow was born from a simple belief: every child should have access to a learning world that meets them exactly where they are. Instead of flashy, over-stimulating apps built around speed and scores, Wonder Meadow is a **calm, open, curiosity-first environment** where children wander, tap, listen, and discover on their own terms.

It is designed for the **real learners** it is built for:

- **Toddlers** discovering their first letters, numbers, colors, and sounds
- **Early elementary children (ages 3–7)** building literacy and numeracy foundations
- **Children with Down syndrome** and other developmental differences — with oversized targets, gentle pacing, read-aloud narration, reduced-motion options, and visual clarity built into everything, including children from every background

## ⚠️ Development Status

> **Important: Wonder Meadow is still in active development.**
>
> This is a living, evolving project. Features are being added, refined, and tested with real feedback, and the app is not yet a completed consumer release. Expect ongoing improvements across gameplay, accessibility, performance, and the parent experience.

---

## 🌍 The World

Wonder Meadow is a fully interactive **3D explorable world** — a calm countryside where kids control their own explorer character, walk through sunlit meadows, interact with friendly animals, and bump into learning experiences the way you bump into a surprise in the wild: naturally.

Every corner of the world is **tappable and talkative.** Clouds drift, ducks swim in the pond, butterflies flutter between flowers, windmill blades turn lazily, and hidden stars are waiting to be found. A virtual joystick and a big-tap movement cluster make it easy for small hands — or a parent's guiding hand — to move through the world.

### Learning Zones

| Zone | What children practice |
|---|---|
| 🌱 **Alphabet Grove** | Letter names, phonics sounds, first words, alphabet order |
| 🔢 **Number Valley** | Numbers 1-20, counting objects, number matching, simple addition |
| 🍎 **Fruit Orchard** | Fruit names, colors, shapes, matching pairs, sorting |
| 🐾 **Animal Woods** | Animal names, real sounds, habitats, empathy & care |
| 🎨 **Creative Corner** | Drawing, color mixing, stickers, open-ended creativity |
| 🎵 **Music Garden** | Nursery songs, rhythm games, rainbow xylophone, bell chimes |
| 📚 **Story Pavilion** | Illustrated read-aloud stories with gentleness, morals & voiceover |
| ⭐ **Star Observatory** | Feelings & emotions, calm breathing, celebrating earned badges |

---

## ♿ Accessibility Is the Foundation — Not an Add-On

Wonder Meadow is being built so that **every child can play**. Accessibility features are a core part of the product — not a menu bolted on afterwards:

- **Voice Read-Aloud Narration** — Every letter, number, word, and story page can speak out loud with a warm, slow, friendly voice
- **Musical Chime Feedback** — Soft synthesized pops, sparkles, and bell tones celebrate progress without jarring sounds
- **Reduced Motion Mode** — Smooths camera movements and quiets rapid animations for sensitive eyes
- **High Contrast Visuals** — Bold borders and maximum contrast for clear, calm reading
- **Dyslexia-friendly & Large Text** — Clear, spaced typography tuned for early and developing readers
- **Large Touch Targets** — Generous tap areas made for little fingers
- **Gentle Speed** — Slow, comfortable pacing with repetition, short sentences, and concrete ideas
- **Calm recovery with structured independence** — Children are shown step-by-step *how* to do things (with adult help when needed), solving quietly builds confidence

### Explorer Companions

Children choose a friendly explorer companion to play beside them — from cozy Pip and tinkerer Milo to the fawn Bramble and star-sprite Nova. More companions are **earned by collecting Wonder Stars**, giving children a reason to explore and a gentle sense of growing achievement.

---

## 🎁 Rewards & Growing Together

- **Wonder Stars** — Earned for every discovery, completed activity, and solved obstacle
- **Certificates of Discovery** — Parents & caregivers can generate a beautiful printable certificate celebrating earned stars
- **Explorer Friend unlocks** — Special companions unlock as children earn more stars
- **Zone visit history & progress tracking** — See what your child is exploring and building toward
- **Parent / Caregiver Dashboard** — A protected (adult-verification-gated) area with:
  - A curriculum map explaining what each zone teaches
  - Learning-skill breakdowns (letters, counting, colors, shapes, nature)
  - Kid-safe profile & avatar setup
  - Slow, step-by-step accessibility blending toggles
  - A safe one-tap "Reset Progress"

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | **React 19**, **TypeScript**, **Vite 6**, **Tailwind CSS 4** |
| 3D World | **Three.js** with a fully built meadow scene, interactive targets, animation system & procedural cartoonyized 3D characters |
| Audio | **Web Audio API** synthesizer (zero external audio assets) + **Speech Synthesis** narration |
| Animation | **Motion (Framer Motion)** for smooth UI transitions |
| Celebrations | **canvas-confetti** |
| Backend | **Express** (TypeScript) |
| AI | **Google Generative AI (Gemini)** for story & song generation with kid-appropriate structured output |
| Database | **Atomic local file store** for dev & previews, **Supabase** (Postgres + Row Level Security) for production — with a hardened schema (`supabase_schema.sql`) |
| Icons | **Lucide React** |
| Deployment | **Netlify** (SPA fallback, security headers) |

---

## 🚀 Getting Started

Wonder Meadow is a web app built with modern tooling.

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (20+ recommended)
- npm

### Clone & Run Locally

```bash
git clone https://github.com/ArfaMunam47/WonderVerse-3D-Learning-Adventure.git
cd wonder-meadow
npm install
npm run dev
```

The app should open in your default browser on the local development origin (`http://localhost:3000`).

### Production Build

```bash
npm run build
npm start         # runs the built server on production assets
```

### Available Package Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the full-stack dev server with Vite integration (TSX) |
| `npm run build` | Builds the frontend + bundles the backend (esbuild) |
| `npm start` | Runs the compiled production server |
| `npm run lint` | Type-checks the entire codebase with TypeScript |
| `npm run clean` | Removes build artifacts |

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for the on-demand story/song generation feature |
| `VITE_SUPABASE_URL` | Supabase project URL (for production auth + sync) |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |

> **Versatile by design:** The app works fully **out-of-the-box without any keys configured** — it uses a safe local storage store plus the built-in educational catalog for stories and songs. Add the keys whenever you're ready to go cloud.

---

## 🗂️ Project Structure

```
wonder-meadow/
├── server.ts                # Express + Vite + Gemini + local storage backend
├── supabase_schema.sql      # Production Supabase schema with hardened Row Level Security
├── netlify.toml             # Netlify build, SPA fallback & security headers
├── src/
│   ├── App.tsx              # Core app shell, state, modals, zone loading
│   ├── types.ts             # Shared domain types (zones, progress, a11y, characters)
│   ├── data/                # Learning content (zones, letters, numbers, animals, stories, songs)
│   ├── components/
│   │   ├── 3d/              # Three.js world canvas, joystick, world builder
│   │   ├── zones/           # Per-zone interactive learning activities
│   │   ├── accessibility/   # Accessibility & comfort menu
│   │   ├── auth/            # Parent sign-up / sign-in modal
│   │   ├── welcome/         # Welcome & character selection screens
│   │   ├── navigation/      # TopNav, world map, rewards, learn modal
│   │   ├── parent/          # Parent & caregiver dashboard
│   │   └── profile/         # Child passport / profile modal
│   ├── services/            # Supabase auth, profile, progress, preferences
│   └── utils/
│       ├── api.ts           # Typed client for backend + Supabase
│       └── audio.ts         # Zero-asset Web Audio synthesizer & speech
```

---

## 🧩 Educational Content

The app ships with a carefully curated learning catalog, **hand-tuned for gentle, consistent, growth-friendly pacing**:

- **26 alphabet stations** with phonics, friendly words, and playful images
- **Numbers 1–20** with one-to-one counting objects
- **20 fruits** with colors and shapes in bright, familiar hues
- **22 friendly animals** with sounds and fun facts across farm, forest, jungle & water
- **6 classic nursery songs, poems, and rhythm games**
- **4+ multi-scene read-aloud stories** (kindness, courage, self-confidence, starlight) 
- **8 feelings/emotions** with kindness coaching phrases & gentle breathing tips
- **7 starter explorers plus a secret future companion**, each with an original 3D cartoon body

Plus the **AI Story / Music Generation endpoints** allow new, on-theme stories and simple songs to be created instantly with Gemini in a controlled, child-appropriate structured output format.

---

## 🔒 Safety & Respect for Kids

- **Zero ads, zero in-app purchases, zero external trackers**
- **Adult-gated parent dashboard** (simple math challenge required)
- **Hardened backend** — Supabase Row Level Security, curated / hardened permissions, privilege-escalation protection trigger
- **Strict Content-Security-Policy** headers on deployment for attack surface reduction
- **Age-appropriate, positive, intentionally kind** stories and messages — emphasizing kindness, gentle exploration, and self-worth in every experience

---

## 🤝 Contributing

Wonder Meadow is early in its journey, and contributions are welcome as the project evolves and matures. If you would like to contribute — whether that's content translation, new learning zones, accessibility improvements, or general engineering — please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-idea`)
3. Commit with a clear, kind message
4. Open a pull request

Before opening a pull request for any visual or content change, consider whether it aligns with the **accessibility-first, gentle** principles of the product.

---

## 📄 License

Private development project © 2026 Wonder Meadow. All rights reserved. Not currently open source — please reach out about their use first.

---

<div align="center">
  <sub>Built with 💛 for every explorer — the calm, the curious, the wiggly, and the wonderful.</sub>
</div>