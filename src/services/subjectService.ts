/* ==========================================================================
   StudyOS — Subjects & Chapters Service
   ========================================================================== */

import { supabase } from '../../js/supabase.js';
import { Subject, CreateSubjectDTO, Chapter, CreateChapterDTO } from '../types/database';

export class SubjectService {
  static async getSubjects(userId: string): Promise<Subject[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching subjects:', error.message);
      return [];
    }
    return data || [];
  }

  static async createSubject(userId: string, dto: CreateSubjectDTO): Promise<Subject | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('subjects')
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSubject(subjectId: string, updates: Partial<CreateSubjectDTO>): Promise<Subject | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', subjectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteSubject(subjectId: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
    if (error) throw error;
  }

  // Chapters CRUD
  static async getChapters(userId: string, subjectId?: string): Promise<Chapter[]> {
    if (!supabase) return [];
    let query = supabase.from('chapters').select('*').eq('user_id', userId);
    if (subjectId) query = query.eq('subject_id', subjectId);
    
    const { data, error } = await query.order('chapter_number', { ascending: true });
    if (error) return [];
    return data || [];
  }

  static async createChapter(userId: string, dto: CreateChapterDTO): Promise<Chapter | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('chapters')
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
