import { supabase } from '@/lib/db/supabase';

export const postService = {
  async getPosts(schoolId?: string) {
    let query = supabase
      .from('posts')
      .select('*, persona:personas(*), user:users(status, z_name, full_name), replies(*, persona:personas(*))')
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
      .select('*, persona:personas(*), user:users(status, z_name, full_name), replies(*, persona:personas(*))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createPost(post: any) {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: post.user_id,
        persona_id: post.persona_id,
        school_id: post.school_id,
        type: post.type,
        content: post.content,
        media_url: post.media_url,
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
      .upsert({ post_id: postId, user_id: userId, type })
      .select();

    if (error) throw error;
    return data;
  }
};
