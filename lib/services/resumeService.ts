import { supabase } from '@/lib/db/supabase';

export const resumeService = {
  async getLatestResume(userId: string) {
    const { data, error } = await supabase.from('resumes').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data;
  },

  async saveResume(userId: string, content: Record<string, any>, resumeId?: string) {
    if (resumeId) {
      const { data, error } = await supabase.from('resumes').update({ content }).eq('id', resumeId).select().single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase.from('resumes').insert([{ user_id: userId, content }]).select().single();
    if (error) throw error;
    return data;
  }
};
