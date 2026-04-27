import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

export async function POST(request: Request) {
  try {
    const { step, phone, answer, newPassword } = await request.json();

    if (step === 'question') {
      if (!phone) {
        return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
      }
      const { data, error } = await supabaseAdmin.from('users').select('security_question').eq('phone', phone).single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (step === 'reset') {
      if (!phone || !answer || !newPassword) {
        return NextResponse.json({ error: 'Missing recovery fields' }, { status: 400 });
      }
      if (String(newPassword).length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
      }
      const { data: user, error: userError } = await supabaseAdmin.from('users').select('id, security_answer_hash').eq('phone', phone).single();
      if (userError) throw userError;
      if (!user || user.security_answer_hash !== answer) {
        return NextResponse.json({ error: 'Security answer does not match' }, { status: 400 });
      }

      const { error: updateError } = await supabaseAdmin.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid recovery step' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
