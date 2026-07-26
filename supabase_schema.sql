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

-- 6. User Activity & Live Presence Table
CREATE TABLE IF NOT EXISTS public.user_activity (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT DEFAULT 'Student',
  grade TEXT DEFAULT 'Class 12 • PCM',
  status TEXT DEFAULT 'online', -- 'online', 'studying', 'idle'
  current_activity TEXT DEFAULT 'Browsing Dashboard',
  active_subject TEXT,
  timer_mins_left INTEGER,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active users" ON public.user_activity
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own activity" ON public.user_activity
  FOR ALL USING (auth.uid() = user_id);

-- 7. Syllabus Tests Table
CREATE TABLE IF NOT EXISTS public.syllabus_tests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  grade TEXT NOT NULL, -- e.g. 'Class 12 • PCM', 'Class 10 Board'
  subject TEXT NOT NULL, -- e.g. 'Physics', 'Mathematics', 'Chemistry'
  chapter TEXT NOT NULL, -- e.g. 'Electrostatics', 'Calculus'
  duration_mins INTEGER DEFAULT 30,
  total_marks INTEGER DEFAULT 50,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.syllabus_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view tests" ON public.syllabus_tests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create tests" ON public.syllabus_tests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8. Test Questions Table
CREATE TABLE IF NOT EXISTS public.test_questions (
  id TEXT PRIMARY KEY,
  test_id TEXT REFERENCES public.syllabus_tests(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
  explanation TEXT,
  marks INTEGER DEFAULT 4,
  topic TEXT
);

ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view test questions" ON public.test_questions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert questions" ON public.test_questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9. User Test Results Table
CREATE TABLE IF NOT EXISTS public.user_test_results (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  test_id TEXT REFERENCES public.syllabus_tests(id) ON DELETE CASCADE NOT NULL,
  test_title TEXT NOT NULL,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  percentage NUMERIC NOT NULL,
  time_taken_mins INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test results" ON public.user_test_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test results" ON public.user_test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

