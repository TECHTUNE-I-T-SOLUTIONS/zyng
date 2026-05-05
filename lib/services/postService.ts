import { supabase } from '@/lib/db/supabase';

// Extract hashtags from a text blob (e.g., post content) using `#tag` syntax.
function extractHashtagsFromText(text?: string | null) {
  if (!text) return [] as string[];
  const re = /#([A-Za-z0-9_\-]+)/g;
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    set.add(m[1].toLowerCase());
  }
  return Array.from(set);
}

// Normalize an explicit hashtag string (space separated), strip leading '#', dedupe/lowercase.
function normalizeHashtagString(s?: string | null) {
  if (!s) return [] as string[];
  return Array.from(
    new Set(
      s
        .split(/\s+/)
        .map((h) => h.replace(/^#/, '').trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

export const postService = {
  async getPosts(schoolId?: string) {
    let query = supabase
      .from('posts')
      .select('*, persona:personas(*), user:users(status, z_name, full_name), replies(*, persona:personas(*)), reactions(*, user:users(z_name, full_name))')
      .order('created_at', { ascending: false });

    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getPostById(id: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, persona:personas(*), user:users(status, z_name, full_name), replies(*, persona:personas(*)), reactions(*, user:users(z_name, full_name))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createPost(post: any) {
    // Derive a normalized `hashtags` array.
    let hashtags: string[] = [];
    if (Array.isArray(post.hashtags) && post.hashtags.length > 0) {
      hashtags = Array.from(new Set(post.hashtags.map((h: string) => String(h).replace(/^#/, '').trim().toLowerCase()).filter(Boolean)));
    } else if (post.hashtag) {
      hashtags = normalizeHashtagString(post.hashtag);
    } else {
      hashtags = extractHashtagsFromText(post.content);
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: post.user_id,
        persona_id: post.persona_id,
        school_id: post.school_id,
        type: post.type,
        content: post.content,
        media_url: post.media_url,
        media_urls: post.media_urls || (post.media_url ? [post.media_url] : null),
        // store normalized hashtags as jsonb array
        hashtags: hashtags,
        poll_options: post.poll_options,
        expires_at: post.expires_at,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async reactToPost(postId: string, userId: string, type: string) {
    const { data, error } = await supabase
      .from('reactions')
      .upsert({ post_id: postId, user_id: userId, type }, { onConflict: ['user_id', 'post_id'] })
      .select();

    if (error) throw error;
    return data;
  }
,

  async getPostsByUser(userId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, persona:personas(*), user:users(status, z_name, full_name), replies(*, persona:personas(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updatePost(id: string, updates: Partial<any>) {
    // If content updated, also update derived hashtags if present
    const toUpdate: any = { ...updates };
    if (updates.content) {
      // derive hashtags from content
      toUpdate.hashtags = extractHashtagsFromText(updates.content as string);
    }
    if (updates.hashtag) {
      toUpdate.hashtags = normalizeHashtagString(updates.hashtag as string);
    }
    // allow direct provision of hashtags array
    if (Array.isArray(updates.hashtags)) {
      toUpdate.hashtags = updates.hashtags.map((h: string) => String(h).replace(/^#/, '').trim().toLowerCase()).filter(Boolean);
    }

    const { data, error } = await supabase
      .from('posts')
      .update(toUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePost(id: string) {
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },

  async createReply(postId: string, personaId: string, content: string) {
    const { data, error } = await supabase
      .from('replies')
      .insert({ post_id: postId, persona_id: personaId, content })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
