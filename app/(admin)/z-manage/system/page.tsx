'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { maintenanceService } from '@/lib/services/maintenanceService';
import { AlertTriangle, Loader2, Save, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminSystemPage() {
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('Maintenance in Progress');
  const [message, setMessage] = useState('We are making improvements to Zyng. You may experience brief interruptions while updates are being applied.');

  const { isLoading } = useQuery({
    queryKey: ['admin-system-maintenance'],
    queryFn: async () => {
      const current = await maintenanceService.getCurrent();
      if (current) {
        setEnabled(!!current.is_enabled);
        setTitle(current.title || title);
        setMessage(current.message || message);
      }
      return current;
    },
  });

  const save = async () => {
    setSaving(true);
    try {
      await maintenanceService.updateMaintenance({ is_enabled: enabled, title, message });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Platform Controls</h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Maintenance, safety, and operational switches</p>
      </header>

      <section className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <AlertTriangle className="text-amber-400" size={20} />
              Maintenance Mode
            </h2>
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mt-1">Shows a public banner and notifies users when toggled.</p>
          </div>
          <button onClick={() => setEnabled((value) => !value)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${enabled ? 'bg-amber-500/15 border-amber-400/30 text-amber-200' : 'bg-white/5 border-white/10 text-white/40'}`}>
            {enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/40" />
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="w-full min-h-32 bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/40 resize-y" />
          <button onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 bg-amber-500 text-black px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-all disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Controls'}
          </button>
        </div>
      </section>
    </div>
  );
}
