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
  } catch (error) {
    console.error('replies route token verify failed', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const postId = body?.post_id;
    const personaId = body?.persona_id;
    const content = typeof body?.content === 'string' ? body.content.trim() : '';
    const parentReplyId = body?.parent_reply_id || null;

    if (!postId || !personaId || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: persona, error: personaError } = await supabase
      .from('personas')
      .select('id, user_id')
      .eq('id', personaId)
      .eq('user_id', userId)
      .maybeSingle();

    if (personaError) {
      console.error('replies persona lookup error', personaError);
      return NextResponse.json({ error: 'Persona lookup failed' }, { status: 500 });
    }

    if (!persona) {
      return NextResponse.json({ error: 'Persona does not belong to this account' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('replies')
      .insert([{ post_id: postId, persona_id: personaId, parent_reply_id: parentReplyId, content }])
      .select('*, persona:personas(*)')
      .single();

    if (error) {
      console.error('replies insert error', error);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('replies POST unexpected', error);
    return NextResponse.json({ error: 'Unexpected' }, { status: 500 });
  }
}