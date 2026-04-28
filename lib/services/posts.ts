import { supabase } from '@/lib/db/supabase';

export async function getFeed(campusId: string, cursor?: string, limit: number = 10) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      personas (
        display_name,
        avatar_url,
        reputation_score
      )
    `)
    .eq('campus_id', campusId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function createPost(personaId: string, campusId: string, type: string, content: string, mediaUrl?: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        persona_id: personaId,
        campus_id: campusId,
        post_type: type,
        content: content,
        media_url: mediaUrl,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h default
      }
    ])
    .select();
  return { data, error };
}
