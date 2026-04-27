import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const referrerId = searchParams.get('referrerId');

    let query = supabase
      .from('referrals')
      .select('*, referrer:users!referrals_referrer_id_fkey(z_name, full_name), referred:users!referrals_referred_user_id_fkey(z_name, full_name)')
      .order('created_at', { ascending: false });

    if (referrerId) query = query.eq('referrer_id', referrerId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { referrerId, referralCode, source } = await request.json();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('referrals')
      .insert([{
        referrer_id: referrerId || user.id,
        referral_code: referralCode,
        source
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { referralId, status, referredUserId } = await request.json();
    const updates: Record<string, any> = { status };
    if (referredUserId) updates.referred_user_id = referredUserId;

    const { data, error } = await supabase
      .from('referrals')
      .update(updates)
      .eq('id', referralId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
