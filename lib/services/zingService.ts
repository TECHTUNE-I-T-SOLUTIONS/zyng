import { supabase } from '@/lib/db/supabase';

export const zingService = {
  async getRooms() {
    const { data, error } = await supabase
      .from('zing_rooms')
      .select('*, zing_room_members(*), zing_messages(content, created_at)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async sendZingRequest(targetUserId: string, initialMessage: string) {
    // 1. Create a room that is not yet accepted
    const { data: room, error: roomError } = await supabase
      .from('zing_rooms')
      .insert([{ is_accepted: false }])
      .select()
      .single();
    
    if (roomError) throw roomError;

    // 2. Add members
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('zing_room_members').insert([
      { room_id: room.id, user_id: user?.id, role: 'owner' },
      { room_id: room.id, user_id: targetUserId, role: 'member' }
    ]);

    // 3. Send initial message
    await supabase.from('zing_messages').insert([{
      room_id: room.id,
      sender_id: user?.id,
      content: initialMessage
    }]);

    return room;
  },

  async acceptZingRequest(roomId: string) {
    const { error } = await supabase
      .from('zing_rooms')
      .update({ is_accepted: true })
      .eq('id', roomId);
    
    if (error) throw error;
  }
};
