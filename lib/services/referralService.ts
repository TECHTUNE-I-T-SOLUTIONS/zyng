import { supabase } from '@/lib/db/supabase';

export const referralService = {
  async getMyReferral(userId: string) {
    const { data, error } = await supabase
      .from('referrals')
      .select('*, referrer:users!referrals_referrer_id_fkey(z_name, full_name), referred:users!referrals_referred_user_id_fkey(z_name, full_name)')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createReferral(referrerId: string, referralCode: string, source?: string) {
    const { data, error } = await supabase
      .from('referrals')
      .insert([{ referrer_id: referrerId, referral_code: referralCode, source }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateReferralStatus(referralId: string, status: string, referredUserId?: string) {
    const updates: Record<string, any> = { status };
    if (referredUserId) updates.referred_user_id = referredUserId;

    const { data, error } = await supabase
      .from('referrals')
      .update(updates)
      .eq('id', referralId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
