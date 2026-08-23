import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile } from '../utils/api';
import { CharacterGender, ExplorerCharacterId } from '../types';

export class ProfileService {
  /**
   * Fetch profile for a given user ID from Supabase
   */
  public async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        userId: data.id,
        childName: data.child_name || 'Explorer',
        avatar: data.avatar || '👧',
        gender: (data.gender as CharacterGender) || 'girl',
        characterId: data.character_id || 'curious_explorer',
        role: data.role || 'parent',
        bio: data.bio || '',
        favoriteZone: data.favorite_zone || 'alphabet',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (err) {
      console.warn('Error fetching profile from Supabase:', err);
      return null;
    }
  }

  /**
   * Update profile for the authenticated user
   */
  public async updateProfile(userId: string, updates: {
    childName?: string;
    avatar?: string;
    gender?: CharacterGender;
    characterId?: ExplorerCharacterId;
    bio?: string;
    favoriteZone?: string | null;
    role?: 'parent' | 'child';
  }): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Database service not configured' };
    }

    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (updates.childName !== undefined) payload.child_name = updates.childName.trim();
      if (updates.avatar !== undefined) payload.avatar = updates.avatar;
      if (updates.gender !== undefined) payload.gender = updates.gender;
      if (updates.characterId !== undefined) payload.character_id = updates.characterId;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.favoriteZone !== undefined) payload.favorite_zone = updates.favoriteZone;
      if (updates.role !== undefined) payload.role = updates.role;

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.warn('Error updating Supabase profile:', error);
        return { success: false, error: 'Could not update profile.' };
      }

      const updatedProfile: UserProfile = {
        userId: data.id,
        childName: data.child_name || 'Explorer',
        avatar: data.avatar || '👧',
        gender: (data.gender as CharacterGender) || 'girl',
        characterId: data.character_id || 'curious_explorer',
        role: data.role || 'parent',
        bio: data.bio || '',
        favoriteZone: data.favorite_zone || 'alphabet',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { success: true, profile: updatedProfile };
    } catch (err: any) {
      console.warn('Exception updating profile:', err);
      return { success: false, error: 'Network error updating profile' };
    }
  }

  /**
   * Ensure profile exists (upsert fallback if trigger did not run)
   */
  public async ensureProfile(userId: string, initialData: {
    email?: string;
    childName?: string;
    avatar?: string;
    gender?: CharacterGender;
    characterId?: ExplorerCharacterId;
    role?: 'parent' | 'child';
  }): Promise<UserProfile | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    try {
      // Check existing
      const existing = await this.getProfile(userId);
      if (existing) return existing;

      const now = new Date().toISOString();
      const insertData = {
        id: userId,
        email: initialData.email || null,
        child_name: initialData.childName || 'Explorer',
        avatar: initialData.avatar || '👧',
        gender: initialData.gender || 'girl',
        character_id: initialData.characterId || 'curious_explorer',
        role: initialData.role || 'parent',
        favorite_zone: 'alphabet',
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(insertData)
        .select()
        .single();

      if (error || !data) {
        return null;
      }

      return {
        userId: data.id,
        childName: data.child_name,
        avatar: data.avatar,
        gender: data.gender,
        characterId: data.character_id,
        role: data.role,
        bio: data.bio || '',
        favoriteZone: data.favorite_zone,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (err) {
      console.warn('Error ensuring profile exists:', err);
      return null;
    }
  }
}

export const profileService = new ProfileService();
