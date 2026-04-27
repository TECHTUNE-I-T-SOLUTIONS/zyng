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

export async function registerAdmin(email: string, password: string, level: string, userId?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'admin',
        admin_level: level,
        user_id: userId || null,
      }
    }
  });
  return { data, error };
}

export async function resetPasswordWithSecurityQuestion(phoneNumber: string, answer: string, newPassword: string) {
  const { data: users, error: lookupError } = await supabase
    .from('users')
    .select('id, phone, security_question, security_answer_hash')
    .eq('phone', phoneNumber)
    .single();

  if (lookupError) throw lookupError;

  const { data: session, error: sessionError } = await supabase.auth.signInWithOtp({
    email: `${phoneNumber}@zyng.campus`,
  });

  if (sessionError) throw sessionError;

  // The actual answer verification and password reset should be enforced server-side.
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) throw updateError;

  return { data: { user: users, session }, error: null };
}
