import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
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
    const { reportId, status, reviewedBy } = await request.json();
    
    // In a real app, verify admin session here
    
    const { data, error } = await supabase
      .from('reports')
      .update({ status, reviewed_by: reviewedBy })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
