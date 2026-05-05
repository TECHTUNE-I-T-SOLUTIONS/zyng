import { supabase } from '@/lib/db/supabase';
import { User, UserStatus } from '@/types';

export const userService = {
  async getCurrentUser(): Promise<User | null | undefined> {
    // Try client-side supabase first. Wrap in try/catch to avoid
    // unhandled errors or lock-related warnings from gotrue interfering
    // with the app (e.g., React Strict Mode double renders).
    try {
      const resp = await supabase.auth.getUser();
      const user = (resp as any)?.data?.user;
      if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('*, schools(*), faculties(*), departments(*), personas(*)')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      const normalized = {
        ...data,
        school: Array.isArray(data?.schools) ? data.schools[0] : data?.schools || null,
        faculty: Array.isArray(data?.faculties) ? data.faculties[0] : data?.faculties || null,
        department: Array.isArray(data?.departments) ? data.departments[0] : data?.departments || null,
        personas: data?.personas || [],
      } as any;
      return normalized;
      }
    } catch (err) {
      console.warn('supabase.auth.getUser failed or locked — falling back to server endpoint', err);
    }

    // Fallback: call server-side endpoint which reads the auth cookie and returns the user
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return null;
      const json = await res.json();
      return json.user || null;
    } catch (err) {
      console.error('userService.getCurrentUser fallback failed', err);
      return null;
    }
  },

  async updateProfile(updates: Partial<User>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
  },

  async checkAlumniStatus() {
    const user = await this.getCurrentUser();
    if (!user) return;

    // Logic to check if graduation date has passed
    if (user.status === 'regular' && user.graduation_date) {
      const gradDate = new Date(user.graduation_date);
      if (gradDate <= new Date()) {
        await this.updateProfile({ status: 'alumni' });
        // Trigger congratulatory notification logic here
      }
    }
  },

  async getAdminSecret() {
    const { data, error } = await supabase
      .from('admin_secrets')
      .select('value')
      .eq('key', 'registration_secret')
      .single();
    
    if (error) throw error;
    return data.value;
  }
};
