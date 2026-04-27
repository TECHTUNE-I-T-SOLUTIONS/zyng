import { supabase } from './auth';

export async function createPersona(userId: string, displayName: string) {
  const { data, error } = await supabase
    .from('personas')
    .insert([
      { user_id: userId, name: displayName }
    ])
    .select();
  return { data, error };
}

export async function getPersonas(userId: string) {
  const { data, error } = await supabase
    .from('personas')
    .select('id, user_id, name, avatar_url, reputation, is_active, created_at')
    .eq('user_id', userId);
  return { data, error };
}
