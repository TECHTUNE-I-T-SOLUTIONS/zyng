import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('resumes').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1);
    if (error) throw error;
    return NextResponse.json(data?.[0] || null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, content, resumeId } = body;
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
    const query = resumeId
      ? supabaseAdmin.from('resumes').update({ content }).eq('id', resumeId).select().single()
      : supabaseAdmin.from('resumes').insert([{ user_id: userId, content }]).select().single();
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
