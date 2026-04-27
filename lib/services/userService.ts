import { supabase } from '@/lib/db/supabase';
import { User, UserStatus } from '@/types';

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*, schools(*), faculties(*), departments(*), personas(*)')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
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
