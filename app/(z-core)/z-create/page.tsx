'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { X, Image as ImageIcon, MessageSquare, Zap, BarChart2, Flame, MapPin, PlusSquare, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { userService } from '@/lib/services/userService';
import { postService } from '@/lib/services/postService';
import { getPersonas } from '@/lib/services/persona';

type PostType = 'regular' | 'confession' | 'poll' | 'hot_take' | 'missed_connection';

export default function ZCreate() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<PostType>('regular');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const { data: personas } = useQuery({
    queryKey: ['personas', user?.id],
    queryFn: () => (user?.id ? getPersonas(user.id).then((res) => res.data || []) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const types = [
    { id: 'regular', name: 'Zyng', icon: MessageSquare, color: 'text-white' },
    { id: 'confession', name: 'Confess', icon: Zap, color: 'text-[#FFB800]' },
    { id: 'poll', name: 'Poll', icon: BarChart2, color: 'text-indigo-400' },
    { id: 'hot_take', name: 'Hot Take', icon: Flame, color: 'text-rose-500' },
    { id: 'missed_connection', name: 'Missed', icon: MapPin, color: 'text-emerald-400' },
  ];

  const handleSubmit = async () => {
    if (!content.trim() || !user?.id || !personas?.[0]?.id || !user.school_id) return;
    setIsSubmitting(true);
    try {
      await postService.createPost({
        user_id: user.id,
        persona_id: personas[0].id,
        school_id: user.school_id,
        type: activeType,
        content,
      });
      router.push('/z-feed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <Link href="/z-feed" className="flex items-center gap-2 text-foreground/40 hover:text-foreground transition-colors">
          <ChevronLeft size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Back to Feed</span>
        </Link>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim() || userLoading}
          className="bg-accent text-black px-6 py-2 rounded-full font-black text-xs uppercase shadow-lg shadow-accent/20 disabled:opacity-30 disabled:scale-95 transition-all"
        >
          {isSubmitting ? 'Posting...' : 'Post Zyng'}
        </button>
      </header>

      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-12">
          <div className="grid grid-cols-5 gap-2">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id as PostType)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all',
                  activeType === t.id ? 'bg-muted border-border' : 'border-transparent hover:bg-muted opacity-40 hover:opacity-100'
                )}
              >
                <div className={cn('p-2 rounded-xl bg-background', t.color)}>
                  <t.icon size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter text-foreground">{t.name}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-accent opacity-60">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                Posting as
                <span className="p-1 bg-accent/10 rounded border border-accent/20">{user?.z_name || user?.full_name || user?.phone || 'Your identity'}</span>
              </span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                activeType === 'confession'
                  ? "What's weighing on your soul?..."
                  : activeType === 'poll'
                    ? 'Ask the campus...'
                    : activeType === 'hot_take'
                      ? "What's your spicy campus opinion?..."
                      : "What's happening on campus?..."
              }
              className={cn(
                'w-full bg-transparent border-none text-2xl md:text-3xl font-bold focus:ring-0 resize-none min-h-[300px] placeholder:text-foreground/10',
                activeType === 'confession' && 'italic font-medium text-foreground/80'
              )}
            />
          </div>

          <div className="flex items-center gap-4 pt-8 border-t border-border">
            <button className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-xs font-bold hover:bg-muted/80 transition-all text-foreground/60">
              <ImageIcon size={16} /> Add Media
            </button>
            {activeType === 'poll' && (
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-xl text-xs font-bold hover:bg-indigo-500/20 transition-all text-indigo-400 border border-indigo-500/20">
                <PlusSquare size={16} /> Add Options
              </button>
            )}
            <div className="ml-auto text-[10px] font-black text-foreground/20 uppercase tracking-widest">{content.length} / 500</div>
          </div>
        </div>
      </div>
    </div>
  );
}
