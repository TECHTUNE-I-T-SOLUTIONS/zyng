'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Loader2, MessageSquare, Heart, Share2, ArrowLeft, Briefcase, MapPin, Sparkles } from 'lucide-react';
import { postService } from '@/lib/services/postService';
import { alumniService } from '@/lib/services/alumniService';
import { supabase } from '@/lib/db/supabase';

export default function AlumniPostDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: post, isLoading } = useQuery({
    queryKey: ['alumni-post', id],
    queryFn: () => postService.getPostById(id as string),
    enabled: !!id,
  });

  const { data: profile } = useQuery({
    queryKey: ['alumni-profile-for-match'],
    queryFn: () => alumniService.getProfileData(),
  });

  const { data: opportunities } = useQuery({
    queryKey: ['opportunity-match', id, profile?.user?.skills],
    queryFn: async () => {
      const skills = profile?.user?.skills || [];
      let query = supabase.from('opportunities').select('id, title, company, description, type, skills_required, created_at').order('created_at', { ascending: false }).limit(8);

      if (skills.length) {
        query = query.overlaps('skills_required', skills);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.user,
  });

  const topMatches = useMemo(() => {
    return (opportunities || []).slice(0, 3);
  }, [opportunities]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-400" /></div>;
  }

  if (!post) {
    return <div className="text-white">Post not found.</div>;
  }

  return (
    <div className="space-y-8 text-white">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-white/40 hover:text-white">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6">
        <article className="bg-white/5 border border-white/5 rounded-[2rem] p-8">
          <div className="text-xs uppercase tracking-widest text-indigo-400 font-black mb-4">Alumni Broadcast</div>
          <div className="flex items-center gap-3 mb-6 text-white/40 text-sm">
            <span>{post.persona?.name || 'Anonymous Alumni'}</span>
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleString()}</span>
          </div>
          <div className="text-3xl font-bold leading-relaxed mb-8">{post.content}</div>
          <div className="flex items-center gap-8 text-white/40 border-t border-white/10 pt-6">
            <span className="flex items-center gap-2"><Heart size={16} /> 0</span>
            <span className="flex items-center gap-2"><MessageSquare size={16} /> {post.replies?.length || 0}</span>
            <span className="flex items-center gap-2"><Share2 size={16} /> Share</span>
          </div>
        </article>

        <aside className="space-y-6">
          <section className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
            <div className="flex items-center gap-2 mb-4 text-indigo-400 font-black uppercase text-xs tracking-widest"><Sparkles size={16} /> Opportunity Match</div>
            <div className="space-y-3">
              {topMatches.length ? topMatches.map((opp: any) => (
                <div key={opp.id} className="bg-black/20 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-black">{opp.title}</div>
                      <div className="text-white/40 text-sm">{opp.company || 'Alumni Network'} • {opp.type || 'Role'}</div>
                    </div>
                    <Briefcase className="text-indigo-400 shrink-0 mt-1" size={18} />
                  </div>
                  <div className="mt-3 text-xs text-white/40 flex items-center gap-2">
                    <MapPin size={14} />
                    {opp.skills_required?.join(', ') || 'General fit'}
                  </div>
                </div>
              )) : <div className="text-white/30 italic text-sm">No direct match found yet.</div>}
            </div>
          </section>

          <section className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
            <div className="text-xs uppercase tracking-widest text-indigo-400 font-black mb-4">Your Skills</div>
            <div className="flex flex-wrap gap-2">
              {profile?.user?.skills?.length ? profile.user.skills.map((skill: string) => (
                <span key={skill} className="px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-black uppercase tracking-widest">{skill}</span>
              )) : <div className="text-white/30 italic text-sm">No skills saved yet.</div>}
            </div>
          </section>

          <section className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
            <div className="text-xs uppercase tracking-widest text-indigo-400 font-black mb-4">Actions</div>
            <div className="space-y-3">
              <Link href="/z-alumni/pro" className="block text-center bg-indigo-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs">Open Pro Hub</Link>
              <Link href="/z-alumni/search" className="block text-center bg-white/5 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs">Search More Opportunities</Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
