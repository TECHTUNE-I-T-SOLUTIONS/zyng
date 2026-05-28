'use client';

import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import { supabase } from '@/lib/db/supabase';
import { userService } from '@/lib/services/userService';
import { Loader2, ArrowLeft, Code, Globe } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { extractIdFromSlug } from '@/lib/utils';

export default function SightDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sightId = extractIdFromSlug(resolvedParams.id);

  useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });

  const { data: sight, isLoading } = useQuery({
    queryKey: ['sight', sightId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zync_projects')
        .select('*, author:users!user_id(id, z_name, avatar_url, personas(id, name, avatar_url, is_active))')
        .eq('id', sightId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-10 h-10 text-accent animate-spin" /></div>;
  }

  if (!sight) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] bg-background p-6 text-center">
        <h2 className="text-2xl font-black uppercase mb-2">Project Not Found</h2>
        <Link href="/z-sights" className="bg-accent text-black px-6 py-3 rounded-2xl font-black hover:scale-105 transition-all uppercase tracking-widest text-xs">
          Back to Projects
        </Link>
      </div>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: sight.title, text: sight.description || sight.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const persona = sight.author?.personas?.find((entry: any) => entry.is_active) || sight.author?.personas?.[0];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 bg-muted rounded-xl hover:bg-muted/80 transition flex items-center gap-2 text-sm font-bold">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={handleShare} className="p-2 bg-muted rounded-xl hover:bg-muted/80 transition flex items-center gap-2 text-sm font-bold">
          Share
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-5 gap-10 mb-24">
        <div className="lg:col-span-3 space-y-4">
          <div className="aspect-video bg-muted rounded-[2rem] overflow-hidden border border-border">
            {sight.images?.[0] ? (
              <img src={sight.images[0]} alt={sight.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground/10">
                <Code size={80} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sight.tags?.map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-muted text-[10px] font-black uppercase tracking-widest text-foreground/60 border border-border">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col">
          <div className="text-[10px] text-accent font-black uppercase tracking-widest mb-3 bg-accent/10 w-fit px-3 py-1 rounded-lg">
            {sight.category || 'Project'}
          </div>
          <h1 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight">{sight.title}</h1>
          <p className="text-foreground/70 mb-8 whitespace-pre-wrap">{sight.description || 'No description provided.'}</p>

          <div className="p-5 rounded-2xl border border-border bg-muted/30 mb-6">
            <div className="text-xs uppercase tracking-widest text-foreground/40 font-black mb-2">Built By</div>
            <div className="flex items-center gap-3">
              <img src={persona?.avatar_url || sight.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona?.name || sight.author?.z_name || 'anon'}`} alt="Author" className="w-12 h-12 rounded-full object-cover bg-muted" />
              <div>
                <div className="font-bold text-lg">{persona?.name || sight.author?.z_name || 'Anonymous'}</div>
                <div className="text-xs text-foreground/40 uppercase tracking-widest">Campus creator</div>
              </div>
            </div>
          </div>

          <div className="mt-auto flex gap-3">
            {sight.live_url && (
              <Link href={sight.live_url} target="_blank" className="flex-1 py-4 rounded-2xl bg-foreground text-background text-center font-black uppercase tracking-widest text-xs inline-flex items-center justify-center gap-2">
                <Globe size={16} /> Live Demo
              </Link>
            )}
            {sight.repo_url && (
              <Link href={sight.repo_url} target="_blank" className="flex-1 py-4 rounded-2xl bg-muted border border-border text-center font-black uppercase tracking-widest text-xs inline-flex items-center justify-center gap-2">
                <Code size={16} /> Repo
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}