import { supabase } from '@/lib/db/supabase';
import { ACTIVE_PERSONA_ALERT } from '@/lib/persona-utils';

export const zingService = {
  async getRooms() {
    const { data, error } = await supabase
      .from('zing_rooms')
      .select('*, zing_room_members(*, user:users!user_id(id, z_name, avatar_url, personas(id, name, avatar_url, is_active))), zing_messages(*, sender:users!sender_id(id, z_name, avatar_url)), creator:users!created_by(id, z_name, avatar_url, personas(id, name, avatar_url, is_active))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getRoomById(id: string) {
    const { data, error } = await supabase
      .from('zing_rooms')
      .select('*, zing_room_members(*, user:users!user_id(id, z_name, avatar_url, personas(id, name, avatar_url, is_active))), zing_messages(*, sender:users!sender_id(id, z_name, avatar_url)), creator:users!created_by(id, z_name, avatar_url, personas(id, name, avatar_url, is_active))')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async sendMessage(roomId: string, content: string) {
    const { data, error } = await supabase
      .from('zing_messages')
      .insert([{ room_id: roomId, content }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async sendZingRequest(targetUserId: string, initialMessage: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error('You must be signed in to start a chat');
    const { count: activePersonaCount, error: personaError } = await supabase
      .from('personas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true);
    if (personaError) throw personaError;
    if (!activePersonaCount) throw new Error(ACTIVE_PERSONA_ALERT);

    const { data: outgoingChat, error: outgoingError } = await supabase
      .from('zing_chats')
      .select('*')
      .eq('sender_id', user.id)
      .eq('receiver_id', targetUserId)
      .maybeSingle();

    if (outgoingError) throw outgoingError;

    const { data: incomingChat, error: incomingError } = await supabase
      .from('zing_chats')
      .select('*')
      .eq('sender_id', targetUserId)
      .eq('receiver_id', user.id)
      .maybeSingle();

    if (incomingError) throw incomingError;

    const existingChat = outgoingChat || incomingChat;

    const chat = existingChat ?? (await supabase
      .from('zing_chats')
      .insert([{ sender_id: user.id, receiver_id: targetUserId, is_accepted: false }])
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      }));

    const { error: messageError } = await supabase.from('zing_messages').insert([{ chat_id: chat.id, sender_id: user.id, content: initialMessage }]);
    if (messageError) throw messageError;

    return chat;
  },

  async acceptZingRequest(roomId: string) {
    const { error } = await supabase
      .from('zing_chats')
      .update({ is_accepted: true })
      .eq('id', roomId);
    
    if (error) throw error;
  }
};
