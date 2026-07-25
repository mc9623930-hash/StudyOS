/* ==========================================================================
   StudyOS — Supabase Client & Data Synchronization Engine
   ========================================================================== */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nhmlyouabybvsxewvfzs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export let supabase = null;

if (supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key_here') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Supabase Auth Methods
 */
export async function signUpUser(email, password, name) {
  if (!supabase) return { error: { message: 'Supabase client not initialized' } };
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });
}

export async function signInUser(email, password) {
  if (!supabase) return { error: { message: 'Supabase client not initialized' } };
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOutUser() {
  if (!supabase) return;
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Data Sync Methods with Supabase Tables
 */
export async function loadUserDataFromSupabase(userId) {
  if (!supabase || !userId) return null;

  try {
    const [profileRes, tasksRes, subjectsRes, timerRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('subjects').select('*').eq('user_id', userId),
      supabase.from('timer_logs').select('*').eq('user_id', userId)
    ]);

    return {
      profile: profileRes.data || null,
      tasks: tasksRes.data || null,
      subjects: subjectsRes.data || null,
      timerLogs: timerRes.data || null
    };
  } catch (err) {
    console.error('Error fetching Supabase user data:', err);
    return null;
  }
}

export async function saveProfileToSupabase(userId, profile) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      name: profile.name,
      grade: profile.grade,
      target_exam: profile.targetExam,
      daily_goal_hours: profile.dailyGoalHours,
      onboarded: profile.onboarded,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not save profile to Supabase:', err);
  }
}

export async function saveTaskToSupabase(userId, task) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('tasks').upsert({
      id: task.id || `task_${Date.now()}`,
      user_id: userId,
      title: task.title,
      subject: task.subject,
      priority: task.priority || 'Medium',
      due_date: task.dueDate || null,
      estimated_mins: task.estimatedMins || 45,
      completed: task.completed || false
    });
  } catch (err) {
    console.warn('Could not save task to Supabase:', err);
  }
}

export async function saveTimerLogToSupabase(userId, log) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('timer_logs').upsert({
      id: log.id || `log_${Date.now()}`,
      user_id: userId,
      subject: log.subject,
      duration_mins: log.durationMins || log.duration,
      mode: log.mode || 'pomodoro',
      completed_at: log.completedAt || new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not save timer log to Supabase:', err);
  }
}
