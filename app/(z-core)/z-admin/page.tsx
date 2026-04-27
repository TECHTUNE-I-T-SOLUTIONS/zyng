'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { Shield, Users, FileWarning, Settings, TrendingUp, Activity, Search, Loader2, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [{ count: userCount }, { count: reportCount }, { count: opportunityCount }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }),
      ]);
      return { userCount: userCount || 0, reportCount: reportCount || 0, opportunityCount: opportunityCount || 0 };
    },
  });

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <header className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <Shield className="text-accent" />
            ADMIN CONTROL
          </h1>
          <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest mt-1">
            Super Admin Mode • Global Oversight
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={16} />
            <input type="text" placeholder="Search users, posts, reports..." className="bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-accent" />
          </div>
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-black cursor-pointer">A</div>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-64 border-r border-border p-4 space-y-2">
          {[
            { id: 'overview', name: 'Overview', icon: Activity },
            { id: 'users', name: 'User Management', icon: Users },
            { id: 'content', name: 'Content Moderation', icon: FileWarning },
            { id: 'schools', name: 'School Config', icon: Settings },
            { id: 'analytics', name: 'Platform Analytics', icon: TrendingUp },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-accent text-black' : 'text-foreground/60 hover:bg-muted hover:text-foreground'}`}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: stats?.userCount || 0, change: 'Live count', color: 'text-blue-500' },
                  { label: 'Active Today', value: 0, change: 'Needs realtime metric', color: 'text-green-500' },
                  { label: 'Pending Reports', value: stats?.reportCount || 0, change: 'Live count', color: 'text-orange-500' },
                  { label: 'Open Jobs', value: stats?.opportunityCount || 0, change: 'Live count', color: 'text-accent' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-muted border border-border p-6 rounded-3xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">{stat.label}</div>
                    <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] font-bold mt-2 text-foreground/30">{stat.change}</div>
                  </div>
                ))}
              </div>
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-4 px-2">RECENT SYSTEM ALERTS</h2>
                <div className="bg-muted/50 border border-dashed border-border rounded-3xl p-12 text-center">
                  <AlertTriangle className="mx-auto text-foreground/20 mb-4" size={48} />
                  <p className="text-foreground/40 font-bold italic">No critical alerts detected in the last 24 hours.</p>
                </div>
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-foreground/20">
              <Shield size={64} className="mb-4 opacity-20" />
              <p className="font-black uppercase tracking-[0.2em]">{activeTab} system live</p>
              <p className="text-xs mt-2 font-medium">Fetching real-time data...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
