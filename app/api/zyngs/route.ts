import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function POST(request: Request) {
  try {
    const { content, personaId, type, mediaUrl, schoolId } = await request.json();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('posts')
      .insert([{
        user_id: user.id,
        persona_id: personaId,
        content,
        type: type || 'regular',
        media_url: mediaUrl,
        school_id: schoolId
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get('schoolId');

  let query = supabase.from('posts').select('*, persona:personas(*), user:users(status)');
  if (schoolId) query = query.eq('school_id', schoolId);
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
