import { supabase, isSupabaseConfigured } from './supabase';
import { AccessibilitySettings } from '../types';

export class PreferencesService {
  /**
   * Fetch preferences for a user
   */
  public async getPreferences(userId: string): Promise<AccessibilitySettings | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        soundEnabled: data.sound_enabled ?? true,
        musicVolume: typeof data.music_volume === 'number' ? Number(data.music_volume) : 0.7,
        sfxVolume: typeof data.sfx_volume === 'number' ? Number(data.sfx_volume) : 0.8,
        narrationEnabled: data.narration_enabled ?? true,
        reducedMotion: data.reduced_motion ?? false,
        highContrast: data.high_contrast ?? false,
        dyslexicFont: data.dyslexic_font ?? false,
        largeText: data.large_text ?? false,
        largeHitTargets: data.large_hit_targets ?? false
      };
    } catch (err) {
      console.warn('Error fetching preferences from Supabase:', err);
      return null;
    }
  }

  /**
   * Save preferences to Supabase
   */
  public async savePreferences(userId: string, prefs: AccessibilitySettings): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      return false;
    }

    try {
      const payload = {
        user_id: userId,
        sound_enabled: prefs.soundEnabled,
        music_volume: prefs.musicVolume,
        sfx_volume: prefs.sfxVolume,
        narration_enabled: prefs.narrationEnabled,
        reduced_motion: prefs.reducedMotion,
        high_contrast: prefs.highContrast,
        dyslexic_font: prefs.dyslexicFont,
        large_text: prefs.largeText,
        large_hit_targets: prefs.largeHitTargets,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_preferences')
        .upsert(payload);

      if (error) {
        console.warn('Error saving preferences:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.warn('Exception saving preferences:', err);
      return false;
    }
  }
}

export const preferencesService = new PreferencesService();
