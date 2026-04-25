'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, Shield, ZapOff, Users, ArrowRight, Menu, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const publicNav = [
  { name: 'Features', href: '/features' },
  { name: 'About', href: '/about' },
  { name: 'Help', href: '/faq' },
];

const footerLinks = [
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Feedback', href: '/feedback' },
  { name: 'Contact', href: '/contact' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  return (
    <div className="min-h-screen max-w-full flex flex-col bg-background text-foreground transition-colors duration-300">
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
        <motion.header
          animate={{
            width: isScrolled ? "min(95%, 900px)" : "100%",
            y: isScrolled ? 16 : 0,
            borderRadius: isScrolled ? 32 : 0,
            borderWidth: isScrolled ? 1 : 0,
            borderBottomWidth: 1,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "pointer-events-auto px-6 py-4 flex justify-between items-center backdrop-blur-lg border-border",
            isScrolled ? "bg-background/80 shadow-2xl shadow-black/5 dark:shadow-white/5" : "bg-background/50"
          )}
        >
          <Link href="/" className="flex items-center gap-3">
            <Logo />
          </Link>

          <nav className="hidden md:flex gap-8 items-center">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-accent transition-all"
              >
                {item.name}
              </Link>
            ))}
            <ThemeToggle />
          </nav>

          <div className="flex gap-3 sm:gap-4 items-center">
            <Link
              href="/in/login"
              className="text-xs hidden md:inline-block font-black uppercase tracking-widest px-6 py-2.5 border border-border rounded-full hover:bg-muted transition-all"
            >
              Login
            </Link>
            <Link
              href="/in/signup"
              className="text-xs font-black uppercase tracking-widest px-6 py-2.5 bg-accent text-black rounded-full shadow-lg shadow-accent/20 hover:scale-105 transition-all text-center"
            >
              Join
            </Link>
            <div className="md:hidden ml-1">
              <ThemeToggle />
            </div>
          </div>
        </motion.header>
      </div>

      <main className="flex-1 pt-[120px]">
        {children}
      </main>

      <footer className="py-20 border-t border-border px-6 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-accent/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
          <div className="flex flex-col items-center md:items-start col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Logo />
              <span className="text-3xl font-black text-accent italic tracking-tighter">ZYNG</span>
            </div>
            <p className="text-sm font-medium opacity-60 leading-relaxed text-foreground max-w-sm text-center md:text-left">
              The semi-anonymous social ecosystem designed exclusively for campus life. Share, connect, and discover what's happening without the pressure of perfect profiles.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent mb-4">Company</h4>
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] font-bold opacity-60 hover:opacity-100 hover:text-accent transition-all"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent mb-4">Legal</h4>
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] font-bold opacity-60 hover:opacity-100 hover:text-accent transition-all"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-full mx-auto mt-20 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
            © {new Date().getFullYear()} Zyng Inc.
          </p>
          <div className="flex gap-6">
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
              <LayoutDashboard size={14} className="text-accent" /> Designed by {' '}
              <Link href="https://techtune.me" className='text-accent hover:underline transition-all cursor-pointer'>
                TechTune
              </Link>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
