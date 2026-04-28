'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { supabase } from '@/lib/db/supabase';
import { Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*, reporter:users(id, z_name, full_name, phone)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-black tracking-tighter mb-2">Reports</h1>
          <p className="text-foreground/40">User-submitted reports for moderation and review.</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>
        ) : !reports || reports.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-[3rem]">
            <p className="text-foreground/40 font-bold italic">No reports yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r: any) => (
              <div key={r.id} className="bg-muted border border-border rounded-2xl p-4 flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-bold">{r.target_type} • {r.status}</div>
                    <div className="text-[12px] text-foreground/40">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-foreground/60 mt-2">{r.reason}</div>
                  <div className="text-[12px] text-foreground/30 mt-2">Reporter: {r.reporter?.z_name || r.reporter?.full_name || 'Anonymous'}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={`/z-reports/${r.id}`} className="px-3 py-2 bg-muted border border-border rounded-xl">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
