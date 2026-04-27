'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          <WifiOff size={36} />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">You are offline</h1>
          <p className="text-foreground/50 max-w-lg mx-auto">
            Zyng is still available in a limited offline mode. Some live data and actions may wait until your connection returns.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-accent text-black font-black uppercase tracking-widest text-xs"
          >
            <RefreshCw size={16} />
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-border font-black uppercase tracking-widest text-xs"
          >
            <Home size={16} />
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
