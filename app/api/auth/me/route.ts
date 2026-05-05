import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/sb-access-token=([^;]+)/);
    if (!match) return NextResponse.json({ user: null });

    const token = decodeURIComponent(match[1]);
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');
    try {
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.sub as string;
      if (!userId) return NextResponse.json({ user: null });

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, serviceKey);

      const { data, error } = await supabase
        .from('users')
        .select('*, schools(*), faculties(*), departments(*), personas(*)')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('me route db error', error);
        return NextResponse.json({ user: null });
      }

      const normalized = {
        ...data,
        school: Array.isArray(data?.schools) ? data.schools[0] : data?.schools || null,
        faculty: Array.isArray(data?.faculties) ? data.faculties[0] : data?.faculties || null,
        department: Array.isArray(data?.departments) ? data.departments[0] : data?.departments || null,
        personas: data?.personas || [],
      } as any;

      return NextResponse.json({ user: normalized });
    } catch (err) {
      console.error('token verify failed', err);
      return NextResponse.json({ user: null });
    }
  } catch (err) {
    console.error('me route unexpected', err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
