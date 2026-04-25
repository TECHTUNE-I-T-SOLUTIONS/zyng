import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for general use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function loginWithPhone(phoneNumber: string, password: string) {
  // Zyng uses phone-based auth mapped to Supabase email for simplicity in MVP
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${phoneNumber}@zyng.campus`,
    password: password,
  });
  return { data, error };
}

export async function registerWithPhone(phoneNumber: string, password: string, campusId: string) {
  const { data, error } = await supabase.auth.signUp({
    email: `${phoneNumber}@zyng.campus`,
    password: password,
    options: {
      data: {
        phone_number: phoneNumber,
        campus_id: campusId,
      }
    }
  });
  return { data, error };
}
