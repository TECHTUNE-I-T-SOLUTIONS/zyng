import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

export async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.toLowerCase().startsWith('bearer ') ? authHeader.slice(7) : null;
  const cookieToken = request.cookies.get('sb-access-token')?.value || null;
  const accessToken = bearerToken || cookieToken;

  if (!accessToken) {
    return { error: 'Unauthorized', status: 401 as const };
  }

  const { data: userResult, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userResult.user) {
    return { error: 'Unauthorized', status: 401 as const };
  }

  const { data: admin, error: adminError } = await supabaseAdmin
    .from('admins')
    .select('id, user_id, email, level, created_at')
    .eq('user_id', userResult.user.id)
    .maybeSingle();

  if (adminError || !admin) {
    return { error: 'Forbidden', status: 403 as const };
  }

  return { admin, user: userResult.user };
}
