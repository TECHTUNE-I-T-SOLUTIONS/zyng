import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { applicationServiceAdmin } from '@/lib/services/applicationService.server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/sb-access-token=([^;]+)/);
    if (!match) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const token = decodeURIComponent(match[1]);
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');
    try {
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.sub as string;
      if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

      // verify opportunity accepts on-platform applications
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, serviceKey);
      const { data: opp, error: oppErr } = await supabase.from('opportunities').select('id, accepts_applications, external_url, posted_by').eq('id', body.opportunity_id).single();
      if (oppErr) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
      if (!opp.accepts_applications) return NextResponse.json({ error: 'This opportunity does not accept on-platform applications' }, { status: 400 });

      const created = await applicationServiceAdmin.createApplication({
        opportunity_id: body.opportunity_id,
        applicant_id: userId,
        resume_id: body.resume_id || null,
        resume_url: body.resume_url || null,
        cover_letter: body.cover_letter || null,
      });

      return NextResponse.json(created);
    } catch (err: any) {
      console.error('token verify failed', err);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const oppId = url.searchParams.get('opportunity_id');
    if (!oppId) return NextResponse.json({ error: 'opportunity_id required' }, { status: 400 });

    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/sb-access-token=([^;]+)/);
    if (!match) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const token = decodeURIComponent(match[1]);
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');
    try {
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.sub as string;
      if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

      // verify the user is the poster of the opportunity
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, serviceKey);
      const { data: opp, error: oppErr } = await supabase.from('opportunities').select('id, posted_by').eq('id', oppId).single();
      if (oppErr) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
      if (opp.posted_by !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      const apps = await applicationServiceAdmin.listForOpportunity(oppId);
      return NextResponse.json(apps);
    } catch (err: any) {
      console.error('token verify failed', err);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
