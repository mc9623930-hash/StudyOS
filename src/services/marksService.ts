/* ==========================================================================
   StudyOS — Test Marks Service
   ========================================================================== */

import { supabase } from '../../js/supabase.js';
import { Mark, CreateMarkDTO } from '../types/database';

export class MarksService {
  static async getMarks(userId: string): Promise<Mark[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('marks')
      .select('*')
      .eq('user_id', userId)
      .order('exam_date', { ascending: false });

    if (error) {
      console.error('Error fetching exam marks:', error.message);
      return [];
    }
    return data || [];
  }

  static async logExamMark(userId: string, dto: CreateMarkDTO): Promise<Mark | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('marks')
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteMark(markId: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('marks').delete().eq('id', markId);
    if (error) throw error;
  }
}
