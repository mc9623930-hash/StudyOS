-- ==========================================================================
-- StudyOS — Supabase Database Schema & Security Policies
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==========================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT DEFAULT 'Student',
  grade TEXT DEFAULT 'Class 12 • PCM',
  target_exam TEXT DEFAULT 'JEE Main / Advanced 2026',
  daily_goal_hours NUMERIC DEFAULT 6,
  theme_preference TEXT DEFAULT 'dark',
  onboarded BOOLEAN DEFAULT false
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium',
  due_date TEXT,
  estimated_mins INTEGER DEFAULT 45,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

-- 3. Subjects & Marks Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL,
  code TEXT,
  target_score INTEGER DEFAULT 95,
  current_score INTEGER DEFAULT 85,
  color TEXT DEFAULT '#2563eb',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subjects" ON public.subjects
  FOR ALL USING (auth.uid() = user_id);

-- 4. Focus Timer Logs Table
CREATE TABLE IF NOT EXISTS public.timer_logs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  subject TEXT NOT NULL,
  duration_mins INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  mode TEXT DEFAULT 'pomodoro'
);

ALTER TABLE public.timer_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own timer logs" ON public.timer_logs
  FOR ALL USING (auth.uid() = user_id);

-- 5. Automatically create Profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, grade, onboarded)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'Student'), 'Class 12 • PCM', false)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
