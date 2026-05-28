import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

function cleanText(value: unknown, max = 4000) {
  return String(value || '').trim().slice(0, max);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = cleanText(body.email, 320).toLowerCase();
    const topic = cleanText(body.topic, 120);
    const message = cleanText(body.message, 4000);
    const name = cleanText(body.name, 160) || null;
    const schoolName = cleanText(body.school_name, 200) || null;

    if (!isEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!topic || !message || message.length < 10) {
      return NextResponse.json({ error: 'Please choose a topic and write a clear message.' }, { status: 400 });
    }

    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const ipAddress = forwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null;

    const { data, error } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        email,
        topic,
        message,
        name,
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
      console.error('contact submission failed', error);
      return NextResponse.json({ error: 'Unable to submit your request right now.' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('contact submission unexpected error', err);
    return NextResponse.json({ error: 'Unexpected request error.' }, { status: 500 });
  }
}
