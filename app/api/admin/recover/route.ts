import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Enter a valid admin email.' }, { status: 400 });
    }

    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (adminError) throw adminError;

    if (admin) {
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';
      const redirectTo = origin ? `${origin}/z-manage-auth/login` : undefined;
      await supabaseAdmin.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
    }

    return NextResponse.json({ data: true });
  } catch (err) {
    console.error('admin recovery failed', err);
    return NextResponse.json({ error: 'Unable to start password recovery.' }, { status: 500 });
  }
}
