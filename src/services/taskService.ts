/* ==========================================================================
   StudyOS — Tasks Service
   ========================================================================== */

import { supabase } from '../../js/supabase.js';
import { Task, CreateTaskDTO } from '../types/database';

export class TaskService {
  static async getTasks(userId: string): Promise<Task[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error.message);
      return [];
    }
    return data || [];
  }

  static async createTask(userId: string, dto: CreateTaskDTO): Promise<Task | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async toggleTaskCompleted(taskId: string, completed: boolean): Promise<Task | null> {
    if (!supabase) return null;
    const updates = {
      status: completed ? 'completed' : 'todo',
      completed_at: completed ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTask(taskId: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
  }
}
