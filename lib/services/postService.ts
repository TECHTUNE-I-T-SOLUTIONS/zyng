import { supabase } from '@/lib/db/supabase';

export const postService = {
  async getPosts(campus?: string) {
    let query = supabase
      .from('posts')
      .select('*, persona:personas(*)')
      .order('created_at', { ascending: false });

    if (campus) {
      query = query.eq('school_slug', campus);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getPostById(id: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, persona:personas(*), replies(*, persona:personas(*))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createPost(post: any) {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
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
