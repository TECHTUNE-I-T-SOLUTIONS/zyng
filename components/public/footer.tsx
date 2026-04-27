
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/logo';

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

export default function Footer() {
  return (
    <div className="py-20 border-t border-border px-6 bg-background relative overflow-hidden">
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
          {/* <div className="flex gap-6">
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
              <LayoutDashboard size={14} className="text-accent" /> Designed by {' '}
              <Link href="https://techtune.me" className='text-accent hover:underline transition-all cursor-pointer'>
                TechTune
              </Link>
            </span>
          </div> */}
        </div>
      </div>
    );
  }
  
