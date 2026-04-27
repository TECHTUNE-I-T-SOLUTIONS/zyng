'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePosts } from '@/hooks/usePosts';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, Loader2, Plus, GraduationCap } from 'lucide-react';
import { Post } from '@/types';

export default function AlumniFeed() {
  const [filter, setFilter] = useState<'trending' | 'latest' | 'global'>('trending');

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-950">
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex gap-8 h-full items-end">
          {['trending', 'latest', 'global'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`text-[10px] font-black uppercase tracking-[0.2em] pb-5 border-b-2 transition-all ${
                filter === f ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/20 hover:text-white'
              }`}
            >
              {f === 'global' ? 'Global Network' : f}
            </button>
          ))}
        </div>
        <Link
          href="/z-alumni/create"
          className="bg-indigo-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={14} />
          Broadcast Zyng
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-[2.5rem] mb-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap size={24} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400">Professional Feed</h2>
              <p className="text-[10px] text-white/40 font-medium italic">Connecting Unilorin Graduates worldwide.</p>
            </div>
          </div>

          <AlumniPostList filter={filter} />
        </div>
      </div>
    </div>
  );
}

function AlumniPostList({ filter }: { filter: string }) {
  const { data: posts, isLoading } = usePosts();

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-6">
      {posts?.map((post, i) => (
        <motion.article
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:border-indigo-500/30 transition-all group"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                {post.persona?.name?.[0] || 'A'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold italic">@{post.persona?.name || 'Anonymous'}</span>
                  <span className="bg-indigo-500/10 text-indigo-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-indigo-500/20">Alumni</span>
                </div>
                <div className="text-[9px] text-white/20 uppercase font-black">Lagos, Nigeria • {new Date(post.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          <p className="text-white/80 text-lg leading-relaxed font-medium italic mb-8">"{post.content}"</p>
          <div className="flex items-center gap-8 pt-6 border-t border-white/5">
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-indigo-400 transition-all">
              <ThumbsUp size={16} /> Zync
            </button>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all">
              <MessageSquare size={16} /> Zing
            </button>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
