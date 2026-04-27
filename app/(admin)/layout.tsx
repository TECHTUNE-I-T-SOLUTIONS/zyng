'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  Users, 
  FileWarning, 
  Settings, 
  Activity, 
  LogOut, 
  Search,
  Bell,
  ChevronRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Don't show sidebar on auth pages
  if (pathname.includes('/z-manage-auth')) {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Overview', href: '/z-manage/dashboard', icon: Activity },
    { name: 'Zyngers', href: '/z-manage/users', icon: Users },
    { name: 'Content', href: '/z-manage/content', icon: FileWarning },
    { name: 'Platform', href: '/z-manage/system', icon: Settings },
    { name: 'Database', href: '/z-manage/db', icon: Database },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Admin Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col shrink-0 bg-neutral-950">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <Shield size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter">Z-MANAGE</h1>
              <div className="text-[10px] font-black text-accent uppercase tracking-widest">
                Control Panel
              </div>
            </div>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                  pathname === item.href 
                    ? 'bg-accent text-black font-black' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="text-sm uppercase tracking-widest font-bold">{item.name}</span>
                </div>
                <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${pathname === item.href ? 'text-black' : ''}`} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-black uppercase tracking-widest text-xs"
          >
            <LogOut size={20} />
            Exit Session
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Header */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-neutral-950/50 backdrop-blur-xl">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent" size={18} />
            <input 
              type="text" 
              placeholder="Search Zyngers, Zyngs, or Reports..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-accent transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-white/40 hover:text-white transition-colors">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
            </button>
            
            <div className="flex items-center gap-4 pl-6 border-l border-white/5">
              <div className="text-right">
                <div className="text-sm font-black tracking-tight">Super Admin</div>
                <div className="text-[10px] font-black text-accent uppercase">Global Level</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-neutral-900 border border-white/10 p-8 rounded-[2.5rem] text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">End Session?</h2>
              <p className="text-white/40 text-sm mb-8 font-medium italic">You will need to re-authenticate to access the management panel.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all"
                  onClick={() => window.location.href = '/z-manage-auth/login'}
                >
                  Yes, Sign Out
                </button>
                <button 
                  className="w-full bg-white/5 text-white/40 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:text-white transition-all"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Stay Connected
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
