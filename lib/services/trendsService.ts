export const trendsService = {
  async getTrendingHashtags(limit = 10) {
    try {
      const res = await fetch(`/api/trends?limit=${encodeURIComponent(String(limit))}`);
      if (!res.ok) {
        const body = await res.text();
        console.error('[trendsService] /api/trends error', res.status, body);
        throw new Error('Failed to fetch trends');
      }
      const data = await res.json();
      console.debug('[trendsService] /api/trends returned', (data || []).slice(0, 10));
      return data || [];
    } catch (err) {
      console.error('[trendsService] fetch /api/trends failed', err);
      throw err;
    }
  },

  async getPlatformMood() {
    try {
      const res = await fetch('/api/trends?limit=0');
      // keep old implementation as-is: call supabase directly if needed
      // but return null for compatibility if API not available
      return null;
    } catch (err) {
      return null;
    }
  },
};

export default trendsService;
