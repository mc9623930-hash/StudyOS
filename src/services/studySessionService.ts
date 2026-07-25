/* ==========================================================================
   StudyOS — Focus Timer & Study Session Logs Service
   ========================================================================== */

import { supabase } from '../../js/supabase.js';
import { StudySession, CreateStudySessionDTO } from '../types/database';

export class StudySessionService {
  static async getSessions(userId: string): Promise<StudySession[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching study sessions:', error.message);
      return [];
    }
    return data || [];
  }

  static async logSession(userId: string, dto: CreateStudySessionDTO): Promise<StudySession | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
