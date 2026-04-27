'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Mail, Key, User, Loader2, BadgeCheck, Hash } from 'lucide-react';
import Link from 'next/link';

export default function AdminSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    secretCode: '',
    full_name: '',
    z_name: '',
    adminLevel: 'moderator',
  });

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const isPasswordValid = form.password.length >= 8;
  const isSecretValid = form.secretCode.trim().length >= 6;
  const isNameValid = form.full_name.trim().length >= 2;
  const isZNameValid = form.z_name.trim().length >= 2;
  const isLevelValid = ['super', 'admin', 'sub', 'moderator'].includes(form.adminLevel);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid || !isPasswordValid || !isSecretValid || !isNameValid || !isZNameValid || !isLevelValid) {
      setError('Please complete every field with a valid admin email, a strong password, a valid secret code, and a valid role.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          z_name: form.z_name,
          admin_level: form.adminLevel,
          secret_code: form.secretCode,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Admin signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-accent" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">NEW ADMIN</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Request Management Privileges</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">{error}</div>}
          <Input icon={Mail} value={form.email} onChange={(v: string) => { setForm({ ...form, email: v }); setError(''); }} placeholder="Work Email" invalid={form.email.length > 0 && !isEmailValid} />
          <Input icon={User} value={form.full_name} onChange={(v: string) => { setForm({ ...form, full_name: v }); setError(''); }} placeholder="Full Name" invalid={form.full_name.length > 0 && !isNameValid} />
          <Input icon={User} value={form.z_name} onChange={(v: string) => { setForm({ ...form, z_name: v }); setError(''); }} placeholder="Display / Z Name" invalid={form.z_name.length > 0 && !isZNameValid} />
          <Input icon={Lock} type="password" value={form.password} onChange={(v: string) => { setForm({ ...form, password: v }); setError(''); }} placeholder="Create Password" invalid={form.password.length > 0 && !isPasswordValid} />
          <Input icon={BadgeCheck} value={form.adminLevel} onChange={(v: string) => { setForm({ ...form, adminLevel: v }); setError(''); }} placeholder="admin / sub / moderator / super" invalid={!isLevelValid} />
          <Input icon={Key} value={form.secretCode} onChange={(v: string) => { setForm({ ...form, secretCode: v }); setError(''); }} placeholder="Super Secret Code" invalid={form.secretCode.length > 0 && !isSecretValid} />
          <button type="submit" disabled={loading || !isEmailValid || !isPasswordValid || !isSecretValid || !isNameValid || !isZNameValid || !isLevelValid} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50">
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

function Input({ icon: Icon, value, onChange, placeholder, type = 'text', invalid = false }: { icon: any; value: string; onChange: (value: string) => void; placeholder: string; type?: string; invalid?: boolean }) {
  return (
    <div className="relative group">
      <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 ${invalid ? 'text-red-400' : 'text-white/20'}`} size={20} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:bg-white/10 transition-all font-medium ${invalid ? 'border-red-500/40 focus:border-red-400' : 'border-white/10 focus:border-accent'}`}
      />
    </div>
  );
}
