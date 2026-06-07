import { supabase } from '@/lib/db/supabase';

export const verificationService = {
  async submitVerification(payload: {
    user_id: string;
    id_card_url: string;
    video_url?: string | null;
    challenge_phrase?: string | null;
    status?: string;
    profile_snapshot?: Record<string, unknown>;
  }) {
    const { data, error } = await supabase
      .from('verification_submissions')
      .insert({
        user_id: payload.user_id,
        id_card_url: payload.id_card_url,
        video_url: payload.video_url || null,
        challenge_phrase: payload.challenge_phrase || null,
        status: payload.status || 'pending',
        profile_snapshot: payload.profile_snapshot || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLatestForUser(userId: string) {
    const { data, error } = await supabase
      .from('verification_submissions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
