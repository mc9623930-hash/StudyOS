/* ==========================================================================
   StudyOS — TypeScript Database Models & Service DTOs
   ========================================================================== */

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  grade: string;
  target_exam: string;
  daily_goal_hours: number;
  school_hours: string;
  coaching_hours: string;
  theme_preference: string;
  sound_enabled: boolean;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export type UpdateProfileDTO = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  code?: string;
  instructor?: string;
  target_score: number;
  current_avg: number;
  color_code: string;
  is_weak: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateSubjectDTO = Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export interface Chapter {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  chapter_number: number;
  difficulty_rating: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  estimated_hours: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export type CreateChapterDTO = Omit<Chapter, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export interface Task {
  id: string;
  user_id: string;
  subject_id?: string;
  chapter_id?: string;
  title: string;
  subject_name?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'completed';
  due_date?: string;
  estimated_mins: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export type CreateTaskDTO = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export interface StudySession {
  id: string;
  user_id: string;
  subject_id?: string;
  task_id?: string;
  duration_mins: number;
  mode: 'pomodoro' | 'short_break' | 'long_break' | 'free_flow';
  notes?: string;
  created_at: string;
}

export type CreateStudySessionDTO = Omit<StudySession, 'id' | 'user_id' | 'created_at'>;

export interface Mark {
  id: string;
  user_id: string;
  subject_id: string;
  exam_name: string;
  scored_marks: number;
  total_marks: number;
  percentage?: number;
  exam_date: string;
  created_at: string;
}

export type CreateMarkDTO = Omit<Mark, 'id' | 'user_id' | 'percentage' | 'created_at'>;

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_type: 'study_block' | 'exam' | 'class' | 'coaching' | 'milestone';
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  color_code: string;
  created_at: string;
}

export type CreateCalendarEventDTO = Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>;

export interface RevisionItem {
  id: string;
  user_id: string;
  chapter_id?: string;
  deck_name: string;
  repetition_stage: number;
  interval_days: number;
  ease_factor: number;
  next_review_at: string;
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export type CreateRevisionItemDTO = Omit<RevisionItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'ai_insight' | 'warning';
  is_read: boolean;
  created_at: string;
}

export type CreateNotificationDTO = Omit<NotificationItem, 'id' | 'user_id' | 'created_at'>;

export interface AIPlan {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  strategy_json: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export type CreateAIPlanDTO = Omit<AIPlan, 'id' | 'user_id' | 'created_at'>;
