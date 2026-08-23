import { supabase, isSupabaseConfigured } from './supabase';
import { UserProgress } from '../types';

export class ProgressService {
  /**
   * Fetch game progress for a user
   */
  public async getProgress(userId: string): Promise<UserProgress | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        stars: typeof data.stars === 'number' ? data.stars : 0,
        completedActivities: Array.isArray(data.completed_activities) ? data.completed_activities : [],
        discoveredItems: Array.isArray(data.discovered_items) ? data.discovered_items : [],
        stickersUnlocked: Array.isArray(data.stickers_unlocked) ? data.stickers_unlocked : [],
        zoneVisits: (typeof data.zone_visits === 'object' && data.zone_visits !== null) ? data.zone_visits : {
          alphabet: 0,
          numbers: 0,
          fruits: 0,
          animals: 0,
          creative: 0,
          music: 0,
          stories: 0,
          stars: 0
        },
        favoriteZone: data.favorite_zone || 'alphabet',
        lastPlayed: data.last_played || new Date().toISOString()
      };
    } catch (err) {
      console.warn('Error fetching progress from Supabase:', err);
      return null;
    }
  }

  /**
   * Sync and save progress to Supabase
   */
  public async saveProgress(userId: string, progress: UserProgress): Promise<{ success: boolean; progress?: UserProgress }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false };
    }

    try {
      const payload = {
        user_id: userId,
        stars: progress.stars,
        completed_activities: progress.completedActivities,
        discovered_items: progress.discoveredItems,
        stickers_unlocked: progress.stickersUnlocked,
        zone_visits: progress.zoneVisits,
        favorite_zone: progress.favoriteZone,
        last_played: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('game_progress')
        .upsert(payload)
        .select()
        .single();

      if (error || !data) {
        console.warn('Error saving progress to Supabase:', error);
        return { success: false };
      }

      return {
        success: true,
        progress: {
          stars: data.stars,
          completedActivities: data.completed_activities,
          discoveredItems: data.discovered_items,
          stickersUnlocked: data.stickers_unlocked,
          zoneVisits: data.zone_visits,
          favoriteZone: data.favorite_zone,
          lastPlayed: data.last_played
        }
      };
    } catch (err) {
      console.warn('Exception saving progress:', err);
      return { success: false };
    }
  }

  /**
   * Reset user progress to clean baseline
   */
  public async resetProgress(userId: string): Promise<UserProgress | null> {
    const fresh: UserProgress = {
      stars: 0,
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
      lastPlayed: new Date().toISOString()
    };

    const res = await this.saveProgress(userId, fresh);
    return res.success ? (res.progress || fresh) : fresh;
  }
}

export const progressService = new ProgressService();
