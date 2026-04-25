import { supabase } from './auth';

export async function createPersona(userId: string, displayName: string) {
  const { data, error } = await supabase
    .from('personas')
    .insert([
      { user_id: userId, display_name: displayName }
    ])
    .select();
  return { data, error };
}

export async function getPersonas(userId: string) {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
}
