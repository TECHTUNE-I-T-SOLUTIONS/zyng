'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, ChevronLeft, Image as ImageIcon, Send, MessageSquare, Zap, BarChart2, Flame, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { postService } from '@/lib/services/postService';
import { userService } from '@/lib/services/userService';

type PostType = 'regular' | 'confession' | 'poll' | 'hot_take' | 'missed_connection' | 'trend' | 'pulse';

export default function AlumniCreatePage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<PostType>('regular');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: user, isLoading } = useQuery({
    queryKey: ['alumni-create-me'],
    queryFn: () => userService.getCurrentUser(),
  });

  const types = [
    { id: 'regular', name: 'Update', icon: MessageSquare, color: 'text-white' },
    { id: 'confession', name: 'Confess', icon: Zap, color: 'text-[#FFB800]' },
    { id: 'poll', name: 'Poll', icon: BarChart2, color: 'text-indigo-400' },
    { id: 'hot_take', name: 'Hot Take', icon: Flame, color: 'text-rose-500' },
    { id: 'missed_connection', name: 'Missed', icon: MapPin, color: 'text-emerald-400' },
  ];

  const handleSubmit = async () => {
    if (!content.trim() || !user?.personas?.[0]) return;
    setIsSubmitting(true);
    try {
      await postService.createPost({
        user_id: user.id,
        persona_id: user.personas[0].id,
        school_id: user.school_id,
        content,
        type: activeType,
        media_url: mediaUrl || undefined,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      router.push('/z-alumni/feed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center text-white/40"><Loader2 className="animate-spin text-indigo-400" /></div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 text-white">
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <Link href="/z-alumni/feed" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Back to Feed</span>
        </Link>
        <button onClick={handleSubmit} disabled={isSubmitting || !content.trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase shadow-lg shadow-indigo-500/20 disabled:opacity-30 transition-all flex items-center gap-2">
          <Send size={16} />
          {isSubmitting ? 'Posting...' : 'Broadcast'}
        </button>
      </header>

      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-[2.5rem]">
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Professional Composer</div>
            <p className="text-white/40 text-sm italic">Share updates, insights, and opportunities with the alumni network.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {types.map((t) => (
              <button key={t.id} onClick={() => setActiveType(t.id as PostType)} className={cn('flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all', activeType === t.id ? 'bg-white/5 border-white/10' : 'border-transparent hover:bg-white/5 opacity-60 hover:opacity-100')}>
                <div className={cn('p-2 rounded-xl bg-black/30', t.color)}>
                  <t.icon size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">{t.name}</span>
              </button>
            ))}
          </div>

          <motion.textarea
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your alumni update..."
            className={cn('w-full min-h-[320px] rounded-[2.5rem] bg-white/5 border border-white/10 p-8 text-2xl md:text-3xl font-bold focus:outline-none resize-none placeholder:text-white/20', activeType === 'confession' && 'italic')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Optional media URL"
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/40">
              Posting as <span className="text-indigo-400 font-black">{user?.personas?.[0]?.name || 'Professional Persona'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-white/5">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-xs font-bold text-white/60">
              <ImageIcon size={16} /> Add Media
            </button>
            <div className="ml-auto text-[10px] font-black text-white/20 uppercase tracking-widest">{content.length} / 500</div>
          </div>
        </div>
      </div>
    </div>
  );
}
