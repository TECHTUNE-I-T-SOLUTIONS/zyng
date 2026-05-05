"use server";
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getUserIdFromCookieServer() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;
  if (!token) return null;
  const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.sub as string | null;
  } catch (err) {
    console.error('server action token verify failed', err);
    return null;
  }
}

export async function saveReaction(payload: { post_id?: string; reply_id?: string; type: string }) {
  const userId = await getUserIdFromCookieServer();
  if (!userId) {
    throw new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { post_id, reply_id, type } = payload || {};
  if (!type || (!post_id && !reply_id)) {
    throw new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

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
    throw new Response(JSON.stringify({ error: 'Lookup failed' }), { status: 500 });
  }

  if (existingQ.data && (existingQ.data as any).id) {
    const existing = existingQ.data as any;
    if (existing.type === type) {
      const { error: delErr } = await supabase.from('reactions').delete().eq('id', existing.id);
      if (delErr) {
        console.error('reactions delete error', delErr);
        throw new Response(JSON.stringify({ error: 'Delete failed' }), { status: 500 });
      }
      return { deleted: existing.id };
    } else {
      const { data, error } = await supabase.from('reactions').update({ type }).eq('id', existing.id).select();
      if (error) {
        console.error('reactions update error', error);
        throw new Response(JSON.stringify({ error: 'Update failed' }), { status: 500 });
      }
      return data;
    }
  }

  // no existing - insert new
  const payloadRow: any = { user_id: userId, type };
  if (post_id) payloadRow.post_id = post_id;
  if (reply_id) payloadRow.reply_id = reply_id;

  const { data: inserted, error: insertErr } = await supabase.from('reactions').insert([payloadRow]).select();
  if (insertErr) {
    console.error('reactions insert error', insertErr);
    throw new Response(JSON.stringify({ error: 'Insert failed' }), { status: 500 });
  }
  return inserted;
}

export default saveReaction;
