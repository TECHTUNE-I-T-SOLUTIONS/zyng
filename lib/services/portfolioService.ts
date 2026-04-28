import { supabase } from '@/lib/db/supabase';

export const portfolioService = {
  async getByUser(userId?: string) {
    let query = supabase.from('portfolios').select('*').order('created_at', { ascending: false }).limit(1);
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data?.[0] ?? null;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('portfolios').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(payload: any) {
    const { data, error } = await supabase.from('portfolios').insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, payload: any) {
    const { data, error } = await supabase.from('portfolios').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id: string) {
    const { data, error } = await supabase.from('portfolios').delete().eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
