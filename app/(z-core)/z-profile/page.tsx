'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, LogOut, Award, Users, BookOpen, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/db/supabase';

export default function ProfilePage() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => userService.getCurrentUser(),
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black mb-2">Not Signed In</h2>
        <p className="text-foreground/40 mb-8">Please login to view your profile.</p>
        <button className="bg-accent text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 relative">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Zynger Profile</h1>
          <button className="p-3 bg-muted border border-border rounded-xl hover:bg-muted/80 transition-all">
            <Settings size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted border border-border rounded-[2.5rem] p-8 shadow-2xl shadow-accent/5"
            >
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-3xl bg-accent flex items-center justify-center text-4xl font-black text-black">
                  {user.full_name?.[0] || user.z_name?.[0] || 'U'}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{user.full_name || 'Zyng User'}</h2>
                  <p className="text-accent font-bold uppercase tracking-widest text-xs mt-1">@{user.z_name || 'anonymous'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/40 p-4 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2 text-foreground/40 text-[10px] font-black uppercase mb-1">
                    <BookOpen size={12} /> University
                  </div>
                  <div className="text-sm font-bold">{user.school?.name || 'Not Selected'}</div>
                </div>
                <div className="bg-background/40 p-4 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2 text-foreground/40 text-[10px] font-black uppercase mb-1">
                    <Award size={12} /> Trust Level
                  </div>
                  <div className="text-sm font-bold">{user.trust_score >= 100 ? 'Verified' : 'Newcomer'}</div>
                </div>
              </div>
            </motion.div>

            <div className="bg-muted border border-border rounded-[2.5rem] p-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-6 flex items-center gap-2">
                <Users size={14} /> ACTIVE ZYNCS
              </h3>
              <div className="space-y-4">
                {user.personas && user.personas.length > 0 ? (
                  user.personas.map((persona: any) => (
                    <div key={persona.id} className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-border/50 hover:border-accent/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted-foreground/20 flex items-center justify-center font-bold">
                          {persona.name[0]}
                        </div>
                        <div className="font-bold">{persona.name}</div>
                      </div>
                      <div className="text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full">
                        Trust: {persona.reputation}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-foreground/30 text-xs font-black uppercase tracking-widest text-center py-4">No personas created yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-accent/10 border border-accent/20 rounded-[2.5rem] p-8 text-center"
            >
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-black">
                  <Shield size={40} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-accent mb-2">TRUST SCORE</h3>
              <div className="text-5xl font-black mb-4">{user.trust_score}</div>
              <div className="w-full bg-accent/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-accent h-full transition-all duration-1000" 
                  style={{ width: `${Math.min(user.trust_score / 10, 100)}%` }} 
                />
              </div>
              <p className="text-[10px] text-accent/60 font-bold uppercase mt-4 tracking-tighter">
                {user.trust_score > 500 ? 'TOP 1% OF CAMPUS' : 'BUILDING REPUTATION'}
              </p>
            </motion.div>

            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-full bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl py-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-red-500/20 transition-all mt-auto"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-background border border-border p-8 rounded-[2.5rem] text-center shadow-2xl"
            >
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="absolute top-6 right-6 text-foreground/20 hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} />
              </div>
              
              <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight uppercase">Leaving so soon?</h2>
              <p className="text-foreground/40 text-sm mb-8 font-medium italic">Your active personas will remain live, but you won't receive real-time notifications.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  onClick={handleSignOut}
                >
                  Confirm Sign Out
                </button>
                <button 
                  className="w-full bg-muted text-foreground/40 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:text-foreground transition-all"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Stay in Zyng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
