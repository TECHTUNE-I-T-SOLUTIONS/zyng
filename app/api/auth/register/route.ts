import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      phone,
      email,
      status,
      password,
      full_name,
      z_name,
      school_id,
      faculty_id,
      department_id,
      course_of_study,
      hobbies,
      skills,
      bio,
      graduation_date,
      referral_code,
      referred_by,
      security_question,
      security_answer,
    } = body;

    if (!phone || !password || !full_name || !z_name || !school_id || !course_of_study || !graduation_date || !security_question || !security_answer) {
      return NextResponse.json({ error: 'Missing required signup fields' }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const finalStatus = status === 'alumni' ? 'alumni' : 'regular';
    const normalizedReferralCode = String(referral_code || '').trim();
    let referredBy: string | null = referred_by || null;
    let resolvedReferralCode: string | null = normalizedReferralCode || null;

    if (normalizedReferralCode) {
      const { data: referrer, error: referrerError } = await supabaseAdmin
        .from('users')
        .select('id, referral_code')
        .eq('referral_code', normalizedReferralCode)
        .maybeSingle();

      if (referrerError) throw referrerError;
      if (!referrer) {
        return NextResponse.json({ error: 'Referral code not found' }, { status: 400 });
      }

      referredBy = referrer.id;
      resolvedReferralCode = referrer.referral_code || null;
    }

    const { data: authResult, error: authError } = await supabaseAdmin.auth.signUp({
      email: String(email).trim(),
      password,
      options: {
        data: { phone_number: phone, email, role: 'user' },
      },
    });
    if (authError) throw authError;
    if (!authResult.user?.id) {
      return NextResponse.json({ error: 'Account creation failed. Please try again.' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin.from('users').insert([{
      id: authResult.user.id,
      phone,
      email,
      full_name,
      z_name,
      school_id,
      faculty_id: faculty_id || null,
      department_id: department_id || null,
      course_of_study,
      hobbies: hobbies ? hobbies.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      skills: skills ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      bio,
      graduation_date: graduation_date || null,
      referral_code: null,
      referred_by: referredBy,
      security_question,
      security_answer_hash: security_answer,
      onboarding_completed: false,
      status: finalStatus,
    }]).select().single();

    if (error) throw error;

    if (referredBy && resolvedReferralCode) {
      const { error: referralInsertError } = await supabaseAdmin.from('referrals').insert([{
        referrer_id: referredBy,
        referred_user_id: data.id,
        referral_code: resolvedReferralCode,
        status: finalStatus === 'alumni' ? 'verified' : 'signed_up',
        source: 'signup_form',
      }]);

      if (referralInsertError) {
        console.warn('Referral tracking insert skipped:', referralInsertError.message);
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
