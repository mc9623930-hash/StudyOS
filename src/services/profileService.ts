/* ==========================================================================
   StudyOS — Profiles Service
   ========================================================================== */

import { supabase } from '../../js/supabase.js';
import { Profile, UpdateProfileDTO } from '../types/database';

export class ProfileService {
  static async getProfile(userId: string): Promise<Profile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Error fetching profile:', error.message);
      return null;
    }
    return data;
  }

  static async updateProfile(userId: string, updates: UpdateProfileDTO): Promise<Profile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error.message);
      throw error;
    }
    return data;
  }

  static async markOnboarded(userId: string): Promise<void> {
    await this.updateProfile(userId, { onboarded: true });
  }
}
