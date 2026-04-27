'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Search, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-2.5rem)] sm:min-h-[calc(100vh-3rem)] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,rgba(255,184,0,0.08),transparent_40%),linear-gradient(180deg,var(--background),var(--background))]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl border border-border bg-muted/40 backdrop-blur-md rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-10 shadow-2xl"
      >
        <div className="flex items-center gap-3 text-accent mb-6">
          <AlertTriangle size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">404 Not Found</span>
        </div>

        <div className="space-y-4">
          <div className="text-5xl sm:text-6xl font-black tracking-tighter">Page lost in the feed</div>
          <p className="text-foreground/60 max-w-lg">
            The route you tried to open does not exist, may have moved, or may only be available to a different role.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent text-black px-5 py-3 font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.01]">
            <Home size={16} />
            Go Home
          </Link>
          <Link href="/z-search" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.01]">
            <Search size={16} />
            Search Zyng
          </Link>
        </div>

        <button
          onClick={() => history.back()}
          className="mt-4 inline-flex items-center gap-2 text-foreground/50 hover:text-foreground text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Go Back
        </button>
      </motion.div>
    </div>
  );
}
