// Use server-side persona API to avoid client 403/RLS when cookie-based sessions are used
export async function createPersona(_userId: string, displayName: string) {
  try {
    const res = await fetch('/api/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: displayName }),
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
