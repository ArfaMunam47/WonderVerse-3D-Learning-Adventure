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

app.use(express.json());

// ----------------------------------------------------
// DATABASE & PERSISTENCE ENGINE (Atomic File Store)
// ----------------------------------------------------
const DB_FILE = path.join(process.cwd(), 'meadow_database.json');

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
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

// Initial DB template
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
    console.error('Error reading database file, using default:', err);
  }
  return { ...defaultDb };
}

function writeDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_wonder_salt_meadow').digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware: Authenticate Session Token
function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const token = authHeader.substring(7);
  const db = readDb();
  const session = db.sessions.find(s => s.token === token);

  if (!session) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session' });
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  (req as any).user = user;
  (req as any).session = session;
  next();
}

// ----------------------------------------------------
// GEMINI AI INTEGRATION
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

// 2. Auth: Register / Sign Up
app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password, childName = 'Explorer', avatar = '👧', gender = 'girl' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = readDb();

    if (db.users.some(u => u.email === cleanEmail)) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const now = new Date().toISOString();
    const validatedGender: 'boy' | 'girl' = gender === 'boy' ? 'boy' : 'girl';
    const chosenAvatar = avatar || (validatedGender === 'boy' ? '👦' : '👧');

    const newUser: UserRecord = {
      id: userId,
      email: cleanEmail,
      passwordHash: hashPassword(password),
      childName: String(childName).trim() || (validatedGender === 'boy' ? 'Boy Explorer' : 'Girl Explorer'),
      avatar: chosenAvatar,
      gender: validatedGender,
      createdAt: now,
      updatedAt: now
    };

    const newProfile: ProfileRecord = {
      userId,
      childName: newUser.childName,
      avatar: newUser.avatar,
      gender: validatedGender,
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
    return res.status(500).json({ success: false, error: 'Could not create account' });
  }
});

// 3. Auth: Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = readDb();
    const user = db.users.find(u => u.email === cleanEmail);

    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ success: false, error: 'Incorrect email or password' });
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
        favoriteZone: null,
        createdAt: now,
        updatedAt: now
      };
      db.profiles.push(profile);
    } else if (!profile.gender) {
      profile.gender = user.gender || 'girl';
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
        favoriteZone: null,
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
    favoriteZone: null,
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

// 6. User Profile Update
app.put('/api/user/profile', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user as UserRecord;
    const { childName, avatar, bio, favoriteZone, gender } = req.body;
    const db = readDb();

    const validatedGender: ('boy' | 'girl') | undefined = gender === 'boy' ? 'boy' : gender === 'girl' ? 'girl' : undefined;

    // Update user record
    const userIdx = db.users.findIndex(u => u.id === user.id);
    if (userIdx >= 0) {
      if (childName) db.users[userIdx].childName = String(childName).trim();
      if (avatar) db.users[userIdx].avatar = avatar;
      if (validatedGender) db.users[userIdx].gender = validatedGender;
      db.users[userIdx].updatedAt = new Date().toISOString();
    }

    // Update profile record
    let profile = db.profiles.find(p => p.userId === user.id);
    if (!profile) {
      profile = {
        userId: user.id,
        childName: childName || user.childName,
        avatar: avatar || user.avatar,
        gender: validatedGender || user.gender || 'girl',
        bio: bio || '',
        favoriteZone: favoriteZone || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.profiles.push(profile);
    } else {
      if (childName) profile.childName = String(childName).trim();
      if (avatar) profile.avatar = avatar;
      if (validatedGender) profile.gender = validatedGender;
      if (bio !== undefined) profile.bio = bio;
      if (favoriteZone !== undefined) profile.favoriteZone = favoriteZone;
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

// 7. User Progress Sync / Save
app.put('/api/user/progress', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user as UserRecord;
    const { stars, completedActivities, discoveredItems, stickersUnlocked, zoneVisits, favoriteZone } = req.body;
    const db = readDb();

    let progress = db.progress.find(p => p.userId === user.id);
    const now = new Date().toISOString();

    if (!progress) {
      progress = {
        userId: user.id,
        stars: typeof stars === 'number' ? stars : 5,
        completedActivities: completedActivities || [],
        discoveredItems: discoveredItems || [],
        stickersUnlocked: stickersUnlocked || [],
        zoneVisits: zoneVisits || {},
        favoriteZone: favoriteZone || null,
        lastPlayed: now
      };
      db.progress.push(progress);
    } else {
      if (typeof stars === 'number') progress.stars = stars;
      if (Array.isArray(completedActivities)) progress.completedActivities = completedActivities;
      if (Array.isArray(discoveredItems)) progress.discoveredItems = discoveredItems;
      if (Array.isArray(stickersUnlocked)) progress.stickersUnlocked = stickersUnlocked;
      if (zoneVisits) progress.zoneVisits = { ...progress.zoneVisits, ...zoneVisits };
      if (favoriteZone !== undefined) progress.favoriteZone = favoriteZone;
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
    const preferencesData = req.body;
    const db = readDb();

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
        largeHitTargets: false,
        ...preferencesData
      };
      db.preferences.push(preferences);
    } else {
      Object.assign(preferences, preferencesData);
    }

    writeDb(db);

    return res.json({
      success: true,
      preferences
    });
  } catch (err: any) {
    console.error('Preferences save error:', err);
    return res.status(500).json({ success: false, error: 'Could not save preferences' });
  }
});

// 9. API: Generate Multi-Scene Educational Story with Gemini
app.post('/api/story/generate', async (req, res) => {
  try {
    const { topic = 'kindness and sharing', characterName = 'Pippin the Bunny', ageGroup = '3-6' } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Return structured fallback story if no API key is set
      return res.json({
        success: true,
        source: 'local_educational_catalog',
        story: {
          id: `story-${Date.now()}`,
          title: `The Little Adventure of ${characterName}`,
          moral: 'Being curious and gentle brings joy to friends.',
          learningObjective: 'Empathy, friendship, and positive problem-solving',
          characters: [characterName, 'Oliver the Owl', 'Daphne Duck'],
          scenes: [
            {
              sceneNumber: 1,
              title: 'A Sunny Morning',
              illustration: '🌸🐰',
              narration: `${characterName} hopped into Wonder Meadow as the warm morning sun bathed the clover fields in gold.`,
              caption: 'Morning in Wonder Meadow is full of gentle breezes and singing birds.',
              environmentTag: 'meadow-morning',
              interactionPrompt: 'Tap the clover flowers to help them bloom!'
            },
            {
              sceneNumber: 2,
              title: 'The Hidden Path',
              illustration: '🌲✨',
              narration: `Near the Whispering Oak, ${characterName} spotted a tiny stone pathway with glittering colorful pebbles.`,
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
              narration: `${characterName} gently guided Daphne with a leafy stick to help retrieve the golden water lily.`,
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
    console.error('Gemini Story Generation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Story generation error';
    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// 10. API: Generate Educational Song or Poem with Gemini
app.post('/api/music/generate', async (req, res) => {
  try {
    const { theme = 'nature and colors', type = 'nursery_song', instrument = 'xylophone' } = req.body;
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
    console.error('Gemini Music Generation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Music generation error';
    return res.status(500).json({
      success: false,
      error: errorMessage
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

