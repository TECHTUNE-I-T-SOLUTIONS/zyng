'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Rss, 
  PlusSquare, 
  UserCircle, 
  MessageSquare, 
  Flame, 
  TrendingUp,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export default function ZLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Feed', href: '/z/feed', icon: Rss },
    { name: 'Rooms', href: '/z/rooms', icon: MessageSquare },
    { name: 'Hot Takes', href: '/z/hot-takes', icon: Flame },
    { name: 'Confessions', href: '/z/confessions', icon: Zap },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col p-6 shrink-0">
        <div className="mb-10">
          <Link href="/z/feed">
            <h1 className="text-accent text-3xl font-black tracking-tighter">ZYNG</h1>
          </Link>
          <div className="text-[10px] uppercase tracking-widest text-accent/60 font-bold mt-1">
            UNILORIN Campus
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all border-l-4",
                pathname === item.href 
                  ? "bg-muted text-accent border-accent" 
                  : "text-foreground/60 border-transparent hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={20} />
              <span className="font-semibold">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Persona Switcher Stub */}
        <div className="mt-auto pt-6 border-t border-border">
          <Link href="/z/personas" className="group">
            <div className="bg-gradient-to-tr from-accent/20 to-transparent p-4 rounded-2xl border border-accent/10 group-hover:border-accent/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-black">
                  G
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">GhostBoi_24</div>
                  <div className="text-[10px] text-accent uppercase font-bold tracking-tight">
                    Trust: 4,820
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>

      {/* Right Sidebar - Desktop Only */}
      <aside className="w-72 border-l border-border p-6 flex flex-col shrink-0 hidden lg:flex">
        <section className="mb-8">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-foreground/30 mb-4 flex items-center gap-2">
            <TrendingUp size={12} /> Campus Trends
          </h2>
          <div className="space-y-4">
            {['#MidtermMeltdown', '#EngineeringFair', '#CafePrices'].map((tag) => (
              <div key={tag} className="group cursor-pointer">
                <div className="text-sm font-bold group-hover:text-accent transition-colors">{tag}</div>
                <div className="text-[10px] text-foreground/40">1.2k Zyngs</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-foreground/30 mb-4">Live Pulse</h2>
          <div className="bg-muted rounded-2xl p-4 border border-border">
            <div className="text-xs mb-2 flex justify-between">
              <span className="opacity-60">Campus Mood</span>
              <span className="text-accent font-bold">Electric</span>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                className="h-full bg-gradient-to-r from-orange-500 to-accent" 
              />
            </div>
            <div className="text-[10px] text-foreground/30 mt-2">Based on 4.5k interactions</div>
          </div>
        </section>

        <div className="mt-auto">
           <div className="text-[10px] text-foreground/40 font-medium mb-3">You have <span className="text-accent">3 Invites</span> left.</div>
           <button className="w-full bg-muted border border-border rounded-xl py-3 text-[10px] font-black hover:bg-muted/80 transition-all uppercase tracking-widest text-foreground">
             Share the Invite
           </button>
        </div>
      </aside>
    </div>
  );
}
