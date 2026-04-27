'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical, 
  Lock, 
  Unlock,
  Trash2,
  Loader2
} from 'lucide-react';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const isSuperAdmin = true; // Temporary mock

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      let query = supabase.from('users').select('*');
      if (search) query = query.ilike('z_name', `%${search}%`);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    }
  });

  const handleHoldAccount = async (userId: string, isHeld: boolean) => {
    const { error } = await supabase.from('users').update({ is_held: !isHeld }).eq('id', userId);
    if (!error) refetch();
  };

  const handleNukeUser = async (userId: string) => {
    if (!isSuperAdmin) return;
    if (confirm('CRITICAL: This will permanently delete the Zynger and all their Zyngs, Zyncs, and Zings. Proceed?')) {
       const { error } = await supabase.from('users').delete().eq('id', userId);
       if (!error) refetch();
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Zynger Management</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Audit and Control User Accounts</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent" size={18} />
          <input 
            type="text" 
            placeholder="Search z_name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm w-80 focus:outline-none focus:border-accent"
          />
        </div>
      </header>

      <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              <th className="p-6">Zynger</th>
              <th className="p-6">Status</th>
              <th className="p-6">Trust</th>
              <th className="p-6">Joined</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-accent" />
                </td>
              </tr>
            ) : users?.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-accent">
                      {user.z_name?.[0]?.toUpperCase() || 'Z'}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        @{user.z_name}
                        {user.is_verified && <ShieldCheck size={14} className="text-accent" />}
                      </div>
                      <div className="text-[10px] text-white/20 font-black uppercase">{user.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    user.is_held ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                  }`}>
                    {user.is_held ? 'Held' : 'Active'}
                  </span>
                </td>
                <td className="p-6 font-bold text-sm">{user.trust_score}</td>
                <td className="p-6 text-xs text-white/40">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleHoldAccount(user.id, user.is_held)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                      title={user.is_held ? "Unfreeze Account" : "Freeze Account"}
                    >
                      {user.is_held ? <Unlock size={18} /> : <Lock size={18} />}
                    </button>
                    {isSuperAdmin && (
                      <button 
                        onClick={() => handleNukeUser(user.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-white/20 hover:text-red-500"
                        title="Nuke User"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
