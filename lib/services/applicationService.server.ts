import { supabaseAdmin } from '@/lib/db/supabase-admin';

export const applicationServiceAdmin = {
  async createApplication(payload: {
    opportunity_id: string;
    applicant_id: string | null;
    resume_id?: string | null;
    resume_url?: string | null;
    cover_letter?: string | null;
    status?: string | null;
  }) {
    const { data, error } = await supabaseAdmin.from('opportunity_applications').insert([{
      opportunity_id: payload.opportunity_id,
      applicant_id: payload.applicant_id || null,
      resume_id: payload.resume_id || null,
      resume_url: payload.resume_url || null,
      cover_letter: payload.cover_letter || null,
      status: payload.status || 'submitted',
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async listForOpportunity(opportunityId: string) {
    const { data, error } = await supabaseAdmin.from('opportunity_applications').select('*, applicant:users(id, full_name, z_name, school_id)').eq('opportunity_id', opportunityId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async listForPoster(posterId: string) {
    // list applications for opportunities posted by posterId using foreign table filter
    const { data, error } = await supabaseAdmin
      .from('opportunity_applications')
      .select('*, opportunity:opportunities(id, title, company, posted_by), applicant:users(id, full_name, z_name, school_id)')
      .eq('opportunity.posted_by', posterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateStatus(applicationId: string, status: string) {
    const { data, error } = await supabaseAdmin.from('opportunity_applications').update({ status, updated_at: new Date().toISOString() }).eq('id', applicationId).select().single();
    if (error) throw error;
    return data;
  }
};
