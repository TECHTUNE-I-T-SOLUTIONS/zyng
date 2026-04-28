import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('portfolios').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1);
    if (error) throw error;
    return NextResponse.json(data?.[0] || null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, user_id, title, summary, skills, entries, attachments } = body;
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

    const payload = { user_id, title, summary, skills, entries, attachments };
    const query = id
      ? supabaseAdmin.from('portfolios').update(payload).eq('id', id).select().single()
      : supabaseAdmin.from('portfolios').insert([payload]).select().single();

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('portfolios').delete().eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
