'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 8;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid || !isPasswordValid) {
      setError('Enter a valid admin email and a password that is at least 8 characters long.');
      return;
    }
    setError('');
    setLoading(true);
    // Logic will go here
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-accent rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-accent/20">
            <Shield size={40} className="text-black" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Z-MANAGE</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Admin Access Point</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">{error}</div>}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={20} />
            <input 
              type="email" 
              placeholder="Admin Email" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-accent focus:bg-white/10 transition-all font-medium"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-accent focus:bg-white/10 transition-all font-medium"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !isEmailValid || !isPasswordValid}
            className="w-full bg-accent text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>ENTER DASHBOARD <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <Link href="/z-manage-auth/signup" className="text-white/40 text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors">
            Register New Admin
          </Link>
          <br />
          <Link href="/z-manage-auth/recovery" className="text-white/20 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
            Forgot Password?
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
