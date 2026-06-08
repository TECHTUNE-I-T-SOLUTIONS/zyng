import { supabase } from '@/lib/db/supabase';

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Use server-side persona API to avoid client 403/RLS when cookie-based sessions are used
export async function createPersona(_userId: string, displayName: string, avatarUrl?: string | null) {
  try {
    const res = await fetch('/api/personas', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ name: displayName, avatar_url: avatarUrl || null }),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json };
    return { data: json.data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function setActivePersona(personaId: string) {
  try {
    const res = await fetch('/api/personas', {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify({ personaId }),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json };
    return { data: json.data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function updatePersonaAvatar(personaId: string, avatarUrl: string) {
  try {
    const res = await fetch('/api/personas', {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify({ personaId, avatar_url: avatarUrl }),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json };
    return { data: json.data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function clearAllPersonas() {
  try {
    const res = await fetch('/api/personas', {
      method: 'DELETE',
      headers: await authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json };
    return { data: json.data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function getPersonas(_userId: string) {
  try {
    const res = await fetch('/api/personas', {
      headers: await authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json };
    return { data: json.data || [], error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}
