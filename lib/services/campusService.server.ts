import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { slugify } from '@/lib/utils';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const campusServiceAdmin = {
  async getOpportunityById(id: string) {
    if (!id || !UUID_PATTERN.test(id)) return null;
    const { data, error } = await supabaseAdmin
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getOpportunityBySlug(slug: string) {
    if (!slug) return null;
    const { data, error } = await supabaseAdmin
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).find((opportunity) => slugify(opportunity.title || '') === slug) || null;
  },

  async getOpportunities(schoolId?: string, type?: string) {
    let q = supabaseAdmin.from('opportunities').select('*').order('created_at', { ascending: false });
    if (schoolId) q = q.eq('school_id', schoolId);
    if (type) q = q.eq('type', type);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
};
