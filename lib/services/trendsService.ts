import { supabase } from '@/lib/db/supabase';

export const trendsService = {
  async getTrendingHashtags(limit = 10) {
    const { data, error } = await supabase
      .from('trending_hashtags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async getPlatformMood() {
    const { data, error } = await supabase.from('platform_mood').select('*').maybeSingle();
    if (error) throw error;
    return data || null;
  },
};

export default trendsService;
