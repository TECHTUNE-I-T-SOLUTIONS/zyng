'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Footer from '@/components/public/footer';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/services/userService';

const publicNav = [
  { name: 'Features', href: '/features' },
  { name: 'About', href: '/about' },
  { name: 'Help', href: '/faq' },
];

// const footerLinks = [
//   { name: 'Terms', href: '/terms' },
//   { name: 'Privacy', href: '/privacy' },
//   { name: 'Feedback', href: '/feedback' },
//   { name: 'Contact', href: '/contact' },
// ];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: user } = useQuery({
    queryKey: ['public-layout-me'],
    queryFn: () => userService.getCurrentUser(),
  });
  const dashboardHref = user?.status === 'alumni' ? '/z-alumni/feed' : '/z-feed';

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
              href={user ? dashboardHref : '/in/signup'}
              className="text-xs font-black uppercase tracking-widest px-6 py-2.5 bg-accent text-black rounded-full shadow-lg shadow-accent/20 hover:scale-105 transition-all text-center"
            >
              {user ? 'Zyng' : 'Join'}
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

      <Footer />
    </div>
  );
}
