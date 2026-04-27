import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('maintenance_settings').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await supabaseAdmin.from('maintenance_settings').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Maintenance row not found');

    const updated = {
      is_enabled: !!body.is_enabled,
      title: body.title || data.title,
      message: body.message || data.message,
      updated_by: body.updated_by || null,
    };

    const { error: updateError } = await supabaseAdmin.from('maintenance_settings').update(updated).eq('id', data.id);
    if (updateError) throw updateError;

    await supabaseAdmin.from('maintenance_audit_logs').insert([{
      maintenance_id: data.id,
      admin_id: body.updated_by || null,
      action: updated.is_enabled ? 'enabled' : 'disabled',
      previous_state: data,
      new_state: updated,
    }]);

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
