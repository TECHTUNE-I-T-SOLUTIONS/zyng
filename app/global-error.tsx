'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { TriangleAlert, Home } from 'lucide-react';

export default function GlobalError({
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
    <html lang="en">
      <body className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
          <TriangleAlert className="mx-auto mb-4 text-red-500" size={36} />
          <h1 className="text-3xl font-black mb-3">Application error</h1>
          <p className="text-white/60 mb-8">The app hit a critical issue. Please retry or return to safety.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => reset()} className="rounded-2xl bg-accent text-black px-5 py-3 font-black text-xs uppercase tracking-widest">
              Retry
            </button>
            <Link href="/" className="rounded-2xl border border-white/10 px-5 py-3 font-black text-xs uppercase tracking-widest inline-flex items-center justify-center gap-2">
              <Home size={16} />
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
