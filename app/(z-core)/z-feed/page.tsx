'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/components/toast';
import Link from 'next/link';
import { usePosts } from '@/hooks/usePosts';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, Loader2, Plus, XCircle, Flame, Clock, Activity } from 'lucide-react';
import { Share2, Send } from 'lucide-react';
import { Post } from '@/types';
import { postService } from '@/lib/services/postService';
import { react as reactService } from '@/lib/services/reactionService';
import { userService } from '@/lib/services/userService';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

export default function ZFeed() {
  const [filter, setFilter] = useState<'trending' | 'latest' | 'pulse'>('trending');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-2 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        {/* Tabs: icons or small text on mobile, full text on desktop */}
        <div className="flex gap-4 md:gap-8 h-full items-end">
          {[
            { key: 'trending', label: 'Zynging Now', icon: <Flame size={18} /> },
            { key: 'latest', label: 'Latest', icon: <Clock size={18} /> },
            { key: 'pulse', label: 'Pulse', icon: <Activity size={18} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex flex-col items-center md:block text-[11px] md:text-xs font-black uppercase tracking-widest pb-2 md:pb-5 border-b-2 transition-all ${
                filter === tab.key ? 'border-accent text-accent' : 'border-transparent text-foreground/40 hover:text-foreground'
              }`}
            >
              <span className="md:hidden">{tab.icon}</span>
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden mt-0.5">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
        {/* Hide '+ Drop a Zyng' button on mobile, show on desktop */}
        <Link
          href="/z-create"
          className="hidden md:flex bg-accent text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-tight shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/40 transition-all items-center gap-2"
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
        <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Syncing with Zyng...</p>
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
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [localReplies, setLocalReplies] = useState(post.replies || []);
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const qc = useQueryClient();
  const toast = useToast();

  const reactionTypes = [
    { key: 'like', emoji: '👍', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/thumbs_up.gif' },
    { key: 'love', emoji: '❤️', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/smiling_face_with_heart_eyes.gif' },
    { key: 'laugh', emoji: '😂', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/face_with_tears_of_joy.gif' },
    { key: 'cry', emoji: '😢', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/crying_face.gif' },
    { key: 'boo', emoji: '😡', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/face_with_steam_from_nose.gif' },
  ];

  const userReaction = (post.reactions || []).find((r:any) => r.user_id === me?.id);
  const [showPicker, setShowPicker] = useState(false);
  const hoverTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const touchTimer = useRef<number | null>(null);

  const handleShare = async () => {
    const url = `${window.location.origin}/z-post/${post.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Check this Zyng', url }); return; } catch (e) { /* fallthrough */ }
    }
    await navigator.clipboard.writeText(url);
    toast.show('Post link copied to clipboard', 'success');
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      // choose first persona if available
      const personaId = me?.personas?.[0]?.id || post.persona?.id || null;
      if (!personaId) {
        toast.show('No persona available to post as', 'error');
        return;
      }
      const newReply = await postService.createReply(post.id, personaId, commentText.trim());
      setLocalReplies((s) => [...(s || []), newReply]);
      setCommentText('');
      setShowComments(true);
    } catch (err) {
      console.error('Failed to post comment', err);
      toast.show('Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReact = async (type: string) => {
    if (!me?.id) { toast.show('Login to react', 'info'); return; }
    // optimistic update
    const prevPosts = qc.getQueryData<any[]>(['posts']);
    const prevPost = qc.getQueryData(['post', post.id]);
    const userId = me.id;
    const applyOptimistic = () => {
      // update posts list
      if (prevPosts) {
        qc.setQueryData(['posts'], prevPosts.map((p) => {
          if (p.id !== post.id) return p;
          const reactions = Array.isArray(p.reactions) ? [...p.reactions] : [];
          const existing = reactions.find((r:any) => r.user_id === userId);
          if (existing) {
            if (existing.type === type) {
              // toggle off
              const idx = reactions.findIndex((r:any) => r.user_id === userId);
              if (idx >= 0) reactions.splice(idx, 1);
            } else {
              existing.type = type;
            }
          } else {
            reactions.push({ user_id: userId, type });
          }
          return { ...p, reactions };
        }));
      }
      // update single post
      if (prevPost) {
        const p = prevPost as any;
        const reactions = Array.isArray(p.reactions) ? [...p.reactions] : [];
        const existing = reactions.find((r:any) => r.user_id === userId);
        if (existing) {
          if (existing.type === type) {
            const idx = reactions.findIndex((r:any) => r.user_id === userId);
            if (idx >= 0) reactions.splice(idx, 1);
          } else { existing.type = type; }
        } else { reactions.push({ user_id: userId, type }); }
        qc.setQueryData(['post', post.id], { ...p, reactions });
      }
    };

    try {
      applyOptimistic();
      await reactService({ post_id: post.id, type }, me?.id);
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['post', post.id] });
    } catch (err) {
      console.error('react failed', err);
      // rollback
      qc.setQueryData(['posts'], prevPosts);
      qc.setQueryData(['post', post.id], prevPost);
    }
  };

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
              {post.user?.z_name && (
                <div className="text-[11px] text-foreground/40">@{post.user.z_name}</div>
              )}
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

      {post.hashtags && post.hashtags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.hashtags.map((h: string) => (
            <Link key={h} href={`/z-search?q=${encodeURIComponent(h)}`} className="inline-flex items-center gap-2 text-sm font-black text-accent hover:underline">
              #{h}
            </Link>
          ))}
        </div>
      )}

      {post.media_urls && post.media_urls.length > 0 && (
        <div className="mt-6 grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {post.media_urls.map((url, i) => (
            <img key={i} src={url} alt={`post-image-${i}`} className="w-full h-56 object-cover rounded-xl" />
          ))}
        </div>
      )}

        <div className="mt-8 pt-6 border-t border-border/50 flex items-center gap-4 relative">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 text-xs font-black ${userReaction ? 'text-accent' : 'text-foreground/40'}`}>
                <div className="relative inline-block"
                  onMouseEnter={() => { if (hideTimer.current) { window.clearTimeout(hideTimer.current); hideTimer.current = null; } hoverTimer.current = window.setTimeout(() => setShowPicker(true), 350) as unknown as number; }}
                  onMouseLeave={() => { if (hoverTimer.current) { window.clearTimeout(hoverTimer.current); hoverTimer.current = null; } hideTimer.current = window.setTimeout(() => setShowPicker(false), 1800) as unknown as number; }}
                  onTouchStart={() => { touchTimer.current = window.setTimeout(() => { setShowPicker(true); if (navigator.vibrate) navigator.vibrate(10); }, 600) as unknown as number; }}
                  onTouchEnd={() => { if (touchTimer.current) { window.clearTimeout(touchTimer.current); touchTimer.current = null; } }}
                >
                  <button onClick={() => handleReact('like')} className="flex items-center gap-2 relative">
                    {userReaction ? (
                      <img src={reactionTypes.find(r => r.key === (userReaction as any).type)?.emojiUrl} alt={(userReaction as any).type} className="w-6 h-6 rounded" />
                    ) : (
                      <ThumbsUp size={18} />
                    )}
                  </button>
                  {/* {showPicker && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }} className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-background border border-border rounded-3xl p-2 flex gap-2 shadow-lg">
                      {reactionTypes.map((t) => (
                        <motion.button key={t.key} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => { handleReact(t.key); setShowPicker(false); }} className="text-lg px-2">
                          <motion.img src={t.emojiUrl} alt={t.key} className="w-6 h-6 rounded" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.18 }} />
                        </motion.button>
                      ))}
                    </motion.div>
                  )} */}
                </div>

                {/* aggregated counts: show small badges for each reaction type with count > 0 */}
                <div className="flex items-center gap-1">
                  {reactionTypes.map((t) => {
                    const cnt = (post.reactions || []).filter((r:any) => r.type === t.key).length;
                    return cnt > 0 ? (
                      <div key={t.key} className="inline-flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-full text-[11px]">
                        <img src={t.emojiUrl} alt={t.key} className="w-4 h-4" />
                        <span className="font-black">{cnt}</span>
                      </div>
                    ) : null;
                  })}
                </div>
            </div>
            <button onClick={() => setShowComments((s) => !s)} className="flex items-center gap-2 text-xs font-bold text-foreground/40 hover:text-foreground transition-all">
              <MessageSquare size={18} />
              <span>Comment</span>
            </button>
          </div>

          <button title="Share" onClick={handleShare} className="flex items-center gap-2 text-xs font-bold text-foreground/40 hover:text-foreground transition-all ml-auto">
            <Share2 size={18} />
          </button>

          {/* Reaction picker with animation, stays close to like button */}
          <AnimatePresence>
            {showPicker && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }} className="absolute bottom-4 left-8 transform translate-y-[-6px] -translate-x-1/4 bg-background border border-border rounded-3xl p-2 flex gap-2 shadow-lg">
                {reactionTypes.map((t) => (
                  <motion.button key={t.key} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => { handleReact(t.key); setShowPicker(false); }} className="text-lg px-2">
                    <motion.img src={t.emojiUrl} alt={t.key} className="w-6 h-6 rounded" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.18 }} />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="mt-4">
            <div className="space-y-3">
              {localReplies && localReplies.length > 0 ? localReplies.map((r: any) => (
                <div key={r.id} className="bg-muted/30 border border-border rounded-2xl p-3">
                  <div className="text-xs font-black italic">{r.persona?.name || 'Anonymous'} • <span className="text-[10px] text-foreground/40">{new Date(r.created_at).toLocaleTimeString()}</span></div>
                  <div className="text-sm mt-2">{r.content}</div>
                </div>
              )) : (<div className="text-foreground/40 text-sm">No comments yet.</div>)}

              <div className="flex gap-2 mt-2">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 p-3 rounded-xl border border-border bg-background" />
                <button onClick={handleSubmitComment} disabled={submittingComment} className="px-4 py-2 rounded-xl bg-accent text-black font-black">{submittingComment ? 'Sending...' : 'Send'}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
