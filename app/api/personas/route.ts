import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getUserIdFromCookie(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/sb-access-token=([^;]+)/);
  if (!match) return null;
  const token = decodeURIComponent(match[1]);
  const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.sub as string | null;
  } catch (err) {
    console.error('personas route token verify failed', err);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return NextResponse.json({ data: [] });

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase.from('personas').select('id, user_id, name, avatar_url, reputation, is_active, created_at').eq('user_id', userId);
    if (error) {
      console.error('personas GET error', error);
      return NextResponse.json({ data: [] }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    console.error('personas GET unexpected', err);
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const name = body?.name;
    if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Missing name' }, { status: 400 });

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase.from('personas').insert([{ user_id: userId, name }]).select();
    if (error) {
      console.error('personas POST error', error);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    console.error('personas POST unexpected', err);
    return NextResponse.json({ error: 'Unexpected' }, { status: 500 });
  }
}
