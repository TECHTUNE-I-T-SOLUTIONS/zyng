import { supabase } from '@/lib/db/supabase';

export const campusService = {
  // Rooms
  async getRooms(schoolId?: string) {
    let query = supabase.from('rooms').select('*');
    if (schoolId) query = query.eq('school_id', schoolId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Events
  async getEvents(schoolId?: string) {
    let query = supabase.from('events').select('*').order('start_time', { ascending: true });
    if (schoolId) query = query.eq('school_id', schoolId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Marketplace
  async getMarketplaceItems(schoolId?: string, category?: string) {
    let query = supabase.from('marketplace').select('*').eq('is_sold', false);
    if (schoolId) query = query.eq('school_id', schoolId);
    if (category && category !== 'All') query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Jobs/Opportunities
  async getOpportunities(schoolId?: string, type?: string) {
    let query = supabase.from('opportunities').select('*').order('created_at', { ascending: false });
    if (schoolId) query = query.eq('school_id', schoolId);
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};
