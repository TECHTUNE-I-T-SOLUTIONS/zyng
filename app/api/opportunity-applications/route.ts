import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');
    if (!applicantId) return NextResponse.json({ error: 'applicantId required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('opportunity_applications').select('*, opportunity:opportunities(*)').eq('applicant_id', applicantId).order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await supabaseAdmin.from('opportunity_applications').insert([body]).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
