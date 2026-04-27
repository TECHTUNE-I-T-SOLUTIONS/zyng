import { supabase } from '@/lib/db/supabase';

export const alumniService = {
  async getProfileData() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;

    const userResult = await supabase.from('users').select('*, schools(*), faculties(*), departments(*), personas(*)').eq('id', auth.user.id).single();
    if (userResult.error) throw userResult.error;

    const [resumeResult, referralsResult, opportunitiesResult, roomsResult] = await Promise.all([
      supabase.from('resumes').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('referrals').select('*').eq('referrer_id', auth.user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('opportunities').select('*').order('created_at', { ascending: false }).limit(6),
      supabase.from('zing_rooms').select('*').eq('school_id', userResult.data.school_id).order('created_at', { ascending: false }).limit(6),
    ]);

    if (resumeResult.error) throw resumeResult.error;
    if (referralsResult.error) throw referralsResult.error;
    if (opportunitiesResult.error) throw opportunitiesResult.error;
    if (roomsResult.error) throw roomsResult.error;

    return {
      user: userResult.data,
      resume: resumeResult.data?.[0] || null,
      referrals: referralsResult.data || [],
      opportunities: opportunitiesResult.data || [],
      rooms: roomsResult.data || [],
    };
  }
};
