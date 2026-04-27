'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { Database, ShieldCheck, Zap, Activity, BarChart3, Loader2 } from 'lucide-react';

export default function AdminDBPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['db-metrics'],
    queryFn: async () => {
      const [{ count: userCount }, { count: reportCount }, { count: resumeCount }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase.from('resumes').select('*', { count: 'exact', head: true }),
      ]);

      return {
        userCount: userCount || 0,
        reportCount: reportCount || 0,
        resumeCount: resumeCount || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase italic">Platform Core</h1>
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Live Database & Security Audit</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'DB Health', value: 'Live', icon: ShieldCheck, color: 'text-green-500' },
          { label: 'Active Users', value: metrics?.userCount || 0, icon: Activity, color: 'text-accent' },
          { label: 'Pending Reports', value: metrics?.reportCount || 0, icon: Zap, color: 'text-orange-500' },
          { label: 'Resumes', value: metrics?.resumeCount || 0, icon: Database, color: 'text-blue-500' },
        ].map((item) => (
          <div key={item.label} className="bg-neutral-900 border border-white/5 p-8 rounded-[2.5rem]">
            <item.icon className={item.color} size={24} />
            <div className="text-2xl font-black mt-4">{item.value}</div>
            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-neutral-900 border border-white/5 p-10 rounded-[3rem]">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="text-accent" />
          <h2 className="text-xl font-black uppercase tracking-tight">Growth Velocity</h2>
        </div>
        <div className="h-64 w-full bg-white/5 rounded-3xl flex items-center justify-center border border-dashed border-white/10">
          <p className="text-white/20 text-xs font-bold italic">
            Analytics will render here once the stats pipeline is connected.
          </p>
        </div>
      </div>
    </div>
  );
}
