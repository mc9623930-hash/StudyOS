/* ==========================================================================
   StudyOS — Calendar Events & Timetable Service
   ========================================================================== */

import { supabase } from '../../js/supabase.js';
import { CalendarEvent, CreateCalendarEventDTO } from '../types/database';

export class CalendarService {
  static async getEvents(userId: string): Promise<CalendarEvent[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching calendar events:', error.message);
      return [];
    }
    return data || [];
  }

  static async createEvent(userId: string, dto: CreateCalendarEventDTO): Promise<CalendarEvent | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteEvent(eventId: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('calendar_events').delete().eq('id', eventId);
    if (error) throw error;
  }
}
