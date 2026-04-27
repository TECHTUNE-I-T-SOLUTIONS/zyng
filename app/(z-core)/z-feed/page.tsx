'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePosts } from '@/hooks/usePosts';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, Loader2, Plus, XCircle } from 'lucide-react';
import { Post } from '@/types';

export default function ZFeed() {
  const [filter, setFilter] = useState<'trending' | 'latest' | 'pulse'>('trending');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex gap-8 h-full items-end">
          {['trending', 'latest', 'pulse'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`text-xs font-black uppercase tracking-widest pb-5 border-b-2 transition-all ${
                filter === f ? 'border-accent text-accent' : 'border-transparent text-foreground/40 hover:text-foreground'
              }`}
            >
              {f === 'trending' ? 'Zynging Now' : f}
            </button>
          ))}
        </div>
        <Link 
          href="/z-create"
          className="bg-accent text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-tight shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/40 transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          Drop a Zyng
        </Link>
      </header>

      {/* Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <FeedList filter={filter} />
      </div>
    </div>
  );
}

function FeedList({ filter }: { filter: string }) {
  const { data: posts, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Syncing with Campus...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
          <XCircle size={32} />
        </div>
        <h3 className="text-lg font-bold text-red-500">Sync Error</h3>
        <p className="text-foreground/40 text-sm mt-1">Unable to fetch latest Zyngs.</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center text-foreground/20 mb-6">
          <MessageSquare size={40} />
        </div>
        <h3 className="text-2xl font-black tracking-tight mb-2">Campus is quiet...</h3>
        <p className="text-foreground/40 font-medium max-w-xs italic mx-auto">
          Be the first Zynger to speak. Drop a anonymous Zyng and start the conversation.
        </p>
        <Link 
          href="/z-create"
          className="mt-8 inline-flex items-center gap-2 bg-muted border border-border px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-black hover:border-accent transition-all"
        >
          <Plus size={18} /> Start Zynging
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AnimatePresence mode="popLayout">
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-muted/40 border border-border rounded-[2rem] p-8 hover:border-accent/30 hover:bg-muted/60 transition-all group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-lg">
            {post.type === 'confession' ? '🤫' : post.type === 'hot_take' ? '🔥' : '👋'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-black text-foreground/80 italic">
                {post.persona?.name || 'Anonymous Zynger'}
              </div>
              {post.user?.status === 'alumni' && (
                <div className="bg-indigo-500/10 text-indigo-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-tighter">
                  Alumni
                </div>
              )}
            </div>
            <div className="text-[10px] text-foreground/30 uppercase font-black tracking-tight">
              {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Unilorin
            </div>
          </div>
        </div>
        <span className="text-[10px] font-black text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full uppercase tracking-widest">
          {post.type}
        </span>
      </div>

      <Link href={`/z-post/${post.id}`} className="block">
        <p className="text-lg leading-relaxed text-foreground/90 font-medium">
          {post.content}
        </p>
      </Link>

      <div className="mt-8 pt-6 border-t border-border/50 flex items-center gap-8">
        <button className="flex items-center gap-2 text-xs font-black text-foreground/40 hover:text-accent transition-all">
          <ThumbsUp size={18} />
          <span>Like</span>
        </button>
        <Link 
          href={`/z-post/${post.id}`}
          className="flex items-center gap-2 text-xs font-bold text-foreground/40 hover:text-foreground transition-all"
        >
          <MessageSquare size={18} />
          <span>Comment</span>
        </Link>
      </div>
    </motion.article>
  );
}
