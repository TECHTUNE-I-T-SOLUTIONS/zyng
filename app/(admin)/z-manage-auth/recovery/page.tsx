'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Loader2, Mail, Shield } from 'lucide-react';

export default function AdminRecoveryPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleRecover = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Unable to start recovery.');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start recovery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans text-white">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-accent rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-accent/20">
            <Shield size={40} className="text-black" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">RECOVER ACCESS</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Admin password recovery</p>
        </div>

        {submitted ? (
          <div className="rounded-[2rem] border border-accent/20 bg-accent/10 p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 text-accent" size={44} />
            <h2 className="text-xl font-black">Check your inbox</h2>
            <p className="mt-3 text-sm text-white/50">If that email belongs to an admin, a recovery link has been sent.</p>
          </div>
        ) : (
          <form onSubmit={handleRecover} className="space-y-4">
            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">{error}</div>}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={20} />
              <input
                type="email"
                placeholder="Admin Email"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-accent focus:bg-white/10 transition-all font-medium"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <button disabled={loading} className="w-full bg-accent text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : 'Send Recovery Link'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/z-manage-auth/login" className="inline-flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
