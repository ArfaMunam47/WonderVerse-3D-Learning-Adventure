import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Enforce request body size limits to prevent Denial of Service (DoS) payload attacks
app.use(express.json({ limit: '100kb' }));

// ----------------------------------------------------
// HTTP SECURITY HEADERS MIDDLEWARE (OWASP Compliant)
// ----------------------------------------------------
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com; object-src 'none'; base-uri 'self'; form-action 'self';"
  );
  next();
});

// ----------------------------------------------------
// RATE LIMITING ENGINE (In-Memory Sliding Window)
// ----------------------------------------------------
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimitStore = new Map<string, RateLimitRecord>();

function rateLimiter(windowMs: number, maxRequests: number, actionName: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const key = `${actionName}:${clientIp}`;
    const now = Date.now();

    const record = rateLimitStore.get(key) || { timestamps: [] };
    // Prune expired timestamps
    record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.'
      });
    }

    record.timestamps.push(now);
    rateLimitStore.set(key, record);
    next();
  };
}

// Clean up stale rate limiter records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter(ts => now - ts < 600000);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

// ----------------------------------------------------
// DATABASE & PERSISTENCE ENGINE (Atomic File Store)
// ----------------------------------------------------
const DB_FILE = path.join(process.cwd(), 'meadow_database.json');

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  salt?: string;
  childName: string;
  avatar: string;
  gender: 'boy' | 'girl';
  createdAt: string;
  updatedAt: string;
}

interface ProfileRecord {
  userId: string;
  childName: string;
  avatar: string;
  gender: 'boy' | 'girl';
  characterId?: string;
  role?: 'parent' | 'child' | 'admin';
  bio?: string;
  favoriteZone?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProgressRecord {
  userId: string;
  stars: number;
  completedActivities: string[];
  discoveredItems: string[];
  stickersUnlocked: string[];
  zoneVisits: Record<string, number>;
  favoriteZone: string | null;
  lastPlayed: string;
}

interface PreferencesRecord {
  userId: string;
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

interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  profiles: ProfileRecord[];
  progress: ProgressRecord[];
  preferences: PreferencesRecord[];
  sessions: SessionRecord[];
}

const defaultDb: DatabaseSchema = {
  users: [],
  profiles: [],
  progress: [],
  preferences: [],
  sessions: []
};

function readDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Database read notice:', err);
  }
  return { ...defaultDb };
}

function writeDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database write notice:', err);
  }
}

// ----------------------------------------------------
// CRYPTOGRAPHIC UTILITIES (Hardened scrypt password hashing)
// ----------------------------------------------------
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function verifyPassword(password: string, user: UserRecord): boolean {
  if (user.salt) {
    const computed = hashPassword(password, user.salt);
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(user.passwordHash, 'hex'));
  }
  // Legacy fallback migration
  const legacyHash = crypto.createHash('sha256').update(password + '_wonder_salt_meadow').digest('hex');
  return crypto.timingSafeEqual(Buffer.from(legacyHash), Buffer.from(user.passwordHash));
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Input sanitizer for strings (removes control chars and script tags)
function sanitizeText(input: unknown, maxLen = 100): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLen);
}

const VALID_ZONES = new Set(['alphabet', 'numbers', 'fruits', 'animals', 'creative', 'music', 'stories', 'stars']);

// ----------------------------------------------------
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ----------------------------------------------------
function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const token = authHeader.substring(7);
  const db = readDb();
  const session = db.sessions.find(s => s.token === token);

  if (!session) {
    return res.status(401).json({ success: false, error: 'Invalid session' });
  }

  // Enforce session expiration check
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    // Purge expired session
    db.sessions = db.sessions.filter(s => s.token !== token);
    writeDb(db);
    return res.status(401).json({ success: false, error: 'Session expired. Please sign in again.' });
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User account not found' });
  }

  (req as any).user = user;
  (req as any).session = session;
  next();
}

// ----------------------------------------------------
// GEMINI AI CLIENT INITIALIZATION
// ----------------------------------------------------
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// 2. Auth: Register / Sign Up (Rate limited: 10 requests / 15 minutes)
app.post('/api/auth/signup', rateLimiter(15 * 60 * 1000, 10, 'auth_signup'), (req, res) => {
  try {
    const { email, password, childName, avatar, gender } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
    }

    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, error: 'Password must be between 8 and 128 characters' });
    }

    const db = readDb();

    if (db.users.some(u => u.email === cleanEmail)) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    const userId = 'usr_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    const now = new Date().toISOString();
    const validatedGender: 'boy' | 'girl' = gender === 'boy' ? 'boy' : 'girl';
    const sanitizedChildName = sanitizeText(childName, 50) || (validatedGender === 'boy' ? 'Boy Explorer' : 'Girl Explorer');
    const sanitizedAvatar = sanitizeText(avatar, 20) || (validatedGender === 'boy' ? '👦' : '👧');

    const salt = generateSalt();
    const newUser: UserRecord = {
      id: userId,
      email: cleanEmail,
      salt,
      passwordHash: hashPassword(password, salt),
      childName: sanitizedChildName,
      avatar: sanitizedAvatar,
      gender: validatedGender,
      createdAt: now,
      updatedAt: now
    };

    const newProfile: ProfileRecord = {
      userId,
      childName: sanitizedChildName,
      avatar: sanitizedAvatar,
      gender: validatedGender,
      characterId: 'curious_explorer',
      role: 'parent',
      favoriteZone: 'alphabet',
      createdAt: now,
      updatedAt: now
    };

    const newProgress: ProgressRecord = {
      userId,
      stars: 5,
      completedActivities: [],
      discoveredItems: [],
      stickersUnlocked: [],
      zoneVisits: {
        alphabet: 0,
        numbers: 0,
        fruits: 0,
        animals: 0,
        creative: 0,
        music: 0,
        stories: 0,
        stars: 0
      },
      favoriteZone: 'alphabet',
      lastPlayed: now
    };

    const newPreferences: PreferencesRecord = {
      userId,
      soundEnabled: true,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      narrationEnabled: true,
      reducedMotion: false,
      highContrast: false,
      dyslexicFont: false,
      largeText: false,
      largeHitTargets: false
    };

    const token = generateToken();
    const newSession: SessionRecord = {
      token,
      userId,
      createdAt: now,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    db.users.push(newUser);
    db.profiles.push(newProfile);
    db.progress.push(newProgress);
    db.preferences.push(newPreferences);
    db.sessions.push(newSession);

    writeDb(db);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        childName: newUser.childName,
        avatar: newUser.avatar,
        gender: newUser.gender
      },
      profile: newProfile,
      progress: newProgress,
      preferences: newPreferences
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, error: 'Could not create account safely. Please try again.' });
  }
});

// 3. Auth: Login (Rate limited: 10 requests / 15 minutes)
app.post('/api/auth/login', rateLimiter(15 * 60 * 1000, 10, 'auth_login'), (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = readDb();
    const user = db.users.find(u => u.email === cleanEmail);

    if (!user || typeof password !== 'string' || !verifyPassword(password, user)) {
      return res.status(401).json({ success: false, error: 'Incorrect email or password' });
    }

    // Upgrade legacy password hash to salted scrypt if needed
    if (!user.salt) {
      user.salt = generateSalt();
      user.passwordHash = hashPassword(password, user.salt);
    }

    const token = generateToken();
    const now = new Date().toISOString();
    const session: SessionRecord = {
      token,
      userId: user.id,
      createdAt: now,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    db.sessions.push(session);

    let profile = db.profiles.find(p => p.userId === user.id);
    if (!profile) {
      profile = {
        userId: user.id,
        childName: user.childName,
        avatar: user.avatar,
        gender: user.gender || 'girl',
        characterId: 'curious_explorer',
        role: 'parent',
        favoriteZone: 'alphabet',
        createdAt: now,
        updatedAt: now
      };
      db.profiles.push(profile);
    }

    let progress = db.progress.find(p => p.userId === user.id);
    if (!progress) {
      progress = {
        userId: user.id,
        stars: 5,
        completedActivities: [],
        discoveredItems: [],
        stickersUnlocked: [],
        zoneVisits: { alphabet: 0, numbers: 0, fruits: 0, animals: 0, creative: 0, music: 0, stories: 0, stars: 0 },
        favoriteZone: 'alphabet',
        lastPlayed: now
      };
      db.progress.push(progress);
    }

    let preferences = db.preferences.find(p => p.userId === user.id);
    if (!preferences) {
      preferences = {
        userId: user.id,
        soundEnabled: true,
        musicVolume: 0.7,
        sfxVolume: 0.8,
        narrationEnabled: true,
        reducedMotion: false,
        highContrast: false,
        dyslexicFont: false,
        largeText: false,
        largeHitTargets: false
      };
      db.preferences.push(preferences);
    }

    writeDb(db);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        childName: user.childName,
        avatar: user.avatar,
        gender: user.gender || profile.gender || 'girl'
      },
      profile,
      progress,
      preferences
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Could not log in' });
  }
});

// 4. Auth: Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const db = readDb();
    db.sessions = db.sessions.filter(s => s.token !== token);
    writeDb(db);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// 5. Auth: Get Current User Session (Me)
app.get('/api/auth/me', authenticateUser, (req, res) => {
  const user = (req as any).user as UserRecord;
  const db = readDb();

  const profile = db.profiles.find(p => p.userId === user.id) || {
    userId: user.id,
    childName: user.childName,
    avatar: user.avatar,
    gender: user.gender || 'girl',
    characterId: 'curious_explorer',
    role: 'parent',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  const progress = db.progress.find(p => p.userId === user.id) || {
    userId: user.id,
    stars: 5,
    completedActivities: [],
    discoveredItems: [],
    stickersUnlocked: [],
    zoneVisits: { alphabet: 0, numbers: 0, fruits: 0, animals: 0, creative: 0, music: 0, stories: 0, stars: 0 },
    favoriteZone: 'alphabet',
    lastPlayed: new Date().toISOString()
  };

  const preferences = db.preferences.find(p => p.userId === user.id) || {
    userId: user.id,
    soundEnabled: true,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    narrationEnabled: true,
    reducedMotion: false,
    highContrast: false,
    dyslexicFont: false,
    largeText: false,
    largeHitTargets: false
  };

  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      childName: user.childName,
      avatar: user.avatar,
      gender: user.gender || profile.gender || 'girl'
    },
    profile,
    progress,
    preferences
  });
});

// 6. User Profile Update (Strictly authorized to session owner)
app.put('/api/user/profile', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user as UserRecord;
    const { childName, avatar, bio, favoriteZone, gender, characterId } = req.body;
    const db = readDb();

    const validatedGender: ('boy' | 'girl') | undefined = gender === 'boy' ? 'boy' : gender === 'girl' ? 'girl' : undefined;
    const sanitizedName = childName !== undefined ? sanitizeText(childName, 50) : undefined;
    const sanitizedAvatar = avatar !== undefined ? sanitizeText(avatar, 20) : undefined;
    const sanitizedBio = bio !== undefined ? sanitizeText(bio, 300) : undefined;
    const sanitizedCharId = characterId !== undefined ? sanitizeText(characterId, 50) : undefined;
    const validatedZone = favoriteZone && VALID_ZONES.has(String(favoriteZone)) ? String(favoriteZone) : undefined;

    // Update user record
    const userIdx = db.users.findIndex(u => u.id === user.id);
    if (userIdx >= 0) {
      if (sanitizedName) db.users[userIdx].childName = sanitizedName;
      if (sanitizedAvatar) db.users[userIdx].avatar = sanitizedAvatar;
      if (validatedGender) db.users[userIdx].gender = validatedGender;
      db.users[userIdx].updatedAt = new Date().toISOString();
    }

    // Update profile record
    let profile = db.profiles.find(p => p.userId === user.id);
    if (!profile) {
      profile = {
        userId: user.id,
        childName: sanitizedName || user.childName,
        avatar: sanitizedAvatar || user.avatar,
        gender: validatedGender || user.gender || 'girl',
        characterId: sanitizedCharId || 'curious_explorer',
        role: 'parent',
        bio: sanitizedBio || '',
        favoriteZone: validatedZone || 'alphabet',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.profiles.push(profile);
    } else {
      if (sanitizedName) profile.childName = sanitizedName;
      if (sanitizedAvatar) profile.avatar = sanitizedAvatar;
      if (validatedGender) profile.gender = validatedGender;
      if (sanitizedCharId) profile.characterId = sanitizedCharId;
      if (sanitizedBio !== undefined) profile.bio = sanitizedBio;
      if (validatedZone !== undefined) profile.favoriteZone = validatedZone;
      profile.updatedAt = new Date().toISOString();
    }

    writeDb(db);

    return res.json({
      success: true,
      profile,
      user: {
        id: user.id,
        email: user.email,
        childName: profile.childName,
        avatar: profile.avatar,
        gender: profile.gender
      }
    });
  } catch (err: any) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update profile' });
  }
});

// 7. User Progress Sync / Save (Validation of boundaries)
app.put('/api/user/progress', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user as UserRecord;
    const { stars, completedActivities, discoveredItems, stickersUnlocked, zoneVisits, favoriteZone } = req.body;
    const db = readDb();

    let progress = db.progress.find(p => p.userId === user.id);
    const now = new Date().toISOString();

    // Validate stars boundary: 0 to 100,000 max
    const safeStars = typeof stars === 'number' && Number.isFinite(stars) && stars >= 0 && stars <= 100000 ? Math.floor(stars) : undefined;
    const safeActivities = Array.isArray(completedActivities) ? completedActivities.slice(0, 200).map(s => sanitizeText(s, 60)).filter(Boolean) : undefined;
    const safeDiscovered = Array.isArray(discoveredItems) ? discoveredItems.slice(0, 200).map(s => sanitizeText(s, 60)).filter(Boolean) : undefined;
    const safeStickers = Array.isArray(stickersUnlocked) ? stickersUnlocked.slice(0, 100).map(s => sanitizeText(s, 60)).filter(Boolean) : undefined;
    const validatedZone = favoriteZone && VALID_ZONES.has(String(favoriteZone)) ? String(favoriteZone) : undefined;

    if (!progress) {
      progress = {
        userId: user.id,
        stars: safeStars !== undefined ? safeStars : 5,
        completedActivities: safeActivities || [],
        discoveredItems: safeDiscovered || [],
        stickersUnlocked: safeStickers || [],
        zoneVisits: typeof zoneVisits === 'object' && zoneVisits !== null ? zoneVisits : {},
        favoriteZone: validatedZone || 'alphabet',
        lastPlayed: now
      };
      db.progress.push(progress);
    } else {
      if (safeStars !== undefined) progress.stars = safeStars;
      if (safeActivities !== undefined) progress.completedActivities = safeActivities;
      if (safeDiscovered !== undefined) progress.discoveredItems = safeDiscovered;
      if (safeStickers !== undefined) progress.stickersUnlocked = safeStickers;
      if (typeof zoneVisits === 'object' && zoneVisits !== null) {
        progress.zoneVisits = { ...progress.zoneVisits, ...zoneVisits };
      }
      if (validatedZone !== undefined) progress.favoriteZone = validatedZone;
      progress.lastPlayed = now;
    }

    writeDb(db);

    return res.json({
      success: true,
      progress
    });
  } catch (err: any) {
    console.error('Progress sync error:', err);
    return res.status(500).json({ success: false, error: 'Could not sync progress' });
  }
});

// 8. User Preferences Save
app.put('/api/user/preferences', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user as UserRecord;
    const body = req.body || {};
    const db = readDb();

    let preferences = db.preferences.find(p => p.userId === user.id);
    const sanitizedPrefs: PreferencesRecord = {
      userId: user.id,
      soundEnabled: typeof body.soundEnabled === 'boolean' ? body.soundEnabled : true,
      musicVolume: typeof body.musicVolume === 'number' ? Math.max(0, Math.min(1, body.musicVolume)) : 0.7,
      sfxVolume: typeof body.sfxVolume === 'number' ? Math.max(0, Math.min(1, body.sfxVolume)) : 0.8,
      narrationEnabled: typeof body.narrationEnabled === 'boolean' ? body.narrationEnabled : true,
      reducedMotion: typeof body.reducedMotion === 'boolean' ? body.reducedMotion : false,
      highContrast: typeof body.highContrast === 'boolean' ? body.highContrast : false,
      dyslexicFont: typeof body.dyslexicFont === 'boolean' ? body.dyslexicFont : false,
      largeText: typeof body.largeText === 'boolean' ? body.largeText : false,
      largeHitTargets: typeof body.largeHitTargets === 'boolean' ? body.largeHitTargets : false
    };

    if (!preferences) {
      db.preferences.push(sanitizedPrefs);
    } else {
      Object.assign(preferences, sanitizedPrefs);
    }

    writeDb(db);

    return res.json({
      success: true,
      preferences: sanitizedPrefs
    });
  } catch (err: any) {
    console.error('Preferences save error:', err);
    return res.status(500).json({ success: false, error: 'Could not save preferences' });
  }
});

// 9. API: Generate Multi-Scene Educational Story with Gemini (Rate limited: 15 requests / min)
app.post('/api/story/generate', rateLimiter(60 * 1000, 15, 'gemini_story'), async (req, res) => {
  try {
    const rawTopic = req.body.topic || 'kindness and sharing';
    const rawCharacter = req.body.characterName || 'Pippin the Bunny';
    const rawAgeGroup = req.body.ageGroup || '3-6';

    const topic = sanitizeText(rawTopic, 80);
    const characterName = sanitizeText(rawCharacter, 40);
    const ageGroup = sanitizeText(rawAgeGroup, 10);

    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        source: 'local_educational_catalog',
        story: {
          id: `story-${Date.now()}`,
          title: `The Little Adventure of ${characterName || 'Pippin'}`,
          moral: 'Being curious and gentle brings joy to friends.',
          learningObjective: 'Empathy, friendship, and positive problem-solving',
          characters: [characterName || 'Pippin', 'Oliver the Owl', 'Daphne Duck'],
          scenes: [
            {
              sceneNumber: 1,
              title: 'A Sunny Morning',
              illustration: '🌸🐰',
              narration: `${characterName || 'Pippin'} hopped into Wonder Meadow as the warm morning sun bathed the clover fields in gold.`,
              caption: 'Morning in Wonder Meadow is full of gentle breezes and singing birds.',
              environmentTag: 'meadow-morning',
              interactionPrompt: 'Tap the clover flowers to help them bloom!'
            },
            {
              sceneNumber: 2,
              title: 'The Hidden Path',
              illustration: '🌲✨',
              narration: `Near the Whispering Oak, ${characterName || 'Pippin'} spotted a tiny stone pathway with glittering colorful pebbles.`,
              caption: 'Each stone had a friendly number carved on it.',
              environmentTag: 'forest-path',
              interactionPrompt: 'Count 3 stepping stones along the trail.'
            },
            {
              sceneNumber: 3,
              title: 'Meeting a Friend',
              illustration: '🦆🌊',
              narration: `At the sparkling pond, Daphne the Duck was looking for her favorite floating water lily.`,
              caption: '"Hello friend!" Daphne quacked happily. "Would you like to explore together?"',
              environmentTag: 'sparkling-pond',
              interactionPrompt: 'Wave hello to Daphne the Duck.'
            },
            {
              sceneNumber: 4,
              title: 'A Helpful Idea',
              illustration: '🌿🤝',
              narration: `${characterName || 'Pippin'} gently guided Daphne with a leafy stick to help retrieve the golden water lily.`,
              caption: 'Working together made solving the puzzle easy and fun.',
              environmentTag: 'sparkling-pond',
              interactionPrompt: 'Tap together to celebrate teamwork!'
            },
            {
              sceneNumber: 5,
              title: 'Evening Constellation',
              illustration: '🌙⭐',
              narration: `As dusk arrived, the stars in Star Observatory began to glow, and all the meadow friends smiled with full hearts.`,
              caption: 'Friendship and kindness make every day in Wonder Meadow a wonder.',
              environmentTag: 'star-observatory',
              interactionPrompt: 'Give a big warm hug to your friends.'
            }
          ]
        }
      });
    }

    const prompt = `Create a gentle, simple, educational multi-scene children's story for early learners ages ${ageGroup}.
Topic: ${topic}
Main Character: ${characterName}

The story must have 5 to 7 distinct scenes with positive emotions, very simple vocabulary, short sentences, concrete ideas, repetition, and a clear happy resolution.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a warm early childhood educator creating stories for young children. Create content for early learners using very simple vocabulary, short sentences, concrete ideas, repetition, and clear cause-and-effect relationships. Avoid advanced vocabulary, metaphors that are difficult to understand, complex sentence structures, and unnecessary detail.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Playful and poetic story title' },
            moral: { type: Type.STRING, description: 'One-sentence moral takeaway' },
            learningObjective: { type: Type.STRING, description: 'Core early learning objective' },
            characters: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Names of characters in story'
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  illustration: { type: Type.STRING, description: '2 to 3 representative cute emojis' },
                  narration: { type: Type.STRING, description: '1-3 sentences of expressive narration for read-aloud voiceover' },
                  caption: { type: Type.STRING, description: 'Short accessible caption for screen-reading' },
                  environmentTag: { type: Type.STRING, description: 'e.g. meadow-morning, orchard-grove, starlight-sky' },
                  interactionPrompt: { type: Type.STRING, description: 'Simple physical or interactive cue for the child' }
                },
                required: ['sceneNumber', 'title', 'illustration', 'narration', 'caption']
              }
            }
          },
          required: ['title', 'moral', 'learningObjective', 'characters', 'scenes']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini-3.7-flash',
      story: {
        id: `ai-story-${Date.now()}`,
        ...parsed
      }
    });
  } catch (error: unknown) {
    console.error('Gemini Story Generation Error (Safe server log):', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to create story right now. Please try again in a moment.'
    });
  }
});

// 10. API: Generate Educational Song or Poem with Gemini (Rate limited: 15 requests / min)
app.post('/api/music/generate', rateLimiter(60 * 1000, 15, 'gemini_music'), async (req, res) => {
  try {
    const rawTheme = req.body.theme || 'nature and colors';
    const rawType = req.body.type || 'nursery_song';
    const rawInstrument = req.body.instrument || 'xylophone';

    const theme = sanitizeText(rawTheme, 80);
    const type = sanitizeText(rawType, 30);
    const instrument = sanitizeText(rawInstrument, 30);

    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        source: 'local_music_catalog',
        song: {
          id: `music-${Date.now()}`,
          title: `The Rainbow Meadow Melody`,
          type: type,
          theme: theme,
          instrumentSuggested: instrument,
          learningObjective: 'Pitch awareness, rhythm stepping, and color association',
          verses: [
            'Red and yellow, green and blue,',
            'Wonder Meadow shines for you!',
            'Listen to the chime flowers ring,',
            'Hear the happy robins sing!'
          ],
          melodyNotes: [0, 2, 4, 5, 4, 2, 0, 4, 4, 2, 2, 0],
          rhythmPattern: '1-2-1-2-1-1-2',
          visualSceneTag: 'rainbow-bells',
          tempoBpm: 90
        }
      });
    }

    const prompt = `Create a very simple, delightful nursery song or rhyming poem for early learners about ${theme}.
Instrument style: ${instrument}.
Use simple rhyming words, short lines, concrete ideas, and a cheerful 0-7 note melody index array (0=Do, 1=Re, 2=Mi, 3=Fa, 4=Sol, 5=La, 6=Ti, 7=High Do).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a warm early-childhood music teacher. Create content for early learners using very simple vocabulary, short sentences, concrete ideas, repetition, and clear rhythm. Avoid advanced vocabulary, metaphors that are difficult to understand, complex sentence structures, and unnecessary detail.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            theme: { type: Type.STRING },
            instrumentSuggested: { type: Type.STRING },
            learningObjective: { type: Type.STRING },
            verses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '4 to 6 short lines of rhyming lyrics'
            },
            melodyNotes: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: 'Array of integers from 0 to 7 representing the melody'
            },
            rhythmPattern: { type: Type.STRING },
            visualSceneTag: { type: Type.STRING, description: 'e.g. night-sky, meadow-sunshine, animal-barn' },
            tempoBpm: { type: Type.INTEGER }
          },
          required: ['title', 'verses', 'melodyNotes', 'visualSceneTag']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini-3.7-flash',
      song: {
        id: `ai-song-${Date.now()}`,
        ...parsed
      }
    });
  } catch (error: unknown) {
    console.error('Gemini Music Generation Error (Safe server log):', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to create music right now. Please try again in a moment.'
    });
  }
});

// Vite middleware for development vs Static files for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wonder Meadow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();


