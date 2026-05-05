import { supabase } from '@/lib/db/supabase';

export const opportunityService = {
  async getOpportunity(id: string) {
    const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createOpportunity(payload: any) {
    const { data, error } = await supabase.from('opportunities').insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  async apply(opportunityId: string, applicantId: string, resumeId?: string, coverLetter?: string) {
    const { data, error } = await supabase.from('opportunity_applications').insert([{
      opportunity_id: opportunityId,
      applicant_id: applicantId,
      resume_id: resumeId || null,
      cover_letter: coverLetter || null,
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async listMine(userId: string) {
    const { data, error } = await supabase.from('opportunity_applications').select('*, opportunity:opportunities(*)').eq('applicant_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  ,
  async listPostedBy(userId: string) {
    const { data, error } = await supabase.from('opportunities').select('*').eq('posted_by', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  ,
  async updateOpportunity(id: string, patch: any) {
    const { data, error } = await supabase.from('opportunities').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteOpportunity(id: string) {
    const { data, error } = await supabase.from('opportunities').delete().eq('id', id).single();
    if (error) throw error;
    return data;
  }
};
