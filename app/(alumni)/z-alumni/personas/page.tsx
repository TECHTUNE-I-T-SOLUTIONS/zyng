'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { UserCircle2, Loader2 } from 'lucide-react';

export default function AlumniPersonasPage() {
  const { data: me, isLoading } = useQuery({
    queryKey: ['alumni-me'],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase.from('users').select('*, personas(*)').eq('id', auth.user.id).single();
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-8 text-white">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Personas</h1>
        <p className="text-white/40 text-sm italic">Manage the professional identities tied to your alumni account.</p>
      </header>
      {isLoading ? <Loader2 className="animate-spin text-indigo-400" /> : (
        <div className="space-y-4">
          {me?.personas?.map((persona: any) => (
            <div key={persona.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <UserCircle2 className="text-indigo-400" />
              <div>
                <div className="font-black">{persona.name}</div>
                <div className="text-white/40 text-sm">Trust {persona.reputation}</div>
              </div>
            </div>
          )) || <div className="text-white/30 italic">No personas yet.</div>}
        </div>
      )}
    </div>
  );
}
