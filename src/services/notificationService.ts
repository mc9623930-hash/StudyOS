/* ==========================================================================
   StudyOS — User Notifications Service
   ========================================================================== */

import { supabase } from '../../js/supabase.js';
import { NotificationItem, CreateNotificationDTO } from '../types/database';

export class NotificationService {
  static async getNotifications(userId: string): Promise<NotificationItem[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  }

  static async markAsRead(notificationId: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  }
}
