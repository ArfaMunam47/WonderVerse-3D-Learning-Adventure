import { UserProgress, AccessibilitySettings, StoryItem, NurserySong, CharacterGender, ExplorerCharacterId } from '../types';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { progressService } from '../services/progressService';
import { preferencesService } from '../services/preferencesService';
import { isSupabaseConfigured } from '../services/supabase';

const TOKEN_KEY = 'wonder_meadow_auth_token';

export interface AuthUser {
  id: string;
  email: string;
  childName: string;
  avatar: string;
  gender: CharacterGender;
}

export interface UserProfile {
  userId: string;
  childName: string;
  avatar: string;
  gender: CharacterGender;
  characterId?: string;
  role?: 'parent' | 'child' | 'admin';
  bio?: string;
  favoriteZone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  profile?: UserProfile;
  progress?: UserProgress;
  preferences?: AccessibilitySettings;
  error?: string;
}

class ApiService {
  private token: string | null = null;
  private currentUserId: string | null = null;

  constructor() {
    try {
      this.token = localStorage.getItem(TOKEN_KEY);
    } catch {
      this.token = null;
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(token: string | null) {
    this.token = token;
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // Storage fallback
    }
  }

  public setCurrentUserId(userId: string | null) {
    this.currentUserId = userId;
  }

  public getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // 1. Sign Up / Create Parent & Explorer Profile
  public async signup(params: {
    email: string;
    password: string;
    childName: string;
    avatar: string;
    gender?: CharacterGender;
    characterId?: ExplorerCharacterId;
    role?: 'parent' | 'child';
  }): Promise<AuthResponse> {
    const res = await authService.signUp(params);
    if (res.success && res.token) {
      this.setToken(res.token);
      if (res.user?.id) this.setCurrentUserId(res.user.id);
    }
    return res;
  }

  // 2. Login / Sign In
  public async login(params: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await authService.signIn(params);
    if (res.success && res.token) {
      this.setToken(res.token);
      if (res.user?.id) this.setCurrentUserId(res.user.id);
    }
    return res;
  }

  // 3. Logout
  public async logout(): Promise<boolean> {
    try {
      await authService.signOut();
    } finally {
      this.setToken(null);
      this.setCurrentUserId(null);
    }
    return true;
  }

  // 4. Fetch Current Authenticated Session
  public async getMe(): Promise<AuthResponse> {
    const res = await authService.getSession();
    if (res.success && res.user?.id) {
      this.setCurrentUserId(res.user.id);
      if (res.token) this.setToken(res.token);
    }
    return res;
  }

  // 5. Update Profile
  public async updateProfile(params: {
    childName?: string;
    avatar?: string;
    gender?: CharacterGender;
    characterId?: ExplorerCharacterId;
    role?: 'parent' | 'child';
    bio?: string;
    favoriteZone?: string | null;
  }): Promise<{ success: boolean; profile?: UserProfile; user?: AuthUser; error?: string }> {
    if (isSupabaseConfigured() && this.currentUserId) {
      const res = await profileService.updateProfile(this.currentUserId, params);
      if (res.success && res.profile) {
        return {
          success: true,
          profile: res.profile,
          user: {
            id: res.profile.userId,
            email: '',
            childName: res.profile.childName,
            avatar: res.profile.avatar,
            gender: res.profile.gender
          }
        };
      }
      return { success: false, error: res.error || 'Could not update profile' };
    }

    // Backend fallback
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Network error updating profile' };
    }
  }

  // 6. Sync Learning Progress
  public async syncProgress(progress: UserProgress): Promise<{ success: boolean; progress?: UserProgress }> {
    if (isSupabaseConfigured() && this.currentUserId) {
      return await progressService.saveProgress(this.currentUserId, progress);
    }

    try {
      const res = await fetch('/api/user/progress', {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(progress)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  }

  // 7. Save Preferences
  public async savePreferences(preferences: AccessibilitySettings): Promise<{ success: boolean }> {
    if (isSupabaseConfigured() && this.currentUserId) {
      const success = await preferencesService.savePreferences(this.currentUserId, preferences);
      return { success };
    }

    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(preferences)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  }

  // 8. Generate Educational Story with Gemini (Backend API route)
  public async generateStory(params: {
    topic?: string;
    characterName?: string;
    ageGroup?: string;
  }): Promise<{ success: boolean; story?: StoryItem; error?: string }> {
    try {
      const res = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Could not generate story' };
    }
  }

  // 9. Generate Song / Rhyme with Gemini (Backend API route)
  public async generateMusic(params: {
    theme?: string;
    type?: string;
    instrument?: string;
  }): Promise<{ success: boolean; song?: NurserySong; error?: string }> {
    try {
      const res = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Could not generate music' };
    }
  }
}

export const api = new ApiService();
