import { supabase } from '@/lib/db/supabase';

export const maintenanceService = {
  async getCurrent() {
    const { data, error } = await supabase.from('maintenance_settings').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) return null;
    return data;
  },

  async updateMaintenance(payload: { is_enabled: boolean; title: string; message: string; updated_by?: string }) {
    const res = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update maintenance');
    return data;
  }
};
