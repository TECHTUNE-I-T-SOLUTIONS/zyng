'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePost } from '@/hooks/usePosts';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Share2, MoreHorizontal, Loader2, ArrowLeft } from 'lucide-react';
import { useState, useRef } from 'react';
import { useToast } from '@/components/toast';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/services/userService';
import { postService } from '@/lib/services/postService';
import { react as reactService } from '@/lib/services/reactionService';
import { useQueryClient } from '@tanstack/react-query';

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: post, isLoading, error } = usePost(id as string);
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const qc = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const toast = useToast();
  const hoverTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const touchTimer = useRef<number | null>(null);
  const commentRef = useRef<HTMLTextAreaElement | null>(null);
  const reactionTypes = [
    { key: 'like', emoji: '👍', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/thumbs_up.gif' },
    { key: 'love', emoji: '❤️', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/smiling_face_with_heart_eyes.gif' },
    { key: 'laugh', emoji: '😂', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/face_with_tears_of_joy.gif' },
    { key: 'cry', emoji: '😢', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/crying_face.gif' },
    { key: 'boo', emoji: '😡', emojiUrl: 'https://www.emojiall.com/images/animations/joypixels/64px/face_with_steam_from_nose.gif' },
  ];
 

  const handleSubmitReply = async () => {
    if (!commentText.trim()) return;
    const personaId = me?.personas?.[0]?.id || post.persona?.id || null;
    if (!personaId) { toast.show('No persona available', 'error'); return; }
    setSubmitting(true);
    try {
      await postService.createReply(post.id, personaId, commentText.trim());
      setCommentText('');
      qc.invalidateQueries({ queryKey: ['post', post.id] });
      qc.invalidateQueries({ queryKey: ['posts'] });
      setShowComments(true);
      toast.show('Reply posted', 'success');
    } catch (err) { console.error(err); toast.show('Failed to post reply', 'error'); }
    finally { setSubmitting(false); }
  };

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
            <div className="ml-auto relative">
              <button onClick={() => setMenuOpen((s) => !s)} className="text-foreground/40 hover:text-foreground p-2 hover:bg-background/50 rounded-xl transition-all">
                <MoreHorizontal size={20} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-background border border-border rounded-xl p-2 w-40 shadow-lg">
                  {me?.id === post.user_id && (
                    <>
                          <button onClick={() => { setMenuOpen(false); router.push(`/z-profile?editPostId=${post.id}`); }} className="w-full text-left py-2 px-2 hover:bg-muted rounded">Edit</button>
                          <button onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }} className="w-full text-left py-2 px-2 hover:bg-red-50 text-red-500 rounded">Delete</button>
                    </>
                  )}
                      <button onClick={async () => { setMenuOpen(false); try { await navigator.clipboard.writeText(window.location.href); toast.show('Link copied', 'success'); } catch (err) { console.error(err); toast.show('Copy failed', 'error'); } }} className="w-full text-left py-2 px-2 hover:bg-muted rounded">Copy Link</button>
                </div>
              )}
            </div>
          </div>

          <p className="text-xl font-medium leading-relaxed mb-8">
            {post.content}
          </p>

          {post.media_urls && post.media_urls.length > 0 && (
            <div className="mb-6 grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {post.media_urls.map((url, i) => (
                <img key={i} src={url} alt={`post-image-${i}`} className="w-full h-64 object-cover rounded-xl" />
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 text-foreground/40 border-t border-border/50 pt-6 relative">
            {(() => {
              const userReaction = (post.reactions || []).find((r:any) => r.user_id === me?.id);
              const prevPost = qc.getQueryData(['post', post.id]);
              const prevPosts = qc.getQueryData(['posts']);
              const userId = me?.id;
              const applyOptimistic = (type: string) => {
                if (prevPosts) {
                  qc.setQueryData(['posts'], (prevPosts as any[]).map((p) => {
                    if (p.id !== post.id) return p;
                    const reactions = Array.isArray(p.reactions) ? [...p.reactions] : [];
                    const existing = reactions.find((r:any) => r.user_id === userId);
                    if (existing) {
                      if (existing.type === type) {
                        const idx = reactions.findIndex((r:any) => r.user_id === userId);
                        if (idx >= 0) reactions.splice(idx, 1);
                      } else { existing.type = type; }
                    } else { reactions.push({ user_id: userId, type }); }
                    return { ...p, reactions };
                  }));
                }
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

              const onReact = async (type: string) => {
                if (!me?.id) { toast.show('Login to react', 'info'); router.push('/in/login'); return; }
                try {
                  applyOptimistic(type);
                  await reactService({ post_id: post.id, type }, me?.id);
                  qc.invalidateQueries({ queryKey: ['post', post.id] });
                  qc.invalidateQueries({ queryKey: ['posts'] });
                } catch (err) {
                  console.error('react failed', err);
                  qc.setQueryData(['post', post.id], prevPost);
                  qc.setQueryData(['posts'], prevPosts);
                }
              };

              return (
                <div className={`flex items-center gap-2 ${userReaction ? 'text-accent' : 'text-foreground/40'}`}>
                  <div className="relative inline-block" onMouseEnter={() => { if (hideTimer.current) { window.clearTimeout(hideTimer.current); hideTimer.current = null; } hoverTimer.current = window.setTimeout(() => setShowPicker(true), 350) as unknown as number; }} onMouseLeave={() => { if (hoverTimer.current) { window.clearTimeout(hoverTimer.current); hoverTimer.current = null; } hideTimer.current = window.setTimeout(() => setShowPicker(false), 900) as unknown as number; }} onTouchStart={() => { touchTimer.current = window.setTimeout(() => { setShowPicker(true); if (navigator.vibrate) navigator.vibrate(10); }, 600) as unknown as number; }} onTouchEnd={() => { if (touchTimer.current) { window.clearTimeout(touchTimer.current); touchTimer.current = null; } }}>
                    <button onClick={() => onReact('like')} className="flex items-center gap-2 relative">
                      {userReaction ? (
                        <img src={reactionTypes.find(r => r.key === userReaction.type)?.emojiUrl} alt={userReaction.type} className="w-7 h-7 rounded" />
                      ) : (
                        <Heart size={20} />
                      )}
                    </button>
                      {showPicker && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-background border border-border rounded-3xl p-2 flex gap-2 shadow-lg">
                          {reactionTypes.map((t) => (
                            <button key={t.key} onClick={() => { onReact(t.key); setShowPicker(false); }} className="text-lg px-2">
                              <img src={t.emojiUrl} alt={t.key} className="w-6 h-6 rounded" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
              );
            })()}

            <div>
              <button onClick={() => { setShowComments((s) => { const next = !s; if (next) setTimeout(() => commentRef.current?.focus(), 100); return next; }); }} className="flex items-center gap-2 hover:text-accent transition-colors">
                <MessageSquare size={20} />
                <span className="text-sm font-black">{post.replies?.length || 0}</span>
              </button>
            </div>

            <div className="ml-auto">
              <button onClick={async () => { try { if ((navigator as any).share) { await (navigator as any).share({ title: 'Zyng Post', url: window.location.href }); } else { await navigator.clipboard.writeText(window.location.href); toast.show('Link copied', 'success'); } } catch (err) { console.error(err); try { await navigator.clipboard.writeText(window.location.href); toast.show('Link copied', 'success'); } catch { toast.show('Share failed', 'error'); } } }} className="flex items-center gap-2 hover:text-accent transition-colors">
                <Share2 size={20} />
              </button>
            </div>

            
          </div>
        </motion.div>

        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground/30 px-4">
            REPLIES ({post.replies?.length || 0})
          </h3>
          {showComments && (
            <div className="p-4 bg-background/30 border border-border rounded-2xl">
              <textarea ref={commentRef} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a reply..." className="w-full min-h-[80px] p-3 border border-border rounded-xl bg-muted" />
              <div className="mt-3 flex gap-3 justify-end">
                <button onClick={() => { setShowComments(false); }} className="px-4 py-2 rounded-xl bg-muted">Cancel</button>
                <button disabled={submitting} onClick={handleSubmitReply} className="px-4 py-2 rounded-xl bg-accent text-black font-black">{submitting ? 'Posting…' : 'Reply'}</button>
              </div>
            </div>
          )}

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
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-background border border-border p-8 rounded-2xl">
                <h3 className="text-lg font-black mb-4">Delete Post</h3>
                <p className="text-foreground/40 mb-6">Are you sure you want to permanently delete this post? This action cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-xl bg-muted">Cancel</button>
                  <button onClick={async () => { try { await postService.deletePost(post.id); qc.invalidateQueries({ queryKey: ['posts'] }); toast.show('Post deleted', 'success'); router.push('/z-feed'); } catch (err) { console.error(err); toast.show('Delete failed', 'error'); } }} className="px-4 py-2 rounded-xl bg-red-500 text-white">Delete</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
