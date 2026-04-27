import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { requireAdmin } from '@/lib/services/adminAuth';

export async function POST(request: Request) {
  try {
    const guard = await requireAdmin(request as any);
    if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
    if (guard.admin.level !== 'super') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, password, full_name, z_name, admin_level, secret_code } = await request.json();

    if (!secret_code) {
      return NextResponse.json({ error: 'Secret code is required' }, { status: 400 });
    }

    const { data: authResult, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: { data: { role: 'admin', admin_level } },
    });
    if (authError) throw authError;

    const { data, error } = await supabaseAdmin.from('admins').insert([{
      user_id: authResult.user?.id,
      email,
      password_hash: password,
      level: admin_level || 'moderator',
    }]).select().single();

    if (error) throw error;

    return NextResponse.json({ auth: authResult, admin: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
