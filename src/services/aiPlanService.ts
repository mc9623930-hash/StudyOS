/* ==========================================================================
   StudyOS — AI Generated Study Plans Service
   ========================================================================== */

import { supabase } from '../../js/supabase.js';
import { AIPlan, CreateAIPlanDTO } from '../types/database';

export class AIPlanService {
  static async getActivePlans(userId: string): Promise<AIPlan[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('ai_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  }

  static async savePlan(userId: string, dto: CreateAIPlanDTO): Promise<AIPlan | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('ai_plans')
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
