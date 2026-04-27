'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePost } from '@/hooks/usePosts';
import { motion } from 'framer-motion';
import { MessageSquare, Heart, Share2, MoreHorizontal, Loader2, ArrowLeft } from 'lucide-react';

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: post, isLoading, error } = usePost(id as string);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-red-500 mb-2">Zyng Not Found</h2>
        <p className="text-foreground/40 mb-8">This post might have expired or been removed.</p>
        <button 
          onClick={() => router.back()}
          className="bg-muted border border-border px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-foreground/40 hover:text-foreground mb-8 group transition-all"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Feed</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted border border-border rounded-[2.5rem] p-8 mb-10 shadow-2xl shadow-accent/5"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xl">
              {post.type === 'confession' ? '🤫' : post.type === 'hot_take' ? '🔥' : '👋'}
            </div>
            <div>
              <div className="text-base font-black italic">{post.persona?.name || 'Anonymous'}</div>
              <div className="text-[10px] text-foreground/40 font-black uppercase tracking-tight">
                {new Date(post.created_at).toLocaleString()} • Unilorin
              </div>
            </div>
            <button className="ml-auto text-foreground/40 hover:text-foreground p-2 hover:bg-background/50 rounded-xl transition-all">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <p className="text-xl font-medium leading-relaxed mb-8">
            {post.content}
          </p>

          <div className="flex items-center gap-8 text-foreground/40 border-t border-border/50 pt-6">
            <button className="flex items-center gap-2 hover:text-accent transition-colors">
              <Heart size={20} />
              <span className="text-sm font-black">0</span>
            </button>
            <button className="flex items-center gap-2 hover:text-accent transition-colors">
              <MessageSquare size={20} />
              <span className="text-sm font-black">{post.replies?.length || 0}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-accent transition-colors ml-auto">
              <Share2 size={20} />
            </button>
          </div>
        </motion.div>

        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground/30 px-4">
            REPLIES ({post.replies?.length || 0})
          </h3>
          
          {post.replies && post.replies.length > 0 ? (
            <div className="space-y-4">
              {post.replies.map((reply, i) => (
                <motion.div 
                  key={reply.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-muted/30 border border-border rounded-3xl p-6 ml-4 md:ml-8"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold">
                      {reply.persona?.name?.[0] || 'A'}
                    </div>
                    <div className="text-xs font-black italic">{reply.persona?.name || 'Anonymous'}</div>
                    <div className="text-[10px] text-foreground/30 font-black uppercase tracking-tighter">
                      {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{reply.content}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/20 border border-dashed border-border rounded-3xl">
              <p className="text-foreground/30 text-xs font-black uppercase tracking-widest">No replies yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
