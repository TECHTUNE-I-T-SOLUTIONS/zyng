import { supabaseAdmin } from '@/lib/db/supabase-admin';

export const campusServiceAdmin = {
  async getOpportunityById(id: string) {
    if (!id) return null;
    const { data, error } = await supabaseAdmin.from('opportunities').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async getOpportunities(schoolId?: string, type?: string) {
    let q = supabaseAdmin.from('opportunities').select('*').order('created_at', { ascending: false });
    if (schoolId) q = q.eq('school_id', schoolId);
    if (type) q = q.eq('type', type);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }
};
