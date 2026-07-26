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

/**
 * User Activity & Presence Sync Methods
 */
export async function saveUserActivityToSupabase(userId, activityData) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('user_activity').upsert({
      user_id: userId,
      user_name: activityData.name || 'Student',
      grade: activityData.grade || 'Class 12 • PCM',
      status: activityData.status || 'online',
      current_activity: activityData.currentActivity || 'Browsing Dashboard',
      active_subject: activityData.activeSubject || null,
      timer_mins_left: activityData.timerMinsLeft || 0,
      last_seen: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not update user activity to Supabase:', err);
  }
}

export async function fetchActiveUsersFromSupabase() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .order('last_seen', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Could not fetch active users from Supabase:', err);
    return [];
  }
}

/**
 * Syllabus Test Methods
 */
export async function saveSyllabusTestToSupabase(test, questions) {
  if (!supabase) return null;
  try {
    const testId = test.id || `test_${Date.now()}`;
    const { data: testRes, error: testErr } = await supabase
      .from('syllabus_tests')
      .insert({
        id: testId,
        title: test.title,
        description: test.description || '',
        grade: test.grade,
        subject: test.subject,
        chapter: test.chapter,
        duration_mins: test.durationMins || 30,
        total_marks: test.totalMarks || 50,
        created_by: test.createdBy || null
      })
      .select()
      .single();

    if (testErr) throw testErr;

    if (questions && questions.length > 0) {
      const qRows = questions.map((q, idx) => ({
        id: `q_${testId}_${idx + 1}`,
        test_id: testId,
        question_text: q.questionText,
        option_a: q.optionA,
        option_b: q.optionB,
        option_c: q.optionC,
        option_d: q.optionD,
        correct_option: q.correctOption,
        explanation: q.explanation || '',
        marks: q.marks || 4,
        topic: q.topic || test.chapter
      }));

      const { error: qErr } = await supabase.from('test_questions').insert(qRows);
      if (qErr) console.warn('Could not insert test questions:', qErr);
    }

    return testRes;
  } catch (err) {
    console.error('Error saving syllabus test:', err);
    return null;
  }
}

export async function fetchSyllabusTestsFromSupabase() {
  if (!supabase) return [];
  try {
    const { data: tests, error: testErr } = await supabase
      .from('syllabus_tests')
      .select('*')
      .order('created_at', { ascending: false });
    if (testErr) throw testErr;

    const { data: questions, error: qErr } = await supabase
      .from('test_questions')
      .select('*');
    if (qErr) throw qErr;

    return (tests || []).map(t => ({
      ...t,
      questions: (questions || []).filter(q => q.test_id === t.id)
    }));
  } catch (err) {
    console.warn('Could not fetch syllabus tests from Supabase:', err);
    return [];
  }
}

export async function saveTestResultToSupabase(userId, result) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('user_test_results').insert({
      id: `result_${Date.now()}`,
      user_id: userId,
      test_id: result.testId,
      test_title: result.testTitle,
      subject: result.subject,
      score: result.score,
      total_marks: result.totalMarks,
      percentage: result.percentage,
      time_taken_mins: result.timeTakenMins || 0
    });
  } catch (err) {
    console.warn('Could not save test result to Supabase:', err);
  }
}

export async function fetchUserTestResultsFromSupabase(userId) {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('user_test_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Could not fetch test results from Supabase:', err);
    return [];
  }
}

