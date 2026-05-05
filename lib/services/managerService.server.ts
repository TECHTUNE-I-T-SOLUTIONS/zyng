import { jwtVerify } from 'jose';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { applicationServiceAdmin } from './applicationService.server';

type ManagerOptions = {
  token?: string | null;
  page?: number;
  perPage?: number;
};

export async function getPostedJobsWithApplications(opts: ManagerOptions = {}) {
  const { token = null, page = 1, perPage = 20 } = opts;
  if (!token) return { userId: null, opportunities: [], total: 0, applications: [], myApplications: [] };

  const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');
  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub as string | null;
    if (!userId) return { userId: null, opportunities: [], total: 0, applications: [], myApplications: [] };

    // paginated opportunities with exact count
    const from = (page - 1) * perPage;
    const to = page * perPage - 1;
    const { data: opportunities, error: oppErr, count } = await supabaseAdmin
      .from('opportunities')
      .select('*', { count: 'exact' })
      .eq('posted_by', userId)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (oppErr) throw oppErr;

    const oppIds = (opportunities || []).map((o: any) => o.id).filter(Boolean);

    // fetch applications only for the returned opportunities
    let applications: any[] = [];
    if (oppIds.length > 0) {
      const { data: apps, error: appsErr } = await supabaseAdmin
        .from('opportunity_applications')
        .select('*, applicant:users(id, full_name, z_name, school_id), opportunity:opportunities(id)')
        .in('opportunity_id', oppIds)
        .order('created_at', { ascending: false });
      if (appsErr) throw appsErr;
      applications = apps || [];
    }

    // fetch my applications (applicant perspective)
    const { data: myApplications, error: myAppsErr } = await supabaseAdmin
      .from('opportunity_applications')
      .select('*, opportunity:opportunities(*)')
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false });
    if (myAppsErr) throw myAppsErr;

    return { userId, opportunities: opportunities || [], total: count || 0, applications: applications || [], myApplications: myApplications || [] };
  } catch (err) {
    console.error('managerService failed', err);
    return { userId: null, opportunities: [], total: 0, applications: [], myApplications: [] };
  }
}
