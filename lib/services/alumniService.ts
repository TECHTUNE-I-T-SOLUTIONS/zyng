import { supabase } from '@/lib/db/supabase';

function normalizeUserProfile(data: any) {
  return {
    ...data,
    school: Array.isArray(data?.schools) ? data.schools[0] : data?.schools || null,
    faculty: Array.isArray(data?.faculties) ? data.faculties[0] : data?.faculties || null,
    department: Array.isArray(data?.departments) ? data.departments[0] : data?.departments || null,
    personas: data?.personas || [],
  };
}

export const alumniService = {
  async getProfileData() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;

    const userResult = await supabase.from('users').select('*, schools(*), faculties(*), departments(*), personas(*)').eq('id', auth.user.id).single();
    if (userResult.error) throw userResult.error;
    const user = normalizeUserProfile(userResult.data);

    const [resumeResult, referralsResult, opportunitiesResult, roomsResult, projectsResult] = await Promise.all([
      supabase.from('resumes').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('referrals').select('*').eq('referrer_id', auth.user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('opportunities').select('*').order('created_at', { ascending: false }).limit(6),
      supabase.from('zing_rooms').select('*').eq('school_id', user.school_id).order('created_at', { ascending: false }).limit(6),
      supabase.from('zync_projects').select('id, user_id, title, description, category, link, images, created_at, updated_at').eq('user_id', auth.user.id).order('created_at', { ascending: false }).limit(12),
    ]);

    if (resumeResult.error) throw resumeResult.error;
    if (referralsResult.error) throw referralsResult.error;
    if (opportunitiesResult.error) throw opportunitiesResult.error;
    if (roomsResult.error) throw roomsResult.error;
    if (projectsResult.error) throw projectsResult.error;

    return {
      user,
      resume: resumeResult.data?.[0] || null,
      referrals: referralsResult.data || [],
      opportunities: opportunitiesResult.data || [],
      rooms: roomsResult.data || [],
      projects: projectsResult.data || [],
    };
  }
};
