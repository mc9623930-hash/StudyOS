/* ==========================================================================
   StudyOS — Revision Schedule & Active Recall Service
   ========================================================================== */

import { supabase } from '../../js/supabase.js';
import { RevisionItem, CreateRevisionItemDTO } from '../types/database';

export class RevisionService {
  static async getDueRevisions(userId: string): Promise<RevisionItem[]> {
    if (!supabase) return [];
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('revision_schedule')
      .select('*')
      .eq('user_id', userId)
      .lte('next_review_at', nowIso)
      .order('next_review_at', { ascending: true });

    if (error) return [];
    return data || [];
  }

  static async logReviewPerformance(
    revisionId: string, 
    qualityRating: number // 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
  ): Promise<RevisionItem | null> {
    if (!supabase) return null;
    
    // Simple Spaced Repetition calculation (SuperMemo 2 variant)
    const nextIntervalDays = qualityRating >= 3 ? Math.round(qualityRating * 2.5) : 1;
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextIntervalDays);

    const { data, error } = await supabase
      .from('revision_schedule')
      .update({
        interval_days: nextIntervalDays,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: nextReviewDate.toISOString()
      })
      .eq('id', revisionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
