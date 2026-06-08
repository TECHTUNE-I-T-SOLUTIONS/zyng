'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Loader2, MessageSquare, MoreHorizontal, Share2, ThumbsUp } from 'lucide-react';
import { usePost } from '@/hooks/usePosts';
import { useToast } from '@/components/toast';
import { postService } from '@/lib/services/postService';
import { react as reactService } from '@/lib/services/reactionService';
import { userService } from '@/lib/services/userService';
import { ACTIVE_PERSONA_ALERT, getActivePersona } from '@/lib/persona-utils';
import { Reply } from '@/types';

type ReplyNode = Reply & { children: ReplyNode[] };

const reactionTypes = [
  { key: 'like', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/thumbs_up.gif' },
  { key: 'love', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/smiling_face_with_heart_eyes.gif' },
  { key: 'laugh', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/face_with_tears_of_joy.gif' },
  { key: 'cry', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/crying_face.gif' },
  { key: 'boo', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/face_with_steam_from_nose.gif' },
];

const buildReplyTree = (replies: Reply[] = []) => {
  const nodes = new Map<string, ReplyNode>();
  const roots: ReplyNode[] = [];

  replies.forEach((reply) => nodes.set(reply.id, { ...reply, children: [] }));
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

export default function PostPageClient() {
  const { id } = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const { data: post, isLoading, error } = usePost(id as string);
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const [showComments, setShowComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeReplyTarget, setActiveReplyTarget] = useState<{ id: string; name: string } | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [localReplies, setLocalReplies] = useState<Reply[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const hoverTimer = useRef<number | null>(null);
  const touchTimer = useRef<number | null>(null);
  const reactionPickerRef = useRef<HTMLDivElement | null>(null);

  const postReplies = useMemo(() => ((post as any)?.replies || []) as Reply[], [post]);
  const replies = localReplies.length ? localReplies : postReplies;
  const replyTree = useMemo(() => buildReplyTree(replies), [replies]);
  const userReaction = ((post as any)?.reactions || []).find((reaction: any) => reaction.user_id === me?.id);

  useEffect(() => {
    if (!showPicker) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (reactionPickerRef.current?.contains(event.target as Node)) return;
      setShowPicker(false);
    };
    const closeOnScroll = () => setShowPicker(false);
    document.addEventListener('pointerdown', closeOnOutside);
    window.addEventListener('scroll', closeOnScroll, true);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      window.removeEventListener('scroll', closeOnScroll, true);
    };
  }, [showPicker]);

  const updateReplies = (updater: (source: Reply[]) => Reply[]) => {
    setLocalReplies((current) => updater(current.length ? current : ((post as any).replies || [])));
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Zyng Post', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.show('Link copied', 'success');
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.show('Link copied', 'success');
      } catch {
        toast.show('Share failed', 'error');
      }
    }
  };

  const handlePostReaction = async (type: string) => {
    if (!me?.id) { toast.show('Login to react', 'info'); router.push('/in/login'); return; }
    if (!getActivePersona(me?.personas)) { toast.show(ACTIVE_PERSONA_ALERT, 'error'); return; }

    const prevPost = qc.getQueryData(['post', (post as any).id]);
    const prevPosts = qc.getQueryData<any[]>(['posts']);
    const apply = (item: any) => {
      const reactions = Array.isArray(item.reactions) ? [...item.reactions] : [];
      const existing = reactions.find((reaction: any) => reaction.user_id === me.id);
      if (existing) {
        if (existing.type === type) return { ...item, reactions: reactions.filter((reaction: any) => reaction.user_id !== me.id) };
        existing.type = type;
        return { ...item, reactions };
      }
      reactions.push({ user_id: me.id, type });
      return { ...item, reactions };
    };

    try {
      qc.setQueryData(['post', (post as any).id], (current: any) => current ? apply(current) : current);
      if (prevPosts) qc.setQueryData(['posts'], prevPosts.map((item) => item.id === (post as any).id ? apply(item) : item));
      await reactService({ post_id: (post as any).id, type }, me.id);
      qc.invalidateQueries({ queryKey: ['post', (post as any).id] });
      qc.invalidateQueries({ queryKey: ['posts'] });
    } catch (err) {
      console.error('react failed', err);
      qc.setQueryData(['post', (post as any).id], prevPost);
      qc.setQueryData(['posts'], prevPosts);
      toast.show('Failed to react', 'error');
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    const personaId = getActivePersona(me?.personas)?.id || null;
    if (!personaId) { toast.show(ACTIVE_PERSONA_ALERT, 'error'); return; }
    setSubmittingComment(true);
    try {
      const newReply = await postService.createReply((post as any).id, personaId, commentText.trim(), null);
      updateReplies((source) => [...source, newReply]);
      setCommentText('');
      setShowComments(true);
      qc.invalidateQueries({ queryKey: ['post', (post as any).id] });
      qc.invalidateQueries({ queryKey: ['posts'] });
      toast.show('Reply posted', 'success');
    } catch (err) {
      console.error(err);
      toast.show('Failed to post reply', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitNestedReply = async (parentReplyId: string) => {
    if (!replyText.trim()) return;
    const personaId = getActivePersona(me?.personas)?.id || null;
    if (!personaId) { toast.show(ACTIVE_PERSONA_ALERT, 'error'); return; }
    setSubmittingReply(true);
    try {
      const newReply = await postService.createReply((post as any).id, personaId, replyText.trim(), parentReplyId);
      updateReplies((source) => [...source, newReply]);
      setReplyText('');
      setActiveReplyTarget(null);
      qc.invalidateQueries({ queryKey: ['post', (post as any).id] });
      qc.invalidateQueries({ queryKey: ['posts'] });
    } catch (err) {
      console.error(err);
      toast.show('Failed to post reply', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleReplyReaction = async (replyId: string, type: string) => {
    if (!me?.id) { toast.show('Login to react', 'info'); router.push('/in/login'); return; }
    if (!getActivePersona(me?.personas)) { toast.show(ACTIVE_PERSONA_ALERT, 'error'); return; }
    const prevReplies = localReplies;
    updateReplies((source) => source.map((reply) => {
      if (reply.id !== replyId) return reply;
      const reactions = Array.isArray(reply.reactions) ? [...reply.reactions] : [];
      const existing = reactions.find((reaction) => reaction.user_id === me.id);
      if (existing) {
        if (existing.type === type) return { ...reply, reactions: reactions.filter((reaction) => reaction.user_id !== me.id) };
        existing.type = type;
        return { ...reply, reactions };
      }
      reactions.push({ user_id: me.id, type });
      return { ...reply, reactions };
    }));
    try {
      await reactService({ reply_id: replyId, type }, me.id);
      qc.invalidateQueries({ queryKey: ['post', (post as any).id] });
    } catch (err) {
      console.error('reply react failed', err);
      setLocalReplies(prevReplies);
      toast.show('Failed to react to reply', 'error');
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-accent animate-spin" /></div>;
  }

  if (error || !post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-red-500 mb-2">Zyng Not Found</h2>
        <p className="text-foreground/40 mb-8">This post might have expired or been removed.</p>
        <button onClick={() => router.back()} className="bg-muted border border-border px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-18">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-foreground/40 hover:text-foreground group transition-all">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Feed</span>
        </button>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-[2rem] border border-border bg-muted/40 p-5 shadow-2xl shadow-accent/5 md:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-xl">
              {post.type === 'confession' ? '🤫' : post.type === 'hot_take' ? '🔥' : '👋'}
            </div>
            <div>
              <div className="text-base font-black italic">{post.persona?.name || 'Anonymous'}</div>
              <div className="text-[10px] font-black uppercase tracking-tight text-foreground/40">
                {new Date(post.created_at).toLocaleString()} • Unilorin
              </div>
            </div>
            <div className="relative ml-auto">
              <button onClick={() => setMenuOpen((open) => !open)} className="rounded-xl p-2 text-foreground/40 transition-all hover:bg-background/50 hover:text-foreground" aria-label="Post menu">
                <MoreHorizontal size={20} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-40 rounded-xl border border-border bg-background p-2 shadow-lg">
                  {me?.id === post.user_id && (
                    <>
                      <button onClick={() => { setMenuOpen(false); router.push(`/z-profile?editPostId=${(post as any).id}`); }} className="w-full rounded px-2 py-2 text-left hover:bg-muted">Edit</button>
                      <button onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }} className="w-full rounded px-2 py-2 text-left text-red-500 hover:bg-red-50">Delete</button>
                    </>
                  )}
                  <button onClick={async () => { setMenuOpen(false); await navigator.clipboard.writeText(window.location.href); toast.show('Link copied', 'success'); }} className="w-full rounded px-2 py-2 text-left hover:bg-muted">Copy Link</button>
                </div>
              )}
            </div>
          </div>

          <p className="mb-8 whitespace-pre-wrap text-xl font-medium leading-relaxed">{post.content}</p>

          {!!post.media_urls?.length && (
            <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {post.media_urls.map((url, index) => <img key={url} src={url} alt={`post-image-${index}`} className="h-64 w-full rounded-xl object-cover" />)}
            </div>
          )}

          <div className="relative flex items-center gap-4 border-t border-border/50 pt-6">
            <div className={`flex items-center gap-2 text-xs font-black ${userReaction ? 'text-accent' : 'text-foreground/40'}`}>
              <div
                className="relative inline-block"
                onMouseEnter={() => { hoverTimer.current = window.setTimeout(() => setShowPicker(true), 350) as unknown as number; }}
                onMouseLeave={() => { if (hoverTimer.current) window.clearTimeout(hoverTimer.current); }}
                onTouchStart={() => { touchTimer.current = window.setTimeout(() => { setShowPicker(true); navigator.vibrate?.(10); }, 600) as unknown as number; }}
                onTouchEnd={() => { if (touchTimer.current) window.clearTimeout(touchTimer.current); }}
              >
                <button onClick={() => handlePostReaction('like')} className="flex items-center gap-2">
                  {userReaction ? <img src={reactionTypes.find((reaction) => reaction.key === userReaction.type)?.emojiUrl} alt={userReaction.type} className="h-6 w-6 rounded" /> : <ThumbsUp size={18} />}
                </button>
              </div>
              <ReactionCounts reactions={(post as any).reactions || []} />
            </div>

            <button onClick={() => setShowComments((open) => !open)} className="flex items-center gap-2 text-xs font-bold text-foreground/40 transition-all hover:text-foreground">
              <MessageSquare size={18} />
              <span>{replies.length}</span>
            </button>
            <button onClick={handleShare} className="ml-auto flex items-center gap-2 text-xs font-bold text-foreground/40 transition-all hover:text-foreground" aria-label="Share post">
              <Share2 size={18} />
            </button>

            <AnimatePresence>
              {showPicker && (
                <motion.div ref={reactionPickerRef} initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} className="absolute bottom-10 left-0 z-10 flex gap-2 rounded-3xl border border-border bg-background p-2 shadow-lg">
                  {reactionTypes.map((reaction) => (
                    <motion.button key={reaction.key} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => { handlePostReaction(reaction.key); setShowPicker(false); }} className="px-2">
                      <img src={reaction.emojiUrl} alt={reaction.key} className="h-6 w-6 rounded" />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.article>

        <AnimatePresence>
          {showComments && (
            <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="space-y-4">
              <h3 className="px-2 text-xs font-black uppercase tracking-widest text-foreground/30">Replies ({replies.length})</h3>
              {replyTree.length ? replyTree.map((reply) => (
                <ReplyThreadItem
                  key={reply.id}
                  reply={reply}
                  depth={0}
                  currentUserId={me?.id}
                  onReactReply={handleReplyReaction}
                  activeReplyTargetId={activeReplyTarget?.id || null}
                  onStartReply={(target) => {
                    setActiveReplyTarget(target ? { id: target.id, name: target.persona?.name || 'Anonymous' } : null);
                    setReplyText('');
                  }}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onSubmitReply={handleSubmitNestedReply}
                  submittingReply={submittingReply}
                />
              )) : (
                <div className="rounded-3xl border border-dashed border-border bg-muted/20 py-10 text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-foreground/30">No replies yet. Be the first!</p>
                </div>
              )}

              <div className="space-y-2 rounded-2xl border border-border bg-background p-3">
                <div className="flex gap-2">
                  <input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment..." className="min-w-0 flex-1 rounded-xl border border-border bg-background p-3" />
                  <button onClick={handleSubmitComment} disabled={submittingComment} className="rounded-xl bg-accent px-4 py-2 font-black text-black">{submittingComment ? 'Sending...' : 'Send'}</button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-8">
                <h3 className="mb-4 text-lg font-black">Delete Post</h3>
                <p className="mb-6 text-foreground/40">Are you sure you want to permanently delete this post? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="rounded-xl bg-muted px-4 py-2">Cancel</button>
                  <button onClick={async () => { await postService.deletePost((post as any).id); qc.invalidateQueries({ queryKey: ['posts'] }); toast.show('Post deleted', 'success'); router.push('/z-feed'); }} className="rounded-xl bg-red-500 px-4 py-2 text-white">Delete</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReactionCounts({ reactions }: { reactions: any[] }) {
  return (
    <div className="flex items-center gap-1">
      {reactionTypes.map((reactionType) => {
        const count = reactions.filter((reaction) => reaction.type === reactionType.key).length;
        return count > 0 ? (
          <div key={reactionType.key} className="inline-flex items-center gap-1 rounded-full bg-muted/30 px-2 py-1 text-[11px]">
            <img src={reactionType.emojiUrl} alt={reactionType.key} className="h-4 w-4" />
            <span className="font-black">{count}</span>
          </div>
        ) : null;
      })}
    </div>
  );
}

function ReplyThreadItem({
  reply,
  depth,
  currentUserId,
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
  const userReaction = reply.reactions?.find((reaction) => reaction.user_id === currentUserId);
  const reactionPickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showPicker) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (reactionPickerRef.current?.contains(event.target as Node)) return;
      setShowPicker(false);
    };
    const closeOnScroll = () => setShowPicker(false);
    document.addEventListener('pointerdown', closeOnOutside);
    window.addEventListener('scroll', closeOnScroll, true);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      window.removeEventListener('scroll', closeOnScroll, true);
    };
  }, [showPicker]);

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-border/60 pl-4' : ''}>
      <div className="rounded-2xl border border-border bg-muted/30 p-3">
        <div className="text-xs font-black italic">
          {reply.persona?.name || 'Anonymous'} • <span className="text-[10px] text-foreground/40">{new Date(reply.created_at).toLocaleTimeString()}</span>
        </div>
        <div className="mt-2 whitespace-pre-wrap text-sm">{reply.content}</div>
        <div className="relative mt-3 flex flex-wrap items-center gap-3">
          <div
            className={`flex items-center gap-2 text-[11px] font-black ${userReaction ? 'text-accent' : 'text-foreground/40'}`}
            onMouseEnter={() => { hoverTimer.current = window.setTimeout(() => setShowPicker(true), 350) as unknown as number; }}
            onMouseLeave={() => { if (hoverTimer.current) window.clearTimeout(hoverTimer.current); }}
          >
            <button type="button" onClick={() => onReactReply(reply.id, 'like')} className="flex items-center gap-2">
              {userReaction ? <img src={reactionTypes.find((reaction) => reaction.key === userReaction.type)?.emojiUrl} alt={userReaction.type} className="h-5 w-5 rounded" /> : <ThumbsUp size={14} />}
            </button>
            <ReactionCounts reactions={reply.reactions || []} />
          </div>
          {depth === 0 && (
            <button type="button" onClick={() => onStartReply(reply)} className="text-[11px] font-bold text-foreground/50 transition-all hover:text-foreground">Reply</button>
          )}
          <AnimatePresence>
            {showPicker && (
              <motion.div ref={reactionPickerRef} initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} className="absolute bottom-full left-0 z-10 mb-2 flex gap-2 rounded-3xl border border-border bg-background p-2 shadow-lg">
                {reactionTypes.map((reaction) => (
                  <motion.button key={reaction.key} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => { onReactReply(reply.id, reaction.key); setShowPicker(false); }} className="px-2">
                    <img src={reaction.emojiUrl} alt={reaction.key} className="h-5 w-5 rounded" />
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
              <button type="button" onClick={() => onStartReply(null)} className="text-accent hover:underline">Cancel</button>
            </div>
            <div className="flex gap-2">
              <input value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder={`Reply to ${reply.persona?.name || 'this reply'}...`} className="min-w-0 flex-1 rounded-xl border border-border bg-background p-3" />
              <button onClick={() => onSubmitReply(reply.id)} disabled={submittingReply} className="rounded-xl bg-accent px-4 py-2 font-black text-black">{submittingReply ? 'Sending...' : 'Reply'}</button>
            </div>
          </div>
        )}
      </div>
      {!!reply.children.length && (
        <div className="mt-3 space-y-3">
          {reply.children.map((child) => (
            <ReplyThreadItem key={child.id} reply={child} depth={depth + 1} currentUserId={currentUserId} onReactReply={onReactReply} onStartReply={onStartReply} activeReplyTargetId={activeReplyTargetId} replyText={replyText} setReplyText={setReplyText} onSubmitReply={onSubmitReply} submittingReply={submittingReply} />
          ))}
        </div>
      )}
    </div>
  );
}
