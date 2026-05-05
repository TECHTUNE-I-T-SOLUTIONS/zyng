import { supabaseAdmin } from '@/lib/db/supabase-admin';
import bcrypt from 'bcryptjs';

export const zingServiceServer = {
  async joinRoom({ roomId, userId, password }: { roomId: string; userId: string; password?: string | null }) {
    const { data: room, error: roomError } = await supabaseAdmin
      .from('zing_rooms')
      .select('id, is_private, password_hash')
      .eq('id', roomId)
      .maybeSingle();

    if (roomError) throw roomError;
    if (!room) throw new Error('Room not found');

    if (room.is_private) {
      const hash = room.password_hash || null;
      if (!hash) {
        const e: any = new Error('Room requires a password');
        e.status = 401;
        throw e;
      }
      const ok = await bcrypt.compare(password || '', hash);
      if (!ok) {
        const e: any = new Error('Invalid password');
        e.status = 401;
        throw e;
      }
    }

    // check existing membership
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from('zing_room_members')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (existingErr) throw existingErr;

    if (existing && existing.length > 0) {
      return existing[0];
    }

    const { data: member, error: insertErr } = await supabaseAdmin
      .from('zing_room_members')
      .insert([{ room_id: roomId, user_id: userId, role: 'member' }])
      .select()
      .single();

    if (insertErr) throw insertErr;
    return member;
  }
};
