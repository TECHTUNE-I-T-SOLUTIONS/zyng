import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

function cleanText(value: unknown, max = 4000) {
  return String(value || '').trim().slice(0, max);
}

function isEmail(value: string) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = cleanText(body.name, 160) || null;
    const email = cleanText(body.email, 320).toLowerCase() || null;
    const message = cleanText(body.message, 4000);
    const category = cleanText(body.category, 120) || 'general';
    const schoolName = cleanText(body.school_name, 200) || null;
    const mood = Number.isInteger(body.mood) && body.mood >= 1 && body.mood <= 5 ? body.mood : null;

    if (!isEmail(email || '')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!message || message.length < 10) {
      return NextResponse.json({ error: 'Please write a little more detail before submitting.' }, { status: 400 });
    }

    if (!mood) {
      return NextResponse.json({ error: 'Please select a mood before submitting feedback.' }, { status: 400 });
    }

    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const ipAddress = forwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null;

    const { data, error } = await supabaseAdmin
      .from('feedback_submissions')
      .insert({
        name,
        email,
        mood,
        category,
        message,
        school_name: schoolName,
        user_agent: request.headers.get('user-agent'),
        ip_address: ipAddress,
        metadata: {
          referer: request.headers.get('referer'),
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('feedback submission failed', error);
      return NextResponse.json({ error: 'Unable to submit feedback right now.' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('feedback submission unexpected error', err);
    return NextResponse.json({ error: 'Unexpected request error.' }, { status: 500 });
  }
}
