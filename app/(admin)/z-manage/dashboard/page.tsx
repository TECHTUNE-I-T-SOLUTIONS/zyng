'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { maintenanceService } from '@/lib/services/maintenanceService';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  ShieldAlert, 
  TrendingUp, 
  Activity,
  UserPlus,
  Lock,
  UserMinus,
  Loader2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Save
} from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const [adminLevel, setAdminLevel] = useState<'super' | 'admin' | 'sub' | 'moderator' | null>(null);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState('Maintenance in Progress');
  const [maintenanceMessage, setMaintenanceMessage] = useState('We are making improvements to Zyng. You may experience brief interruptions while updates are being applied.');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: zyngs } = await supabase.from('posts').select('*', { count: 'exact', head: true });
      const { count: reports } = await supabase.from('reports').select('*', { count: 'exact', head: true });
      return { users, zyngs, reports };
    }
  });

  useQuery({
    queryKey: ['admin-maintenance'],
    queryFn: async () => {
      const current = await maintenanceService.getCurrent();
      if (current) {
        setMaintenanceEnabled(!!current.is_enabled);
        setMaintenanceTitle(current.title || maintenanceTitle);
        setMaintenanceMessage(current.message || maintenanceMessage);
      }
      return current;
    },
  });

  useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setAdminLevel(null);
        return null;
      }

      const { data } = await supabase
        .from('admins')
        .select('level')
        .eq('user_id', auth.user.id)
        .maybeSingle();

      setAdminLevel((data?.level as typeof adminLevel) || null);
      return data;
    },
  });

  const handleMaintenanceSave = async () => {
    setSavingMaintenance(true);
    try {
      await maintenanceService.updateMaintenance({
        is_enabled: maintenanceEnabled,
        title: maintenanceTitle,
        message: maintenanceMessage,
      });
    } finally {
      setSavingMaintenance(false);
    }
  };

  const canAccessAdminTools = !!adminLevel;
  const canAccessSuperTools = adminLevel === 'super';

  if (!canAccessAdminTools) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-4xl font-black tracking-tighter mb-2">OPERATIONS OVERVIEW</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Restricted Area</p>
        </header>
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 text-white/60">
          You do not have verified admin access to view this panel.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tighter mb-2">OPERATIONS OVERVIEW</h1>
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Live Platform Metrics</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Zyngers', value: stats?.users || 0, icon: Users, color: 'text-blue-500' },
          { label: 'Active Zyngs', value: stats?.zyngs || 0, icon: MessageSquare, color: 'text-accent' },
          { label: 'Unresolved Reports', value: stats?.reports || 0, icon: ShieldAlert, color: 'text-red-500' },
        ].map((stat) => (
          <motion.div 
            key={stat.label}
            whileHover={{ y: -5 }}
            className="bg-neutral-900 border border-white/5 p-8 rounded-[2rem] shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global</div>
            </div>
            <div className="text-4xl font-black text-white mb-1">{isLoading ? '...' : stat.value.toLocaleString()}</div>
            <div className="text-xs font-bold text-white/40 uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <section className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <ShieldAlert className="text-red-500" size={20} />
              CRITICAL REPORTS
            </h2>
            <button className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">Harassment Flagged</div>
                <div className="text-[10px] text-white/30 uppercase font-black">Post ID: #Z9281 • 2m ago</div>
              </div>
              <button className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Take Action</button>
            </div>
            {/* More reports... */}
          </div>
        </section>

        {/* Security Controls (Super Admin Only) */}
        {canAccessSuperTools && (
          <section className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-8 border-l-4 border-l-accent">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Lock className="text-accent" size={20} />
                SECURITY OVERRIDE
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-accent hover:text-black transition-all group">
                <UserPlus size={24} className="mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Add Admin</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-red-500 hover:text-white transition-all group">
                <UserMinus size={24} className="mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Nuke User</span>
              </button>
            </div>
            
            <div className="mt-6 p-6 bg-accent/5 rounded-2xl border border-accent/10">
              <div className="text-[10px] font-black text-accent uppercase mb-2">Super Secret Key Control</div>
              <p className="text-xs text-white/40 font-medium italic mb-4">Rotate the registration secret every 30 days for maximum security.</p>
              <button className="w-full bg-accent/10 border border-accent/20 text-accent py-3 rounded-xl text-[10px] font-black uppercase hover:bg-accent/20 transition-all">
                Generate New Secret
              </button>
            </div>
          </section>
        )}
      </div>

      {canAccessSuperTools && (
        <section className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <AlertTriangle className="text-amber-400" size={20} />
                MAINTENANCE MODE
              </h2>
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mt-1">Banner text and toggle are read from the maintenance table</p>
            </div>
            <button
              onClick={() => setMaintenanceEnabled((s) => !s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${maintenanceEnabled ? 'bg-amber-500/15 border-amber-400/30 text-amber-200' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
              {maintenanceEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {maintenanceEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <input
              value={maintenanceTitle}
              onChange={(e) => setMaintenanceTitle(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/40"
              placeholder="Banner title"
            />
            <textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              className="w-full min-h-28 bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/40 resize-y"
              placeholder="Banner message"
            />
            <button
              onClick={handleMaintenanceSave}
              disabled={savingMaintenance}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 text-black px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-all disabled:opacity-50"
            >
              <Save size={14} />
              {savingMaintenance ? 'Saving...' : 'Save Maintenance'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
