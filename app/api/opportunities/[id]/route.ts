import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

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
    console.error('opportunity route token verify failed', err);
    return null;
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const id = params.id;
    const body = await request.json();

    // verify poster
    const { data: opp, error: oppErr } = await supabaseAdmin.from('opportunities').select('id, posted_by').eq('id', id).single();
    if (oppErr) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    if (opp.posted_by !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabaseAdmin.from('opportunities').update(body).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('PATCH opportunity error', err);
    return NextResponse.json({ error: err.message || 'Unexpected' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const id = params.id;
    const { data: opp, error: oppErr } = await supabaseAdmin.from('opportunities').select('id, posted_by').eq('id', id).single();
    if (oppErr) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    if (opp.posted_by !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabaseAdmin.from('opportunities').delete().eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deleted: data });
  } catch (err: any) {
    console.error('DELETE opportunity error', err);
    return NextResponse.json({ error: err.message || 'Unexpected' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { data, error } = await supabaseAdmin.from('opportunities').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
