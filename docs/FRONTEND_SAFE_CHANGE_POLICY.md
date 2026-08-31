# Wonder Meadow — Frontend Safe-Change Policy

**Target Audience:** Frontend Engineers, 3D Artists, UX Designers, UI Specialists  
**Policy Status:** ACTIVE & MANDATORY  
**Scope:** All modifications touching files inside `/src/`

---

## 1. Core Operating Principles

With the backend foundation and security baseline **FROZEN**, all subsequent development will focus exclusively on UI/UX, 3D worlds, animations, audio soundscapes, accessibility styling, and interactive children's learning experiences.

To guarantee that frontend changes never break backend contracts, database integrity, or child safety safeguards, every developer and agent MUST strictly adhere to the rules below.

---

## 2. The 5 Inviolable Rules

### Rule 1: No Direct Backend Modifications
- Under NO circumstances should UI tasks modify `server.ts`, `supabase_schema.sql`, or files in `scripts/`.
- If a UI task appears to need a backend route or database column change: **STOP IMMEDIATELY**. Formulate a proposal and follow the change checklist in `docs/CHANGE_CHECKLIST.md`.

### Rule 2: Strict Service Layer Usage
- **Forbidden:** Calling `fetch('/api/...')` directly from inside React components (e.g. `WelcomeScreen.tsx`, `MeadowWorld.tsx`, `ParentCaregiverArea.tsx`).
- **Required:** All data operations must route through the typed methods in `src/utils/api.ts` or `src/services/*`.

### Rule 3: Do Not Mutate Global Types Arbitrarily
- Shared data types in `src/types.ts` (such as `UserProgress`, `AccessibilitySettings`, `UserProfile`) match the frozen database contracts.
- You may add local component UI state types, but do NOT remove, rename, or retype existing persisted model fields without following the change approval process.

### Rule 4: Defend Sensory & Child Accessibility Defaults
- UI components must always respect user accessibility preferences (`reducedMotion`, `highContrast`, `dyslexicFont`, `largeText`, `largeHitTargets`, `soundEnabled`).
- Never hardcode unskippable strobe animations, high-frequency loud sounds, or un-dismissible full-screen modals.

### Rule 5: Keep Secrets Out of Frontend Code
- Never introduce hardcoded API keys, tokens, or credentials into frontend components or assets.
- Only use public variables exposed via `import.meta.env.VITE_*`.

---

## 3. Safe Frontend Modification Guidelines

| Feature Category | Permitted Changes | Restricted Actions |
| :--- | :--- | :--- |
| **3D World & Three.js** | Shaders, lighting, geometry, character models, particle effects, camera controls | Persisting raw 3D mesh state directly into database progress |
| **UI Components & Styling** | Tailwind classes, layouts, micro-interactions, responsive sizing, color palettes | Changing auth flow logic, bypassing parental gates |
| **Audio & SFX** | Web Audio synthesizer nodes, soothing melodies, sound triggers | Calling unauthenticated external audio endpoints |
| **Accessibility** | High-contrast themes, focus rings, ARIA tags, screen reader labels | Removing required accessibility toggles |
| **Learning Zones** | Mini-game visual puzzles, alphabet cards, interactive animal cards | Modifying scoring formulas without validating `0..100,000` boundaries |
