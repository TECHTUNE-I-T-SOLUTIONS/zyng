import { supabase } from '@/lib/db/supabase';

export const reportReviewService = {
  async listReportReviews(reportId?: string) {
    let query = supabase
      .from('report_reviews')
      .select('*, report:reports(*, reporter:users(z_name, full_name)), reviewer:users(z_name, full_name)')
      .order('created_at', { ascending: false });

    if (reportId) query = query.eq('report_id', reportId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createReportReview(reportId: string, reviewerId: string, status: string = 'reviewed', notes?: string) {
    const { data, error } = await supabase
      .from('report_reviews')
      .insert([{ report_id: reportId, reviewer_id: reviewerId, status, notes }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateReportReview(reviewId: string, updates: { status?: string; notes?: string }) {
    const { data, error } = await supabase
      .from('report_reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
