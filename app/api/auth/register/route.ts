import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      phone,
      email,
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

    if (!phone || !password || !full_name || !z_name || !school_id || !course_of_study || !security_question || !security_answer) {
      return NextResponse.json({ error: 'Missing required signup fields' }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { data: authResult, error: authError } = await supabaseAdmin.auth.signUp({
      email: `${phone}@zyng.campus`,
      password,
      options: {
        data: { phone_number: phone, email, role: 'user' },
      },
    });
    if (authError) throw authError;

    const { data, error } = await supabaseAdmin.from('users').insert([{
      id: authResult.user?.id,
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
      referral_code: referral_code || null,
      security_question,
      security_answer_hash: security_answer,
      onboarding_completed: false,
      status: 'regular',
    }]).select().single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
