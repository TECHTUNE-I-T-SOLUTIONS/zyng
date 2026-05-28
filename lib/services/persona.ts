// Use server-side persona API to avoid client 403/RLS when cookie-based sessions are used
export async function createPersona(_userId: string, displayName: string, avatarUrl?: string | null) {
  try {
    const res = await fetch('/api/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch('/api/personas');
    const json = await res.json();
    return { data: json.data || [], error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}
