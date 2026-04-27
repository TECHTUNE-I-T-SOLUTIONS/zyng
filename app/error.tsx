'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Home, TriangleAlert } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-2.5rem)] sm:min-h-[calc(100vh-3rem)] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,rgba(255,184,0,0.08),transparent_40%),linear-gradient(180deg,var(--background),var(--background))]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl border border-border bg-muted/40 backdrop-blur-md rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-10 shadow-2xl"
      >
        <div className="flex items-center gap-3 text-red-500 mb-6">
          <TriangleAlert size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Runtime Error</span>
        </div>

        <div className="space-y-4">
          <div className="text-4xl sm:text-5xl font-black tracking-tighter">Something broke in the app shell</div>
          <p className="text-foreground/60">
            This usually means a page, component, or API response did not behave as expected. You can retry, go home, or check the network and auth state.
          </p>
          <pre className="text-xs sm:text-sm text-foreground/60 bg-background/70 border border-border rounded-2xl p-4 overflow-auto">
            {error.message}
          </pre>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent text-black px-5 py-3 font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.01]"
          >
            <RefreshCcw size={16} />
            Try Again
          </button>
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.01]">
            <Home size={16} />
            Go Home
          </Link>
          <Link href="/z-feed" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.01]">
            Back to Feed
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
