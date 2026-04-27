'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { Bell, Loader2 } from 'lucide-react';

export default function AlumniNotificationsPage() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['alumni-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8 text-white">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Notifications</h1>
        <p className="text-white/40 text-sm italic">Alumni updates, opportunities, and professional alerts.</p>
      </header>
      {isLoading ? <Loader2 className="animate-spin text-indigo-400" /> : (
        <div className="space-y-3">
          {notifications?.map((n: any) => (
            <div key={n.id} className="bg-white/5 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-indigo-400" />
                <span className="font-black">{n.title}</span>
                <span className="text-white/40 text-sm">{n.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
