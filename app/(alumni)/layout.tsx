'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/services/userService';
import { GraduationCap, Briefcase, Globe, MessageCircle, Settings, LogOut, ChevronRight, Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlumniLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { data: user } = useQuery({ queryKey: ['alumni-me'], queryFn: () => userService.getCurrentUser() });

  const navItems = [
    { name: 'Global Feed', href: '/z-alumni/feed', icon: Globe },
    { name: 'Opportunities', href: '/z-alumni/jobs', icon: Briefcase },
    { name: 'Zing', href: '/z-alumni/messages', icon: MessageCircle },
    { name: 'Portfolio', href: '/z-alumni/profile', icon: GraduationCap },
  ];

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden font-sans">
      <aside className="w-72 border-r border-white/5 flex flex-col shrink-0 bg-black">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-indigo-400">ZYNG ALUMNI</h1>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Professional Mode</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${pathname === item.href ? 'bg-indigo-500 text-white font-black shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="text-sm uppercase tracking-widest font-bold">{item.name}</span>
                </div>
                <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${pathname === item.href ? 'text-white' : ''}`} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status</div>
            <div className="text-sm font-bold">{user?.status === 'alumni' ? 'Verified Alumni' : 'Pending Alumni Review'}</div>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-black uppercase tracking-widest text-xs"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_50%)]">
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/30 backdrop-blur-xl">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400" size={18} />
            <input
              type="text"
              placeholder="Search Professional Network..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2 text-white/40 hover:text-white transition-colors relative">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>
            <button className="p-2 text-white/40 hover:text-white transition-colors">
              <Settings size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 ml-4 flex items-center justify-center text-xs font-black">
              {user?.z_name?.slice(0, 1)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-neutral-900 border border-white/10 p-8 rounded-[2.5rem] text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">End Session?</h2>
              <p className="text-white/40 text-sm mb-8 font-medium italic">Your professional profile will stay visible to recruiters.</p>
              <div className="flex flex-col gap-3">
                <button className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20" onClick={() => window.location.href = '/in/login'}>
                  Confirm Sign Out
                </button>
                <button className="w-full bg-white/5 text-white/40 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:text-white transition-all" onClick={() => setShowLogoutModal(false)}>
                  Stay Active
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
