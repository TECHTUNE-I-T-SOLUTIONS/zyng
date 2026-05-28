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
    const avatarUrl = body?.avatar_url;
    if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Missing name' }, { status: 400 });

    const supabase = createClient(supabaseUrl, serviceKey);
    const { count, error: countError } = await supabase
      .from('personas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('personas POST count error', countError);
      return NextResponse.json({ error: 'Count failed' }, { status: 500 });
    }

    if ((count || 0) >= 2) {
      return NextResponse.json({ error: 'Persona limit reached' }, { status: 400 });
    }

    const { data, error } = await supabase.from('personas').insert([{ user_id: userId, name, avatar_url: typeof avatarUrl === 'string' && avatarUrl.trim() ? avatarUrl.trim() : null }]).select();
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

export async function PATCH(request: Request) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const personaId = body?.personaId;
    const avatarUrl = body?.avatar_url;
    const makeActive = body?.makeActive;
    if (!personaId || typeof personaId !== 'string') {
      return NextResponse.json({ error: 'Missing personaId' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    if (typeof avatarUrl === 'string') {
      const { data, error } = await supabase
        .from('personas')
        .update({ avatar_url: avatarUrl.trim() || null })
        .eq('id', personaId)
        .eq('user_id', userId)
        .select('id, user_id, name, avatar_url, reputation, is_active, created_at')
        .single();

      if (error) {
        console.error('personas PATCH avatar error', error);
        return NextResponse.json({ error: 'Avatar update failed' }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    if (makeActive === false) {
      const { data, error } = await supabase
        .from('personas')
        .update({ is_active: false })
        .eq('id', personaId)
        .eq('user_id', userId)
        .select('id, user_id, name, avatar_url, reputation, is_active, created_at')
        .single();

      if (error) {
        console.error('personas PATCH deactivate error', error);
        return NextResponse.json({ error: 'Deactivate failed' }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    const { error: deactivateError } = await supabase
      .from('personas')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (deactivateError) {
      console.error('personas PATCH deactivate error', deactivateError);
      return NextResponse.json({ error: 'Deactivate failed' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('personas')
      .update({ is_active: true })
      .eq('id', personaId)
      .eq('user_id', userId)
      .select('id, user_id, name, avatar_url, reputation, is_active, created_at')
      .single();

    if (error) {
      console.error('personas PATCH activate error', error);
      return NextResponse.json({ error: 'Activate failed' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('personas PATCH unexpected', err);
    return NextResponse.json({ error: 'Unexpected' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const supabase = createClient(supabaseUrl, serviceKey);
    const { error } = await supabase.from('personas').delete().eq('user_id', userId);
    if (error) {
      console.error('personas DELETE error', error);
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }

    return NextResponse.json({ data: true });
  } catch (err) {
    console.error('personas DELETE unexpected', err);
    return NextResponse.json({ error: 'Unexpected' }, { status: 500 });
  }
}
