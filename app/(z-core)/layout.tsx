'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { trendsService } from '@/lib/services/trendsService';
import { 
  Rss, 
  MessageSquare, 
  TrendingUp,
  Zap,
  Briefcase,
  Search,
  Bell,
  LogOut,
  Briefcase as Jobs,
  Mail,
  Users,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/components/toast';
import { cn } from '@/lib/utils';
import { userService } from '@/lib/services/userService';
import { ThemeToggle } from '@/components/theme-toggle';
import { useEffect } from 'react';

export default function ZLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // removed debug UI state
  const { data: user } = useQuery({ 
    queryKey: ['z-layout-me'], 
    queryFn: () => userService.getCurrentUser() 
  });

  const { data: trends, error: trendsError, isLoading } = useQuery({ queryKey: ['trending_hashtags'], queryFn: () => trendsService.getTrendingHashtags(), staleTime: 0, refetchOnMount: true });
  const { data: mood, error: moodError } = useQuery<any>({ queryKey: ['platform_mood'], queryFn: () => trendsService.getPlatformMood(), initialData: null });
  const [trendsLocal, setTrendsLocal] = useState<any[] | null>(null);

  const toast = useToast();

  if (trendsError) console.error('[ZLayout] trends query error', trendsError);
  if (moodError) console.error('[ZLayout] mood query error', moodError);
  if (Array.isArray(trends) && trends.length > 0) console.debug('[ZLayout] trends (client) count', trends.length, trends.slice(0,5));

  // also fetch directly into local state to ensure UI updates
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await trendsService.getTrendingHashtags(10);
        if (mounted) setTrendsLocal(Array.isArray(r) ? r : []);
      } catch (err) {
        if (mounted) setTrendsLocal([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const shareInvite = async () => {
    const code = user?.referral_code || 'ZYNG-USER-XXXX';
    const url = `${window.location.origin}/in/signup?ref=${encodeURIComponent(code)}`;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: 'Join Zyng', text: 'Join Zyng with my referral code', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.show('Invite link copied to clipboard', 'success');
      }
    } catch (err) {
      const [showDebug, setShowDebug] = useState(false); // Debug UI state
      try { await navigator.clipboard.writeText(url); toast.show('Invite link copied to clipboard', 'success'); } catch {}
    }
  };

  // Main bottom nav
  const navItems = [
    { name: 'Feed', href: '/z-feed', icon: Rss },
    { name: 'Pro Hub', href: '/z-pro', icon: Briefcase },
    { name: 'Rooms', href: '/z-rooms', icon: MessageSquare },
    { name: 'Events', href: '/z-events', icon: TrendingUp },
    { name: 'Marketplace', href: '/z-marketplace', icon: Zap },
  ];
  // Sidebar-only links (not in bottom nav)
  const sidebarLinks = [
    { name: 'Jobs', href: '/z-jobs', icon: Jobs },
    { name: 'Messages', href: '/z-messages', icon: Mail },
    { name: 'Notifications', href: '/z-notifications', icon: Bell },
    { name: 'Referrals', href: '/z-referral', icon: Gift },
    { name: 'Profile', href: '/z-profile', icon: Users },
  ];
  // All links for desktop sidebar (main + sidebar)
  const allSidebarLinks = [
    ...navItems,
    ...sidebarLinks,
  ];

  return (
    <div className={cn("flex h-screen bg-background text-foreground font-sans", mobileSidebarOpen ? "overflow-hidden" : "")}> 

      {/* Mobile Sidebar Toggle Button (only one, in header) */}

      {/* Sidebar (Desktop & Mobile) */}
      <aside
        className={
          cn(
            "w-64 border-r border-border flex flex-col p-6 shrink-0 bg-background z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:flex",
            mobileSidebarOpen ? "fixed top-0 left-0 h-full translate-x-0" : "-translate-x-full lg:translate-x-0 hidden"
          )
        }
        style={{
          boxShadow: mobileSidebarOpen ? '0 2px 16px 0 rgba(0,0,0,0.12)' : undefined,
          pointerEvents: mobileSidebarOpen ? 'auto' : 'auto',
        }}
      >
        {/* Close button for mobile */}
        <div className="flex justify-between items-center mb-10 lg:mb-10">
          <Link href="/z-feed" onClick={() => setMobileSidebarOpen(false)}>
            <h1 className="text-accent text-3xl font-black tracking-tighter">ZYNG</h1>
          </Link>
          <button
            className="lg:hidden text-foreground/60 hover:text-accent p-2"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        {/* <div className="text-[10px] uppercase tracking-widest text-accent/60 font-bold mt-1 mb-6 lg:mb-1">UNILORIN Campus</div> */}
        {/* Sidebar links: mobile = sidebarLinks, desktop = allSidebarLinks */}
        <nav className="space-y-2 flex-1">
          {(mobileSidebarOpen ? sidebarLinks : allSidebarLinks).map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all border-l-4 text-sm",
                pathname === item.href 
                  ? "bg-muted text-accent border-accent" 
                  : "text-foreground/60 border-transparent hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={18} />
              <span className="font-semibold">{item.name}</span>
            </Link>
          ))}
        </nav>
        {/* Zync (Persona) Switcher - Desktop sidebar only */}
        <div className="mt-8 pt-6 border-t border-border hidden lg:block">
          <Link href="/z-personas" className="group">
            <div className="bg-gradient-to-tr from-accent/20 to-transparent p-4 rounded-2xl border border-accent/10 group-hover:border-accent/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-black">
                  {user?.z_name?.[0]?.toUpperCase() || user?.full_name?.[0]?.toUpperCase() || 'Z'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{user?.z_name || user?.full_name || 'Your Persona'}</div>
                  <div className="text-[10px] text-accent uppercase font-bold tracking-tight">
                    Trust: {user?.trust_score ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </aside>
      {/* Main Content */}
      <main className={cn("flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300 relative", mobileSidebarOpen ? "blur-sm pointer-events-none select-none" : "")}> 
        {/* Mobile Top Bar with icons */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-2 py-2 flex justify-between items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-foreground/60 hover:text-accent"
            aria-label="Open menu"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <Link href="/z-feed">
            <h1 className="text-accent text-xl font-black tracking-tighter">ZYNG</h1>
          </Link>
          <div className="flex items-center gap-2">
              <Link href="/z-search" aria-label="Search"><Search size={20} className="text-foreground/60 hover:text-accent" /></Link>
              <Link href="/z-notifications" aria-label="Notifications"><Bell size={20} className="text-foreground/60 hover:text-accent" /></Link>
              <ThemeToggle />
              <Link href="/z-personas" aria-label="Profile">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-black">
                  {user?.z_name?.[0]?.toUpperCase() || user?.full_name?.[0]?.toUpperCase() || 'Z'}
                </div>
              </Link>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
        {/* Floating Action Button for Drop a Zyng (only FAB, no text button) - show only on z-feed */}
        {pathname?.startsWith('/z-feed') && (
          <Link href="/z-create" className="lg:hidden fixed bottom-16 right-4 z-40 bg-accent text-black rounded-full shadow-lg flex items-center justify-center w-14 h-14 text-3xl font-black hover:bg-accent/90 transition-all">
            +
          </Link>
        )}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border flex justify-around items-center py-1 lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 px-1 py-1 text-[11px] font-semibold",
              pathname === item.href ? "text-accent" : "text-foreground/60 hover:text-accent"
            )}
            aria-label={item.name}
          >
            <item.icon size={22} />
            <span className="text-[10px] mt-0.5">{item.name.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>

      {/* Right Sidebar - Desktop Only */}
      <aside className="w-72 border-l border-border p-6 flex flex-col shrink-0 hidden lg:flex">
        {/* Desktop Search Bar */}
        <div className="mb-6">
          <form action="/z-search" method="get" className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
            <Search size={18} className="text-foreground/40" />
            <input
              type="text"
              name="q"
              placeholder="Search..."
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </form>
        </div>
        <section className="mb-8">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-foreground/30 mb-4 flex items-center gap-2">
            <TrendingUp size={12} /> Campus Trends
          </h2>
          <div className="space-y-4">
            {(() => {
              const display = trendsLocal ?? trends ?? [];
              if (display.length > 0) return display.map((t: any) => (
                <div key={t.hashtag} className="group cursor-pointer">
                  <div className="text-sm font-bold group-hover:text-accent transition-colors">{t.hashtag}</div>
                  <div className="text-[10px] text-foreground/40">{t.usage_count} Zyngs</div>
                </div>
              ));
              return <div className="text-sm text-foreground/40">{isLoading && !trendsLocal ? 'Loading trends...' : 'No trending hashtags yet.'}</div>;
            })()}
          </div>
        </section>
        {/* debug UI removed */}

        <section className="mb-8">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-foreground/30 mb-4">Live Pulse</h2>
          <div className="bg-muted rounded-2xl p-4 border border-border">
            <div className="text-xs mb-2 flex justify-between">
              <span className="opacity-60">Campus Mood</span>
              <span className="text-accent font-bold">{mood ? (mood.mood_score > 0 ? 'Electric' : (mood.mood_score < 0 ? 'Sour' : 'Neutral')) : 'Neutral'}</span>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${mood?.positive_pct ?? 50}%` }}
                className="h-full bg-gradient-to-r from-orange-500 to-accent" 
              />
            </div>
            <div className="text-[10px] text-foreground/30 mt-2">Based on {mood?.total_posts ?? 0} posts</div>
          </div>
        </section>

        <div className="mt-auto">
           <div className="mb-4">
             <ThemeToggle />
           </div>
           <div className="text-[10px] text-foreground/40 font-medium mb-3">You have <span className="text-accent">3 Invites</span> left.</div>
           <button onClick={shareInvite} className="w-full bg-muted border border-border rounded-xl py-3 text-[10px] font-black hover:bg-muted/80 transition-all uppercase tracking-widest text-foreground">
             Share the Invite
           </button>
        </div>
      </aside>
    </div>
  );
}
