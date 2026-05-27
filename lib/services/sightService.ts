import { supabase } from '../db/supabase';

export const sightService = {
  async getSights() {
    const { data, error } = await supabase
      .from('zync_projects')
      .select('*, author:users!user_id(id, z_name, avatar_url)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getSightById(id: string) {
    const { data, error } = await supabase
      .from('zync_projects')
      .select('*, author:users!user_id(id, z_name, avatar_url)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createSight(payload: {
    title: string;
    description: string;
    category?: string;
    tags?: string[];
    images?: string[];
    link?: string;
    user_id: string;
  }) {
    const { data, error } = await supabase
      .from('zync_projects')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async saveSight(payload: {
    id?: string;
    title: string;
    description?: string;
    category?: string;
    link?: string;
    images?: string[];
    user_id: string;
  }) {
    const request = payload.id
      ? supabase.from('zync_projects').update(payload).eq('id', payload.id).select('*, author:users!user_id(id, z_name, avatar_url)').single()
      : supabase.from('zync_projects').insert(payload).select('*, author:users!user_id(id, z_name, avatar_url)').single();

    const { data, error } = await request;
    if (error) throw error;
    return data;
  },

  async removeSight(id: string) {
    const { data, error } = await supabase.from('zync_projects').delete().eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  
  async getComments(zyncId: string) {
    const { data, error } = await supabase
      .from('zync_comments')
      .select('*, user:users!user_id(id, z_name, avatar_url)')
      .eq('zync_id', zyncId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addComment(zyncId: string, userId: string, content: string) {
    const { data, error } = await supabase
      .from('zync_comments')
      .insert({ zync_id: zyncId, user_id: userId, content })
      .select('*, user:users!user_id(id, z_name, avatar_url)')
      .single();
    if (error) throw error;
    return data;
  },
  
  async toggleReaction(zyncId: string, userId: string, type: string) {
    // Check if exists
    const { data: existing } = await supabase
      .from('zync_reactions')
      .select('id, type')
      .eq('zync_id', zyncId)
      .eq('user_id', userId)
      .single();
      
    if (existing) {
      if (existing.type === type) {
        await supabase.from('zync_reactions').delete().eq('id', existing.id);
        return { action: 'removed' };
      } else {
        await supabase.from('zync_reactions').update({ type }).eq('id', existing.id);
        return { action: 'updated', type };
      }
    } else {
      await supabase.from('zync_reactions').insert({ zync_id: zyncId, user_id: userId, type });
      return { action: 'added', type };
    }
  },

  async getReactions(zyncId: string) {
    const { data, error } = await supabase
      .from('zync_reactions')
      .select('type, user_id')
      .eq('zync_id', zyncId);
    if (error) throw error;
    return data || [];
  }
};

