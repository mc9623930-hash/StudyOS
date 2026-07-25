-- ==========================================================================
-- StudyOS — Idempotent Production Supabase Database Schema & RLS Policies
-- Target Scale: 100,000+ Active Students
-- Script Version: 2.1.0 (Fully Idempotent & Re-runnable)
-- ==========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================================================
-- 1. UTILITY FUNCTIONS & TRIGGERS
-- ==========================================================================

-- Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================================
-- 2. ENTITY TABLES & TRIGGERS
-- ==========================================================================

-- 2.1 PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  grade TEXT DEFAULT 'Class 12 • PCM',
  target_exam TEXT DEFAULT 'JEE Main / CBSE Boards',
  daily_goal_hours NUMERIC(4, 2) DEFAULT 6.00,
  school_hours TEXT DEFAULT '08:00 AM - 02:00 PM',
  coaching_hours TEXT DEFAULT '03:30 PM - 05:30 PM',
  theme_preference TEXT DEFAULT 'cyberpunk',
  sound_enabled BOOLEAN DEFAULT true,
  onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 2.2 SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  instructor TEXT,
  target_score INTEGER DEFAULT 90,
  current_avg INTEGER DEFAULT 80,
  color_code TEXT DEFAULT '#2563eb',
  is_weak BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS tr_subjects_updated_at ON public.subjects;
CREATE TRIGGER tr_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 2.3 CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  chapter_number INTEGER DEFAULT 1,
  difficulty_rating INTEGER DEFAULT 3 CHECK (difficulty_rating BETWEEN 1 AND 5),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
  estimated_hours NUMERIC(4, 2) DEFAULT 4.00,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS tr_chapters_updated_at ON public.chapters;
CREATE TRIGGER tr_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 2.4 TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subject_name TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_mins INTEGER DEFAULT 45,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS tr_tasks_updated_at ON public.tasks;
CREATE TRIGGER tr_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 2.5 STUDY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  duration_mins INTEGER NOT NULL CHECK (duration_mins > 0),
  mode TEXT DEFAULT 'pomodoro' CHECK (mode IN ('pomodoro', 'short_break', 'long_break', 'free_flow')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.6 MARKS TABLE
CREATE TABLE IF NOT EXISTS public.marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_name TEXT NOT NULL,
  scored_marks NUMERIC(6, 2) NOT NULL,
  total_marks NUMERIC(6, 2) NOT NULL CHECK (total_marks > 0),
  percentage NUMERIC(5, 2) GENERATED ALWAYS AS ((scored_marks / total_marks) * 100) STORED,
  exam_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.7 CALENDAR EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT DEFAULT 'study_block' CHECK (event_type IN ('study_block', 'exam', 'class', 'coaching', 'milestone')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  color_code TEXT DEFAULT '#2563eb',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.8 REVISION SCHEDULE TABLE
CREATE TABLE IF NOT EXISTS public.revision_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  deck_name TEXT NOT NULL,
  repetition_stage INTEGER DEFAULT 1,
  interval_days INTEGER DEFAULT 1,
  ease_factor NUMERIC(4, 2) DEFAULT 2.50,
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS tr_revision_schedule_updated_at ON public.revision_schedule;
CREATE TRIGGER tr_revision_schedule_updated_at
  BEFORE UPDATE ON public.revision_schedule
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 2.9 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'reminder' CHECK (type IN ('reminder', 'achievement', 'ai_insight', 'warning')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.10 AI PLANS TABLE
CREATE TABLE IF NOT EXISTS public.ai_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  strategy_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- 3. INDEXES FOR PERFORMANCE & HIGH CONCURRENCY
-- ==========================================================================

CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects (user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_user_subject ON public.chapters (user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status_due ON public.tasks (user_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_created ON public.study_sessions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marks_user_subject ON public.marks (user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_calendar_user_start ON public.calendar_events (user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_revision_user_next_review ON public.revision_schedule (user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_ai_plans_user_active ON public.ai_plans (user_id, is_active);

-- ==========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES ON ALL TABLES
-- ==========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Subjects full policy" ON public.subjects;
DROP POLICY IF EXISTS "Chapters full policy" ON public.chapters;
DROP POLICY IF EXISTS "Tasks full policy" ON public.tasks;
DROP POLICY IF EXISTS "Study Sessions full policy" ON public.study_sessions;
DROP POLICY IF EXISTS "Marks full policy" ON public.marks;
DROP POLICY IF EXISTS "Calendar Events full policy" ON public.calendar_events;
DROP POLICY IF EXISTS "Revision Schedule full policy" ON public.revision_schedule;
DROP POLICY IF EXISTS "Notifications full policy" ON public.notifications;
DROP POLICY IF EXISTS "AI Plans full policy" ON public.ai_plans;

-- Create Policies
CREATE POLICY "Profiles select policy" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles update policy" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Subjects full policy" ON public.subjects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Chapters full policy" ON public.chapters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Tasks full policy" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Study Sessions full policy" ON public.study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Marks full policy" ON public.marks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Calendar Events full policy" ON public.calendar_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Revision Schedule full policy" ON public.revision_schedule FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Notifications full policy" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "AI Plans full policy" ON public.ai_plans FOR ALL USING (auth.uid() = user_id);

-- ==========================================================================
-- 5. AUTOMATED USER REGISTRATION TRIGGER
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, onboarded)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
