'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sightService } from '@/lib/services/sightService';
import { userService } from '@/lib/services/userService';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Lightbulb, Link as LinkIcon, Loader2, MessageSquare, Flame } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SightDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });

  const { data: sight, isLoading } = useQuery({
    queryKey: ['sight', params.id],
    queryFn: () => sightService.getSightById(params.id),
  });
  
  const { data: comments = [] } = useQuery({
    queryKey: ['sight-comments', params.id],
    queryFn: () => sightService.getComments(params.id),
  });

  const { data: reactions = [] } = useQuery({
    queryKey: ['sight-reactions', params.id],
    queryFn: () => sightService.getReactions(params.id),
  });

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: sight?.title || 'Z-Sight',
        text: `Check out this project on Zyng!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !user?.id) return;
    setIsSubmitting(true);
    try {
      await sightService.addComment(params.id, user.id, commentText);
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['sight-comments', params.id] });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReact = async (type: string) => {
    if (!user?.id) return;
    try {
      await sightService.toggleReaction(params.id, user.id, type);
      queryClient.invalidateQueries({ queryKey: ['sight-reactions', params.id] });
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh] bg-background">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
    </div>
  );

  if (!sight) return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] bg-background p-6 text-center">
      <Lightbulb size={48} className="text-foreground/20 mb-4" />
      <h2 className="text-2xl font-black uppercase mb-2">Project Not Found</h2>
      <Link href="/z-sights" className="bg-accent text-black px-6 py-3 rounded-2xl font-black mt-4 text-xs uppercase tracking-widest">
        Back to Z-Sights
      </Link>
    </div>
  );

  const flameReactions = reactions.filter((r: any) => r.type === 'flame').length;
  const userHasFlamed = reactions.some((r: any) => r.type === 'flame' && r.user_id === user?.id);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 bg-muted rounded-xl hover:bg-muted/80 transition flex items-center gap-2 text-sm font-bold">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={handleShare} className="p-2 bg-muted rounded-xl hover:bg-muted/80 transition flex items-center gap-2 text-sm font-bold">
          <Share2 size={16} /> Share
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6 lg:p-12 space-y-12">
        
        {/* Header & Images */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-4 border border-accent/20">
                {sight.category || 'Project'}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">{sight.title}</h1>
              <div className="flex items-center gap-4 text-sm font-bold text-foreground/50">
                <div className="flex items-center gap-2">
                  <img src={sight.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sight.author?.z_name || 'anon'}`} alt="" className="w-6 h-6 rounded-full bg-muted" />
                  @{sight.author?.z_name || 'Anonymous'}
                </div>
                <span>•</span>
                <span>{new Date(sight.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {sight.link && (
              <a href={sight.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-black transition-all whitespace-nowrap">
                <LinkIcon size={16} /> Visit Project
              </a>
            )}
          </div>

          {sight.images && sight.images.length > 0 && (
            <div className="rounded-[2rem] overflow-hidden border border-border bg-muted aspect-video">
              <img src={sight.images[0]} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          
          {sight.images && sight.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {sight.images.slice(1).map((img: string, i: number) => (
                <div key={i} className="w-32 h-24 shrink-0 rounded-2xl overflow-hidden border border-border bg-muted">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content & Tags */}
        <div className="space-y-8">
          <div className="prose prose-invert max-w-none text-foreground/80 whitespace-pre-wrap leading-relaxed text-lg">
            {sight.description}
          </div>

          {sight.tags && sight.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sight.tags.map((t: string) => (
                <span key={t} className="px-4 py-2 bg-muted/50 border border-border rounded-xl text-xs font-black uppercase tracking-widest text-foreground/70">
                  #{t}
                </span>
              ))}
            </div>
          )}
          
          <div className="pt-8 border-t border-border flex items-center gap-6">
            <button 
              onClick={() => handleReact('flame')} 
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${userHasFlamed ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' : 'bg-muted border border-border hover:border-orange-500/50 hover:text-orange-500'}`}
            >
              <Flame size={20} className={userHasFlamed ? 'fill-orange-500' : ''} />
              {flameReactions} {flameReactions === 1 ? 'Flame' : 'Flames'}
            </button>
            <div className="flex items-center gap-2 px-6 py-3 bg-muted/50 border border-border rounded-2xl font-black uppercase text-xs tracking-widest text-foreground/50">
              <MessageSquare size={20} />
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-6 pt-8 border-t border-border">
          <h3 className="text-2xl font-black tracking-tight">Discussion</h3>
          
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-muted shrink-0 overflow-hidden">
              {user && <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.z_name || 'user'}`} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 space-y-3">
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What do you think about this project?"
                className="w-full bg-muted/30 border border-border rounded-2xl p-4 font-medium focus:border-accent outline-none resize-none h-24"
              />
              <div className="flex justify-end">
                <button 
                  disabled={isSubmitting || !commentText.trim()}
                  onClick={handlePostComment}
                  className="bg-foreground text-background px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-accent hover:text-black transition-all"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            {comments.length > 0 ? comments.map((comment: any) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={comment.id} className="flex gap-4 p-4 bg-muted/20 border border-border rounded-2xl">
                <img src={comment.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.z_name || 'anon'}`} alt="" className="w-10 h-10 rounded-full bg-muted shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">@{comment.user?.z_name || 'Anonymous'}</span>
                    <span className="text-[10px] text-foreground/40">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-foreground/80 text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-10 bg-muted/10 border border-dashed border-border rounded-2xl">
                <p className="text-foreground/40 font-bold italic">No comments yet. Start the discussion!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
