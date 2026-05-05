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
    console.error('reactions route token verify failed', err);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { post_id, reply_id, type } = body || {};
    if (!type || (!post_id && !reply_id)) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const supabase = createClient(supabaseUrl, serviceKey);

    // Ensure single reaction per user per target by select -> update or insert
    const payload: any = { user_id: userId, type };
    if (post_id) payload.post_id = post_id;
    if (reply_id) payload.reply_id = reply_id;

    // find existing reaction for this user+target
    let existingQ;
    if (post_id) {
      existingQ = await supabase.from('reactions').select('id,type').match({ user_id: userId, post_id }).limit(1).maybeSingle();
    } else if (reply_id) {
      existingQ = await supabase.from('reactions').select('id,type').match({ user_id: userId, reply_id }).limit(1).maybeSingle();
    } else {
      existingQ = { data: null, error: null };
    }

    if (existingQ.error) {
      console.error('reactions lookup error', existingQ.error);
      return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
    }

    if (existingQ.data && existingQ.data.id) {
      // if same type, delete (toggle off), else update
      const existing = existingQ.data as any;
      if (existing.type === type) {
        const { error: delErr } = await supabase.from('reactions').delete().eq('id', existing.id);
        if (delErr) {
          console.error('reactions delete error', delErr);
          return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
        }
        return NextResponse.json({ data: { deleted: existing.id } });
      } else {
        const { data, error } = await supabase.from('reactions').update({ type }).eq('id', existing.id).select();
        if (error) {
          console.error('reactions update error', error);
          return NextResponse.json({ error: 'Update failed' }, { status: 500 });
        }
        return NextResponse.json({ data });
      }
    }

    // no existing - insert new
    const { data: inserted, error: insertErr } = await supabase.from('reactions').insert([payload]).select();
    if (insertErr) {
      console.error('reactions insert error', insertErr);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }
    return NextResponse.json({ data: inserted });
  } catch (err) {
    console.error('reactions POST unexpected', err);
    return NextResponse.json({ error: 'Unexpected' }, { status: 500 });
  }
}
