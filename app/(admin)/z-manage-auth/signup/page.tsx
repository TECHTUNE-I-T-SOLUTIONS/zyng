'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Mail, Key, User, Loader2, BadgeCheck, Hash } from 'lucide-react';
import Link from 'next/link';

export default function AdminSignup() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    secretCode: '',
    full_name: '',
    z_name: '',
    adminLevel: 'moderator',
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
          <Input icon={Mail} value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} placeholder="Work Email" />
          <Input icon={User} value={form.full_name} onChange={(v: string) => setForm({ ...form, full_name: v })} placeholder="Full Name" />
          <Input icon={User} value={form.z_name} onChange={(v: string) => setForm({ ...form, z_name: v })} placeholder="Display / Z Name" />
          <Input icon={Lock} type="password" value={form.password} onChange={(v: string) => setForm({ ...form, password: v })} placeholder="Create Password" />
          <Input icon={BadgeCheck} value={form.adminLevel} onChange={(v: string) => setForm({ ...form, adminLevel: v })} placeholder="admin / sub / moderator / super" />
          <Input icon={Key} value={form.secretCode} onChange={(v: string) => setForm({ ...form, secretCode: v })} placeholder="Super Secret Code" />
          <button type="submit" disabled={loading} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50">
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

function Input({ icon: Icon, value, onChange, placeholder, type = 'text' }: { icon: any; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-accent focus:bg-white/10 transition-all font-medium"
      />
    </div>
  );
}
