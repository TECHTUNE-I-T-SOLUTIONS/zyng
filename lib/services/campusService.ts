import { supabase } from '@/lib/db/supabase';

export const campusService = {
  // Rooms
  async getRooms(schoolId?: string) {
    let query = supabase.from('zing_rooms').select('*');
    if (schoolId) query = query.eq('school_id', schoolId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Events
  async getEvents(schoolId?: string) {
    let query = supabase.from('zing_events').select('*').order('start_time', { ascending: true });
    if (schoolId) query = query.eq('school_id', schoolId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Marketplace
  async getMarketplaceItems(schoolId?: string, category?: string) {
    let query = supabase.from('zing_marketplace').select('*').eq('is_sold', false);
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
,

  // Create a room (public or private)
  async createRoom(payload: {
    name: string;
    description?: string;
    is_private?: boolean;
    password?: string | null;
    school_id?: string | null;
    created_by?: string | null;
  }) {
    // NOTE: For now password is stored in `password_hash` as provided. For production, hash on server-side.
    const { data, error } = await supabase
      .from('zing_rooms')
      .insert({
        name: payload.name,
        description: payload.description || null,
        is_private: !!payload.is_private,
        password_hash: payload.password || null,
        school_id: payload.school_id || null,
        created_by: payload.created_by || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
  ,

  // Create an event
  async createEvent(payload: {
    title: string;
    description?: string | null;
    start_time: string; // ISO string
    end_time?: string | null;
    location?: string | null;
    is_virtual?: boolean;
    cover_image?: string | null;
    images?: string[] | null;
    tags?: string[] | null;
    category?: string | null;
    created_by?: string | null;
    school_id?: string | null;
  }) {
    const { data, error } = await supabase
      .from('zing_events')
      .insert({
        title: payload.title,
        description: payload.description || null,
        start_time: payload.start_time,
        end_time: payload.end_time || null,
        location: payload.location || null,
        is_virtual: !!payload.is_virtual,
        cover_image: payload.cover_image || null,
        images: payload.images || null,
        tags: payload.tags || null,
        category: payload.category || null,
        created_by: payload.created_by || null,
        school_id: payload.school_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
  ,

  // Create marketplace item
  async createMarketplace(payload: {
    title: string;
    description?: string | null;
    price?: number | null;
    currency?: string | null;
    is_sold?: boolean;
    media_url?: string | null;
    images?: string[] | null;
    category?: string | null;
    created_by?: string | null;
    school_id?: string | null;
  }) {
    const { data, error } = await supabase
      .from('zing_marketplace')
      .insert({
        title: payload.title,
        description: payload.description || null,
        price: payload.price || null,
        currency: payload.currency || 'NGN',
        is_sold: !!payload.is_sold,
        media_url: payload.media_url || null,
        images: payload.images || null,
        category: payload.category || null,
        created_by: payload.created_by || null,
        school_id: payload.school_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
