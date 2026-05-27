'use client';

import { useMemo, useState, useRef } from 'react';
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
import { Reply } from '@/types';

type ReplyNode = Reply & { children: ReplyNode[] };

const reactionTypes = [
  { key: 'like', emoji: '👍', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/thumbs_up.gif' },
  { key: 'love', emoji: '❤️', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/smiling_face_with_heart_eyes.gif' },
  { key: 'laugh', emoji: '😂', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/face_with_tears_of_joy.gif' },
  { key: 'cry', emoji: '😢', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/crying_face.gif' },
  { key: 'boo', emoji: '😡', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/face_with_steam_from_nose.gif' },
];

const buildReplyTree = (replies: Reply[] = []) => {
  const nodes = new Map<string, ReplyNode>();
  const roots: ReplyNode[] = [];

  replies.forEach((reply) => {
    nodes.set(reply.id, { ...reply, children: [] });
  });

  nodes.forEach((node) => {
    if (node.parent_reply_id && nodes.has(node.parent_reply_id)) {
      nodes.get(node.parent_reply_id)!.children.push(node);
      return;
    }

    roots.push(node);
  });

  const sortNodes = (items: ReplyNode[]) => {
    items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    items.forEach((item) => sortNodes(item.children));
  };

  sortNodes(roots);
  return roots;
};

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
  const [replyText, setReplyText] = useState('');
  const [activeReplyTarget, setActiveReplyTarget] = useState<{ id: string; name: string } | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [localReplies, setLocalReplies] = useState<Reply[]>(post.replies || []);
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const qc = useQueryClient();
  const toast = useToast();
  const [showPicker, setShowPicker] = useState(false);
  const hoverTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const touchTimer = useRef<number | null>(null);

  const replyTree = useMemo(() => buildReplyTree(localReplies), [localReplies]);
  const userReaction = ((post as any).reactions || []).find((r: any) => r.user_id === me?.id);

  const handleShare = async () => {
    const url = `${window.location.origin}/z-post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check this Zyng', url });
        return;
      } catch (e) {
        // fallthrough
      }
    }
    await navigator.clipboard.writeText(url);
    toast.show('Post link copied to clipboard', 'success');
  };

  const applyLocalReplyReaction = (replyId: string, type: string, userId: string) => {
    setLocalReplies((current) => current.map((reply) => {
      if (reply.id !== replyId) return reply;
      const reactions = Array.isArray(reply.reactions) ? [...reply.reactions] : [];
      const existing = reactions.find((reaction) => reaction.user_id === userId);

      if (existing) {
        if (existing.type === type) {
          return {
            ...reply,
            reactions: reactions.filter((reaction) => reaction.user_id !== userId),
          };
        }
        existing.type = type;
        return { ...reply, reactions };
      }

      reactions.push({ user_id: userId, type });
      return { ...reply, reactions };
    }));
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const personaId = me?.personas?.[0]?.id || null;
      if (!personaId) {
        toast.show('No persona available to post as', 'error');
        return;
      }
      const newReply = await postService.createReply(post.id, personaId, commentText.trim(), null);
      setLocalReplies((current) => [...current, newReply]);
      setCommentText('');
      setShowComments(true);
    } catch (err) {
      console.error('Failed to post comment', err);
      toast.show('Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentReplyId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const personaId = me?.personas?.[0]?.id || null;
      if (!personaId) {
        toast.show('No persona available to post as', 'error');
        return;
      }

      const newReply = await postService.createReply(post.id, personaId, replyText.trim(), parentReplyId);
      setLocalReplies((current) => [...current, newReply]);
      setReplyText('');
      setActiveReplyTarget(null);
      setShowComments(true);
    } catch (err) {
      console.error('Failed to post reply', err);
      toast.show('Failed to post reply', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleReact = async (type: string) => {
    if (!me?.id) {
      toast.show('Login to react', 'info');
      return;
    }

    const prevPosts = qc.getQueryData<any[]>(['posts']);
    const prevPost = qc.getQueryData(['post', post.id]);
    const userId = me.id;

    const applyOptimistic = () => {
      if (prevPosts) {
        qc.setQueryData(['posts'], prevPosts.map((item) => {
          if (item.id !== post.id) return item;
          const reactions = Array.isArray(item.reactions) ? [...item.reactions] : [];
          const existing = reactions.find((reaction: any) => reaction.user_id === userId);
          if (existing) {
            if (existing.type === type) {
              const index = reactions.findIndex((reaction: any) => reaction.user_id === userId);
              if (index >= 0) reactions.splice(index, 1);
            } else {
              existing.type = type;
            }
          } else {
            reactions.push({ user_id: userId, type });
          }
          return { ...item, reactions };
        }));
      }

      if (prevPost) {
        const currentPost = prevPost as any;
        const reactions = Array.isArray(currentPost.reactions) ? [...currentPost.reactions] : [];
        const existing = reactions.find((reaction: any) => reaction.user_id === userId);
        if (existing) {
          if (existing.type === type) {
            const index = reactions.findIndex((reaction: any) => reaction.user_id === userId);
            if (index >= 0) reactions.splice(index, 1);
          } else {
            existing.type = type;
          }
        } else {
          reactions.push({ user_id: userId, type });
        }
        qc.setQueryData(['post', post.id], { ...currentPost, reactions });
      }
    };

    try {
      applyOptimistic();
      await reactService({ post_id: post.id, type }, me.id);
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['post', post.id] });
    } catch (err) {
      console.error('react failed', err);
      qc.setQueryData(['posts'], prevPosts);
      qc.setQueryData(['post', post.id], prevPost);
    }
  };

  const handleReplyReact = async (replyId: string, type: string) => {
    if (!me?.id) {
      toast.show('Login to react', 'info');
      return;
    }

    const prevReplies = localReplies;
    applyLocalReplyReaction(replyId, type, me.id);

    try {
      await reactService({ reply_id: replyId, type }, me.id);
    } catch (err) {
      console.error('reply react failed', err);
      setLocalReplies(prevReplies);
      toast.show('Failed to react to reply', 'error');
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-muted/40 border border-border rounded-[2rem] p-8 hover:border-accent/30 hover:bg-muted/60 transition-all group relative overflow-hidden mb-24"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-lg">
            {post.type === 'confession' ? '🤫' : post.type === 'hot_take' ? '🔥' : '👋'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-black text-foreground/80 italic flex items-center gap-2">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.persona?.name || 'anonymous'}`} alt="avatar" className="w-6 h-6 rounded-full bg-background" />
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
            <div
              className="relative inline-block"
              onMouseEnter={() => {
                if (hideTimer.current) {
                  window.clearTimeout(hideTimer.current);
                  hideTimer.current = null;
                }
                hoverTimer.current = window.setTimeout(() => setShowPicker(true), 350) as unknown as number;
              }}
              onMouseLeave={() => {
                if (hoverTimer.current) {
                  window.clearTimeout(hoverTimer.current);
                  hoverTimer.current = null;
                }
                hideTimer.current = window.setTimeout(() => setShowPicker(false), 1800) as unknown as number;
              }}
              onTouchStart={() => {
                touchTimer.current = window.setTimeout(() => {
                  setShowPicker(true);
                  if (navigator.vibrate) navigator.vibrate(10);
                }, 600) as unknown as number;
              }}
              onTouchEnd={() => {
                if (touchTimer.current) {
                  window.clearTimeout(touchTimer.current);
                  touchTimer.current = null;
                }
              }}
            >
              <button onClick={() => handleReact('like')} className="flex items-center gap-2 relative">
                {userReaction ? (
                  <img src={reactionTypes.find((reaction) => reaction.key === (userReaction as any).type)?.emojiUrl} alt={(userReaction as any).type} className="w-6 h-6 rounded" />
                ) : (
                  <ThumbsUp size={18} />
                )}
              </button>
            </div>

            <div className="flex items-center gap-1">
              {reactionTypes.map((reactionType) => {
                const count = ((post as any).reactions || []).filter((reaction: any) => reaction.type === reactionType.key).length;
                return count > 0 ? (
                  <div key={reactionType.key} className="inline-flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-full text-[11px]">
                    <img src={reactionType.emojiUrl} alt={reactionType.key} className="w-4 h-4" />
                    <span className="font-black">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <button onClick={() => setShowComments((current) => !current)} className="flex items-center gap-2 text-xs font-bold text-foreground/40 hover:text-foreground transition-all">
            <MessageSquare size={18} />
            <span>Comment</span>
          </button>
        </div>

        <button title="Share" onClick={handleShare} className="flex items-center gap-2 text-xs font-bold text-foreground/40 hover:text-foreground transition-all ml-auto">
          <Share2 size={18} />
        </button>

        <AnimatePresence>
          {showPicker && (
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }} className="absolute bottom-4 left-8 transform translate-y-[-6px] -translate-x-1/4 bg-background border border-border rounded-3xl p-2 flex gap-2 shadow-lg">
              {reactionTypes.map((reactionType) => (
                <motion.button key={reactionType.key} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => { handleReact(reactionType.key); setShowPicker(false); }} className="text-lg px-2">
                  <motion.img src={reactionType.emojiUrl} alt={reactionType.key} className="w-6 h-6 rounded" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.18 }} />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="mt-4 space-y-3">
            {replyTree.length > 0 ? (
              replyTree.map((reply) => (
                <ReplyThreadItem
                  key={reply.id}
                  reply={reply}
                  depth={0}
                  currentUserId={me?.id}
                  reactionTypes={reactionTypes}
                  onReactReply={handleReplyReact}
                  onStartReply={(target) => {
                    if (target) {
                      setActiveReplyTarget({ id: target.id, name: target.persona?.name || 'Anonymous' });
                      setReplyText('');
                      setShowComments(true);
                      return;
                    }
                    setActiveReplyTarget(null);
                    setReplyText('');
                  }}
                  activeReplyTargetId={activeReplyTarget?.id || null}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onSubmitReply={handleSubmitReply}
                  submittingReply={submittingReply}
                />
              ))
            ) : (
              <div className="text-foreground/40 text-sm">No comments yet.</div>
            )}

            <div className="space-y-2 rounded-2xl border border-border bg-background p-3">
              {activeReplyTarget && (
                <div className="flex items-center justify-between gap-3 text-xs font-bold text-foreground/50">
                  <span>Replying to {activeReplyTarget.name}</span>
                  <button type="button" onClick={() => { setActiveReplyTarget(null); setReplyText(''); }} className="text-accent hover:underline">
                    Cancel reply
                  </button>
                </div>
              )}
              <div className="flex gap-2">
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

function ReplyThreadItem({
  reply,
  depth,
  currentUserId,
  reactionTypes,
  onReactReply,
  onStartReply,
  activeReplyTargetId,
  replyText,
  setReplyText,
  onSubmitReply,
  submittingReply,
}: {
  reply: ReplyNode;
  depth: number;
  currentUserId?: string;
  reactionTypes: Array<{ key: string; emoji: string; emojiUrl: string }>;
  onReactReply: (replyId: string, type: string) => Promise<void>;
  onStartReply: (reply: ReplyNode | null) => void;
  activeReplyTargetId: string | null;
  replyText: string;
  setReplyText: (value: string) => void;
  onSubmitReply: (parentReplyId: string) => Promise<void>;
  submittingReply: boolean;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const hoverTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const touchTimer = useRef<number | null>(null);
  const userReaction = reply.reactions?.find((reaction) => reaction.user_id === currentUserId);
  const nestedIndent = depth > 0 ? 'ml-4 pl-4 border-l border-border/60' : '';

  return (
    <div className={nestedIndent}>
      <div className="bg-muted/30 border border-border rounded-2xl p-3">
        <div className="text-xs font-black italic">
          {reply.persona?.name || 'Anonymous'} • <span className="text-[10px] text-foreground/40">{new Date(reply.created_at).toLocaleTimeString()}</span>
        </div>
        <div className="text-sm mt-2 whitespace-pre-wrap">{reply.content}</div>

        <div className="mt-3 flex items-center gap-3 flex-wrap relative">
          <div className={`flex items-center gap-2 text-[11px] font-black ${userReaction ? 'text-accent' : 'text-foreground/40'}`}>
            <div
              className="relative inline-block"
              onMouseEnter={() => {
                if (hideTimer.current) {
                  window.clearTimeout(hideTimer.current);
                  hideTimer.current = null;
                }
                hoverTimer.current = window.setTimeout(() => setShowPicker(true), 350) as unknown as number;
              }}
              onMouseLeave={() => {
                if (hoverTimer.current) {
                  window.clearTimeout(hoverTimer.current);
                  hoverTimer.current = null;
                }
                hideTimer.current = window.setTimeout(() => setShowPicker(false), 1200) as unknown as number;
              }}
              onTouchStart={() => {
                touchTimer.current = window.setTimeout(() => setShowPicker(true), 500) as unknown as number;
              }}
              onTouchEnd={() => {
                if (touchTimer.current) {
                  window.clearTimeout(touchTimer.current);
                  touchTimer.current = null;
                }
              }}
            >
              <button type="button" onClick={() => onReactReply(reply.id, 'like')} className="flex items-center gap-2">
                {userReaction ? (
                  <img src={reactionTypes.find((reaction) => reaction.key === userReaction.type)?.emojiUrl} alt={userReaction.type} className="w-5 h-5 rounded" />
                ) : (
                  <ThumbsUp size={14} />
                )}
              </button>
            </div>

            <div className="flex items-center gap-1">
              {reactionTypes.map((reactionType) => {
                const count = Array.isArray(reply.reactions) ? reply.reactions.filter((reaction) => reaction.type === reactionType.key).length : 0;
                return count > 0 ? (
                  <div key={reactionType.key} className="inline-flex items-center gap-1 bg-background/70 border border-border px-2 py-0.5 rounded-full text-[10px]">
                    <img src={reactionType.emojiUrl} alt={reactionType.key} className="w-3 h-3" />
                    <span>{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <button type="button" onClick={() => onStartReply(reply)} className="text-[11px] font-bold text-foreground/50 hover:text-foreground transition-all">
            Reply
          </button>

          <AnimatePresence>
            {showPicker && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }} className="absolute bottom-full left-0 mb-2 bg-background border border-border rounded-3xl p-2 flex gap-2 shadow-lg z-10">
                {reactionTypes.map((reactionType) => (
                  <motion.button key={reactionType.key} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => { onReactReply(reply.id, reactionType.key); setShowPicker(false); }} className="text-lg px-2">
                    <motion.img src={reactionType.emojiUrl} alt={reactionType.key} className="w-5 h-5 rounded" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.18 }} />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {activeReplyTargetId === reply.id && (
          <div className="mt-3 space-y-2 rounded-2xl border border-border bg-background p-3">
            <div className="flex items-center justify-between gap-3 text-xs font-bold text-foreground/50">
              <span>Replying to {reply.persona?.name || 'Anonymous'}</span>
              <button type="button" onClick={() => onStartReply(null)} className="text-accent hover:underline">
                Cancel
              </button>
            </div>
            <div className="flex gap-2">
              <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Reply to ${reply.persona?.name || 'this reply'}...`} className="flex-1 p-3 rounded-xl border border-border bg-background" />
              <button onClick={() => void onSubmitReply(reply.id)} disabled={submittingReply} className="px-4 py-2 rounded-xl bg-accent text-black font-black">{submittingReply ? 'Sending...' : 'Reply'}</button>
            </div>
          </div>
        )}
      </div>

      {reply.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {reply.children.map((child) => (
            <ReplyThreadItem
              key={child.id}
              reply={child}
              depth={depth + 1}
              currentUserId={currentUserId}
              reactionTypes={reactionTypes}
              onReactReply={onReactReply}
              onStartReply={onStartReply}
              activeReplyTargetId={activeReplyTargetId}
              replyText={replyText}
              setReplyText={setReplyText}
              onSubmitReply={onSubmitReply}
              submittingReply={submittingReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
