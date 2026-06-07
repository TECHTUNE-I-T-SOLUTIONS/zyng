import Link from 'next/link';
import { Logo } from '@/components/logo';

const publicNav = [
  { name: 'Features', href: '/features' },
  { name: 'About', href: '/about' },
  { name: 'Help', href: '/faq' },
];

const footerLinks = [
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Cookies', href: '/cookies' },
  { name: 'Feedback', href: '/feedback' },
  { name: 'Contact', href: '/contact' },
];

export default function Footer() {
  return (
    <div className="relative overflow-hidden border-t border-border bg-background px-6 py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-3/4 -translate-x-1/2 rounded-full bg-accent/5 blur-[100px]" />

      <div className="relative z-10 mx-auto grid max-w-full grid-cols-1 gap-16 md:grid-cols-4">
        <div className="col-span-1 flex flex-col items-center md:col-span-2 md:items-start">
          <div className="mb-6 flex items-center gap-3">
            <Logo />
            <span className="text-3xl font-black italic tracking-tighter text-accent">ZYNG</span>
          </div>
          <p className="max-w-sm text-center text-sm font-medium leading-relaxed text-foreground opacity-60 md:text-left">
            The semi-anonymous social ecosystem designed exclusively for campus life. Share, connect, and discover what&apos;s happening without the pressure of perfect profiles.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 md:items-start">
          <h4 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-accent">Company</h4>
          {publicNav.map((item) => (
            <Link key={item.href} href={item.href} className="text-[13px] font-bold opacity-60 transition-all hover:text-accent hover:opacity-100">
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 md:items-start">
          <h4 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-accent">Legal</h4>
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="text-[13px] font-bold opacity-60 transition-all hover:text-accent hover:opacity-100">
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-20 flex max-w-full flex-col items-center justify-between gap-6 border-t border-border/50 pt-8 md:flex-row">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
          © {new Date().getFullYear()} Zyng Inc.
        </p>
      </div>
    </div>
  );
}
