import { supabase, isSupabaseConfigured, formatAuthError } from './supabase';
import { profileService } from './profileService';
import { progressService } from './progressService';
import { preferencesService } from './preferencesService';
import { AuthUser, UserProfile, AuthResponse } from '../utils/api';
import { CharacterGender, ExplorerCharacterId, UserProgress, AccessibilitySettings } from '../types';

export class AuthService {
  /**
   * Check if Supabase client is connected and active
   */
  public isConnected(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Parent/User Sign Up with email & password
   */
  public async signUp(params: {
    email: string;
    password: string;
    childName: string;
    avatar: string;
    gender?: CharacterGender;
    characterId?: ExplorerCharacterId;
    role?: 'parent' | 'child';
  }): Promise<AuthResponse> {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName = params.childName.trim() || 'Explorer';
    const chosenGender = params.gender || 'girl';
    const chosenAvatar = params.avatar || (chosenGender === 'boy' ? '👦' : '👧');
    const chosenCharacterId = params.characterId || 'curious_explorer';
    const chosenRole = params.role || 'parent';

    if (!isSupabaseConfigured() || !supabase) {
      // Direct fallback to local backend API if Supabase is not yet configured in env
      return this.fallbackBackendSignUp({
        email: cleanEmail,
        password: params.password,
        childName: cleanName,
        avatar: chosenAvatar,
        gender: chosenGender
      });
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            child_name: cleanName,
            avatar: chosenAvatar,
            gender: chosenGender,
            character_id: chosenCharacterId,
            role: chosenRole
          }
        }
      });

      if (error) {
        return {
          success: false,
          error: formatAuthError(error)
        };
      }

      const user = data.user;
      if (!user) {
        return {
          success: false,
          error: "We couldn't create your account. Please try again."
        };
      }

      // Ensure profile, progress, and preferences are created/loaded
      const profile = await profileService.ensureProfile(user.id, {
        email: user.email || cleanEmail,
        childName: cleanName,
        avatar: chosenAvatar,
        gender: chosenGender,
        characterId: chosenCharacterId,
        role: chosenRole
      });

      const progress = (await progressService.getProgress(user.id)) || {
        stars: 0,
        completedActivities: [],
        discoveredItems: [],
        stickersUnlocked: [],
        zoneVisits: { alphabet: 0, numbers: 0, fruits: 0, animals: 0, creative: 0, music: 0, stories: 0, stars: 0 },
        favoriteZone: 'alphabet',
        lastPlayed: new Date().toISOString()
      };

      const preferences = (await preferencesService.getPreferences(user.id)) || {
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

      const authUser: AuthUser = {
        id: user.id,
        email: user.email || cleanEmail,
        childName: profile?.childName || cleanName,
        avatar: profile?.avatar || chosenAvatar,
        gender: profile?.gender || chosenGender
      };

      return {
        success: true,
        token: data.session?.access_token || 'supabase_session',
        user: authUser,
        profile: profile || {
          userId: user.id,
          childName: cleanName,
          avatar: chosenAvatar,
          gender: chosenGender,
          characterId: chosenCharacterId,
          role: chosenRole,
          bio: '',
          favoriteZone: 'alphabet',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        progress,
        preferences
      };
    } catch (err: any) {
      console.warn('Sign up error:', err);
      return {
        success: false,
        error: "We couldn't connect right now. Please check your connection and try again."
      };
    }
  }

  /**
   * Parent/User Sign In with existing email & password
   */
  public async signIn(params: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const cleanEmail = params.email.trim().toLowerCase();

    if (!isSupabaseConfigured() || !supabase) {
      return this.fallbackBackendSignIn({
        email: cleanEmail,
        password: params.password
      });
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: params.password
      });

      if (error) {
        return {
          success: false,
          error: formatAuthError(error)
        };
      }

      const user = data.user;
      if (!user) {
        return {
          success: false,
          error: 'The email or password is incorrect.'
        };
      }

      // Fetch user profile from Supabase
      let profile = await profileService.getProfile(user.id);
      if (!profile) {
        // Create profile if missing
        profile = await profileService.ensureProfile(user.id, {
          email: user.email || cleanEmail,
          childName: (user.user_metadata?.child_name || user.user_metadata?.childName || 'Explorer'),
          avatar: user.user_metadata?.avatar || '👧',
          gender: user.user_metadata?.gender || 'girl',
          characterId: user.user_metadata?.character_id || 'curious_explorer',
          role: user.user_metadata?.role || 'parent'
        });
      }

      // Fetch progress and preferences
      const progress = await progressService.getProgress(user.id);
      const preferences = await preferencesService.getPreferences(user.id);

      const authUser: AuthUser = {
        id: user.id,
        email: user.email || cleanEmail,
        childName: profile?.childName || 'Explorer',
        avatar: profile?.avatar || '👧',
        gender: profile?.gender || 'girl'
      };

      return {
        success: true,
        token: data.session?.access_token || 'supabase_session',
        user: authUser,
        profile: profile || {
          userId: user.id,
          childName: authUser.childName,
          avatar: authUser.avatar,
          gender: authUser.gender,
          characterId: 'curious_explorer',
          role: 'parent',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        progress: progress || undefined,
        preferences: preferences || undefined
      };
    } catch (err: any) {
      console.warn('Sign in error:', err);
      return {
        success: false,
        error: "We couldn't connect right now. Please check your connection and try again."
      };
    }
  }

  /**
   * Log Out and clear session
   */
  public async signOut(): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error signing out from Supabase:', err);
      }
    } else {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {}
    }
    return true;
  }

  /**
   * Retrieve active authenticated session and load user profile
   */
  public async getSession(): Promise<AuthResponse> {
    if (!isSupabaseConfigured() || !supabase) {
      return this.fallbackBackendGetMe();
    }

    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !sessionData.session?.user) {
        return { success: false, error: 'No active session' };
      }

      const user = sessionData.session.user;
      let profile = await profileService.getProfile(user.id);

      if (!profile) {
        profile = await profileService.ensureProfile(user.id, {
          email: user.email,
          childName: user.user_metadata?.child_name || user.user_metadata?.childName || 'Explorer',
          avatar: user.user_metadata?.avatar || '👧',
          gender: user.user_metadata?.gender || 'girl',
          characterId: user.user_metadata?.character_id || 'curious_explorer',
          role: user.user_metadata?.role || 'parent'
        });
      }

      const progress = await progressService.getProgress(user.id);
      const preferences = await preferencesService.getPreferences(user.id);

      const authUser: AuthUser = {
        id: user.id,
        email: user.email || '',
        childName: profile?.childName || 'Explorer',
        avatar: profile?.avatar || '👧',
        gender: profile?.gender || 'girl'
      };

      return {
        success: true,
        token: sessionData.session.access_token,
        user: authUser,
        profile: profile || {
          userId: user.id,
          childName: authUser.childName,
          avatar: authUser.avatar,
          gender: authUser.gender,
          characterId: 'curious_explorer',
          role: 'parent',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        progress: progress || undefined,
        preferences: preferences || undefined
      };
    } catch (err) {
      console.warn('Session check exception:', err);
      return { success: false, error: 'Session check failed' };
    }
  }

  /**
   * Listen to auth state changes (e.g. token refresh, login, logout)
   */
  public onAuthStateChange(callback: (event: string, session: any) => void) {
    if (isSupabaseConfigured() && supabase) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
      return () => {
        data.subscription.unsubscribe();
      };
    }
    return () => {};
  }

  // --- Fallback helpers when testing before Supabase env credentials are added ---
  private async fallbackBackendSignUp(params: any): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      return data;
    } catch {
      return { success: false, error: "We couldn't connect right now. Please check your connection and try again." };
    }
  }

  private async fallbackBackendSignIn(params: any): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      return data;
    } catch {
      return { success: false, error: "We couldn't connect right now. Please check your connection and try again." };
    }
  }

  private async fallbackBackendGetMe(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('wonder_meadow_auth_token');
      if (!token) return { success: false, error: 'No active token' };
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) return { success: false, error: 'Session expired' };
      return await res.json();
    } catch {
      return { success: false, error: 'Failed to verify session' };
    }
  }
}

export const authService = new AuthService();
