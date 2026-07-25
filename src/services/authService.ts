/* ==========================================================================
   StudyOS — Supabase Auth Service
   ========================================================================== */

import { supabase } from '../../js/supabase.js';

export class AuthService {
  static async signUp(email: string, password: string, fullName?: string) {
    if (!supabase) throw new Error('Supabase client not initialized');
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
  }

  static async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase client not initialized');
    return await supabase.auth.signInWithPassword({ email, password });
  }

  static async signOut() {
    if (!supabase) return;
    return await supabase.auth.signOut();
  }

  static async getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async getSession() {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
}
