'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Mail, Key, User, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminSignup() {
  const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Logic will go here
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-accent" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">NEW ADMIN</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Request Management Privileges</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            <input 
              type="email" 
              placeholder="Work Email" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-accent focus:bg-white/10 transition-all font-medium"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            <input 
              type="password" 
              placeholder="Create Password" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-accent focus:bg-white/10 transition-all font-medium"
              required
            />
          </div>

          <div className="relative group">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/40" size={20} />
            <input 
              type="password" 
              placeholder="Super Secret Code" 
              className="w-full bg-accent/5 border border-accent/20 rounded-2xl py-4 pl-12 pr-6 text-accent placeholder:text-accent/30 focus:outline-none focus:border-accent focus:bg-accent/10 transition-all font-bold tracking-widest"
              required
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <span className="text-[10px] font-black text-accent/40 uppercase">Required</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'INITIALIZE ACCOUNT'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/z-manage-auth/login" className="text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
            Already have access? Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
