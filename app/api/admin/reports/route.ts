import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { requireAdmin } from '@/lib/services/adminAuth';

export async function GET(request: Request) {
  try {
    const guard = await requireAdmin(request as any);
    if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*, reporter:users(z_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const guard = await requireAdmin(request as any);
    if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { reportId, status, reviewedBy } = await request.json();
    
    // In a real app, verify admin session here
    
    const { data, error } = await supabaseAdmin
      .from('reports')
      .update({ status })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
