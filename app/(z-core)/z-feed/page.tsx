'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ZFeed() {
  const [filter, setFilter] = useState<'trending' | 'latest' | 'pulse'>('trending');

  return (
    <>
      {/* Top Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex gap-8 h-full items-end">
          {['trending', 'latest', 'pulse'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`text-xs font-black uppercase tracking-widest pb-5 border-b-2 transition-all ${
                filter === f ? 'border-accent text-accent' : 'border-transparent text-foreground/40 hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Link 
          href="/z/create"
          className="bg-accent text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-tight shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/40 transition-all"
        >
          Drop a Zyng
        </Link>
      </header>

      {/* Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <FeedList filter={filter} />
      </div>
    </>
  );
}

function FeedList({ filter }: { filter: string }) {
  // Cursor-based pagination will go here
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Example Posts */}
      <article className="bg-muted/40 border border-border rounded-2xl p-6 hover:border-border/80 transition-all group">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs">🤫</div>
            <span className="text-sm font-bold text-foreground/80 italic">Anon_Heart</span>
            <span className="text-[10px] text-foreground/30 uppercase font-black">1h ago</span>
          </div>
          <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-1 rounded uppercase tracking-tighter">Confession</span>
        </div>
        <p className="text-base leading-relaxed text-foreground/90">
          To the girl in the red hoodie at the Library Cafe: I&apos;ve seen you study every Friday for two months. You look like you need a hug and a large latte. One day I&apos;ll find the courage to buy you one.
        </p>
        <div className="mt-6 pt-4 border-t border-border flex gap-6">
          <button className="flex items-center gap-2 text-xs font-black text-accent hover:scale-105 transition-transform">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path></svg>
            241
          </button>
          <button className="flex items-center gap-2 text-xs font-bold text-foreground/40 hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            12 Replies
          </button>
        </div>
      </article>

      <article className="bg-muted/40 border border-border rounded-2xl p-6 group">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">👾</div>
            <span className="text-sm font-bold text-foreground/80">CipherPanda</span>
            <span className="text-[10px] text-foreground/30 uppercase font-black">12m ago</span>
          </div>
          <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded uppercase tracking-tighter">Poll</span>
        </div>
        <h3 className="text-lg font-bold mb-6 italic tracking-tight">The new Physics lecturer actually makes sense? or am I just tired?</h3>
        <div className="space-y-3">
          <div className="w-full bg-muted border border-border rounded-xl p-4 flex justify-between relative overflow-hidden group cursor-pointer hover:bg-muted/80 transition-all">
            <div className="absolute left-0 top-0 h-full bg-accent/10 w-[74%]" />
            <span className="relative z-10 font-bold text-sm">He&apos;s a genius.</span>
            <span className="relative z-10 font-black text-accent">74%</span>
          </div>
          <div className="w-full bg-muted border border-border rounded-xl p-4 flex justify-between relative overflow-hidden group cursor-pointer hover:bg-muted/80 transition-all">
            <div className="absolute left-0 top-0 h-full bg-foreground/5 w-[26%]" />
            <span className="relative z-10 font-bold text-sm opacity-60">We&apos;re all just tired.</span>
            <span className="relative z-10 font-black opacity-30">26%</span>
          </div>
        </div>
      </article>
    </div>
  );
}
