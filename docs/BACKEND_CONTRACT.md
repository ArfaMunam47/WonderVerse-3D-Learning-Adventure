# Wonder Meadow — Backend API & Service Contract

**Document Version:** 1.0.0  
**Status:** FROZEN  
**Target Platform:** Web / PWA / Google Play Store (Android TWA / Capacitor)

---

## 1. Architecture Overview

Wonder Meadow operates on a dual-layer resilient backend architecture:
1. **Cloud Production Layer (Supabase)**: Provides production authentication, PostgreSQL with Row-Level Security (RLS), and real-time synchronization.
2. **Local / Development Fallback Layer (Express + JSON / Memory)**: Provides zero-config local operation, offline resilience, and secure proxying for server-side AI generation (Gemini API).

---

## 2. API Endpoints Specification

### 2.1 Health Check
- **Path:** `GET /api/health`
- **Auth Required:** No
- **Rate Limit:** None
- **Response `200 OK`:**
  ```json
  {
    "status": "healthy",
    "service": "wonder-meadow-backend",
    "timestamp": "2026-08-31T10:45:00.000Z",
    "version": "1.0.0"
  }
  ```

---

### 2.2 Authentication Endpoints

#### `POST /api/auth/signup`
- **Auth Required:** No
- **Rate Limit:** 10 requests per 15 minutes per IP
- **Request Body:**
  | Field | Type | Required | Constraints |
  | :--- | :--- | :--- | :--- |
  | `email` | `string` | Yes | Valid email format, max 255 chars, lowercased |
  | `password` | `string` | Yes | Min 8 chars, max 128 chars |
  | `childName` | `string` | No | Max 50 chars, sanitized, default: "Explorer" |
  | `avatar` | `string` | No | Valid emoji/avatar string, max 10 chars |
  | `gender` | `string` | No | `'boy'` \| `'girl'`, default: `'girl'` |
  | `characterId`| `string` | No | Max 50 chars, default: `'curious_explorer'` |
  | `role` | `string` | No | Locked to `'parent'` for self-registration |

- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "token": "<JWT_OR_SECURE_TOKEN>",
    "user": {
      "id": "usr_uuid",
      "email": "parent@example.com",
      "childName": "Oliver",
      "avatar": "👧",
      "gender": "girl"
    },
    "profile": { ... },
    "progress": { ... },
    "preferences": { ... }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{ "success": false, "error": "Password must be at least 8 characters long." }`
  - `409 Conflict`: `{ "success": false, "error": "An account with this email already exists." }`
  - `429 Too Many Requests`: `{ "success": false, "error": "Too many requests. Please try again later." }`

#### `POST /api/auth/login`
- **Auth Required:** No
- **Rate Limit:** 10 requests per 15 minutes per IP
- **Request Body:**
  | Field | Type | Required | Constraints |
  | :--- | :--- | :--- | :--- |
  | `email` | `string` | Yes | Valid email format, max 255 chars |
  | `password` | `string` | Yes | Min 1 char, max 128 chars |

- **Response `200 OK`:** Same structure as Sign Up response.
- **Error Responses:**
  - `401 Unauthorized`: `{ "success": false, "error": "Incorrect email or password." }` (Generic, timing-safe message)

#### `GET /api/auth/me`
- **Auth Required:** Yes (`Bearer <token>`)
- **Rate Limit:** None (Standard authenticated access)
- **Response `200 OK`:** Full user profile, progress, and preferences.
- **Error Responses:**
  - `401 Unauthorized`: `{ "success": false, "error": "Unauthorized" }`

#### `POST /api/auth/logout`
- **Auth Required:** Yes
- **Response `200 OK`:** `{ "success": true, "message": "Logged out successfully" }`

---

### 2.3 User Data & Progress Endpoints

#### `PUT /api/user/profile`
- **Auth Required:** Yes
- **Request Body:**
  | Field | Type | Constraints |
  | :--- | :--- | :--- |
  | `childName` | `string` | Max 50 chars, sanitized |
  | `avatar` | `string` | Max 10 chars |
  | `gender` | `string` | `'boy'` \| `'girl'` |
  | `characterId` | `string` | Max 50 chars |
  | `bio` | `string` | Max 500 chars |
  | `favoriteZone` | `string` | Valid zone key |

- **Security Constraint:** The `role` field cannot be modified via this endpoint (privilege escalation defense).
- **Response `200 OK`:** `{ "success": true, "profile": { ... } }`

#### `PUT /api/user/progress`
- **Auth Required:** Yes
- **Request Body:**
  | Field | Type | Constraints |
  | :--- | :--- | :--- |
  | `stars` | `number` | Bounded: `0 <= stars <= 100,000` |
  | `completedActivities` | `string[]` | Max 500 items, string elements |
  | `discoveredItems` | `string[]` | Max 500 items, string elements |
  | `stickersUnlocked` | `string[]` | Max 500 items, string elements |
  | `zoneVisits` | `object` | Key-value visit counters |
  | `favoriteZone` | `string` | Zone identifier |

- **Response `200 OK`:** `{ "success": true, "progress": { ... } }`

#### `PUT /api/user/preferences`
- **Auth Required:** Yes
- **Request Body:**
  | Field | Type | Constraints |
  | :--- | :--- | :--- |
  | `soundEnabled` | `boolean` | Boolean |
  | `musicVolume` | `number` | Clamped: `0.0 <= val <= 1.0` |
  | `sfxVolume` | `number` | Clamped: `0.0 <= val <= 1.0` |
  | `narrationEnabled`| `boolean` | Boolean |
  | `reducedMotion` | `boolean` | Boolean |
  | `highContrast` | `boolean` | Boolean |
  | `dyslexicFont` | `boolean` | Boolean |
  | `largeText` | `boolean` | Boolean |
  | `largeHitTargets` | `boolean` | Boolean |

- **Response `200 OK`:** `{ "success": true, "preferences": { ... } }`

---

### 2.4 Server-Side AI Generation Endpoints (Gemini API)

#### `POST /api/story/generate`
- **Auth Required:** Optional / Session-based
- **Rate Limit:** 15 requests per minute per IP
- **Request Body:**
  ```json
  {
    "topic": "gentle animals",
    "characterName": "Maya",
    "ageGroup": "3-5"
  }
  ```
- **Security Rule:** Server-side proxy keeps `GEMINI_API_KEY` hidden from browser. If AI API is unavailable, server falls back to high-quality static educational story templates.

#### `POST /api/music/generate`
- **Auth Required:** Optional / Session-based
- **Rate Limit:** 15 requests per minute per IP
- **Request Body:**
  ```json
  {
    "theme": "alphabet",
    "type": "lullaby",
    "instrument": "harp"
  }
  ```

---

## 3. Frontend Service Layer Contract

Frontend components must NEVER call `fetch('/api/...')` directly. All data access MUST route through the dedicated typed service modules in `src/services/` and `src/utils/api.ts`:

- `authService`: Handles session lifecycle, login, signup, token storage, and auth state change subscriptions.
- `profileService`: Manages child profile attributes and avatar configurations.
- `progressService`: Manages learning stars, completed activities, and sticker unlocks.
- `preferencesService`: Manages accessibility flags (contrast, audio levels, font modes, reduced motion).
- `api`: High-level facade combining authentication, user data synchronization, and server-side AI content requests.
