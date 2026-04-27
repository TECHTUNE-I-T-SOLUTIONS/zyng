'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, LogOut, Award, Users, Loader2, GraduationCap, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/db/supabase';

export default function AlumniProfilePage() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => userService.getCurrentUser(),
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="flex-1 overflow-y-auto bg-black p-8 relative">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
              <GraduationCap size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Alumni Identity</h1>
          </div>
          <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <Settings size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900 border border-white/5 rounded-[3rem] p-10 shadow-2xl"
            >
              <div className="flex items-center gap-8 mb-10">
                <div className="w-24 h-24 rounded-[2rem] bg-indigo-500 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-indigo-500/20">
                  {user?.full_name?.[0] || 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black tracking-tight text-white">{user?.full_name || 'Alumni Zynger'}</h2>
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-indigo-500/20">Verified Alumni</span>
                  </div>
                  <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mt-2 italic">Class of 2023 • Unilorin</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <div className="text-white/20 text-[10px] font-black uppercase mb-2 flex items-center gap-2">
                    <Briefcase size={12} /> Industry
                  </div>
                  <div className="text-sm font-bold text-white/80">Software Engineering</div>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <div className="text-white/20 text-[10px] font-black uppercase mb-2 flex items-center gap-2">
                    <Shield size={12} /> Global Trust
                  </div>
                  <div className="text-sm font-bold text-indigo-400">980 / 1000</div>
                </div>
              </div>
            </motion.div>

            <div className="bg-neutral-900 border border-white/5 rounded-[3rem] p-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-8 flex items-center gap-2">
                <Users size={14} /> GLOBAL ZYNCS
              </h3>
              <div className="text-center py-10 opacity-20 italic text-sm">
                Active connections within the alumni network will appear here.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <button className="w-full bg-indigo-600 text-white py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-indigo-600/20">
              Public Portfolio
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all"
            >
              End Session
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-neutral-900 border border-white/10 p-10 rounded-[3rem] text-center max-w-sm"
            >
              <h2 className="text-2xl font-black uppercase mb-4 italic">leaving?</h2>
              <p className="text-white/40 text-xs mb-8 italic">Your professional status will remain live.</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleSignOut} className="bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">Logout</button>
                <button onClick={() => setShowLogoutModal(false)} className="bg-white/5 text-white/20 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">Stay</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
