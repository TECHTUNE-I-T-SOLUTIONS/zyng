'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { motion } from 'framer-motion';
import { Search, Filter, Users, MessageSquare, Tag, MapPin, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQ = (searchParams?.get('q') || '').toString();
  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState('All');

  // sync URL query param into the input when arriving via the layout search form
  useEffect(() => {
    const q = (searchParams?.get('q') || '').toString();
    if (q && q !== query) setQuery(q);
  }, [searchParams]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query, activeTab],
    queryFn: async () => {
      if (!query) return null;

      // People search
      const peopleQuery = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, z_name, avatar_url')
          .or(`z_name.ilike.%${query}%,full_name.ilike.%${query}%`)
          .limit(8);
        if (error) throw error;
        return data || [];
      };

      // Posts search
      const postsQuery = async () => {
        const tag = query.replace(/^#/, '').toLowerCase();
        const byContent = supabase.from('posts').select('*, persona:personas(*)').ilike('content', `%${query}%`).limit(12);

        // exact array match (case sensitive on array values)
        const byHashtagExact = supabase.from('posts').select('*, persona:personas(*)').contains('hashtags', [tag]).limit(12);

        // fuzzy match: cast hashtags to text and ilike for case-insensitive matching
        const byHashtagFuzzy = supabase.from('posts').select('*, persona:personas(*)').ilike('hashtags', `%${tag}%`).limit(12);

        const [res1, res2, res3] = await Promise.all([byContent, byHashtagExact, byHashtagFuzzy]);
        if ((res1 && res1.error) || (res2 && res2.error) || (res3 && res3.error)) throw (res1.error || res2.error || res3.error);
        const list1 = res1?.data || [];
        const list2 = res2?.data || [];
        const list3 = res3?.data || [];
        const map = new Map();
        [...list1, ...list2, ...list3].forEach((p: any) => map.set(p.id, p));
        return Array.from(map.values()).slice(0, 12);
      };

      if (activeTab === 'People') {
        const people = await peopleQuery();
        return { people };
      }

      if (activeTab === 'Posts') {
        const posts = await postsQuery();
        return { posts };
      }

      // All: fetch both and return structured result
      const [people, posts] = await Promise.all([peopleQuery(), postsQuery()]);
      return { people, posts };
    },
    enabled: query.length > 2,
  });

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <div className="relative group mb-6">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-accent transition-colors" size={24} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for people, posts, or trends..."
              className="w-full bg-muted border-2 border-border rounded-[2.5rem] pl-16 pr-8 py-6 text-xl font-bold focus:outline-none focus:border-accent transition-all shadow-xl"
            />
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { label: 'All', icon: Search },
              { label: 'Posts', icon: MessageSquare },
              { label: 'People', icon: Users },
              { label: 'Trends', icon: Tag },
              { label: 'Campus', icon: MapPin },
            ].map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveTab(cat.label)}
                className={`flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest ${
                  activeTab === cat.label
                    ? 'bg-accent text-black border-accent'
                    : 'bg-muted/30 border-border hover:border-accent hover:text-accent'
                }`}
              >
                <cat.icon size={14} />
                {cat.label}
              </button>
            ))}
            <button title="Filter" className="ml-auto p-3 border border-border rounded-2xl hover:bg-muted transition-all">
              <Filter size={18} />
            </button>
          </div>
        </header>

        {query.length < 3 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-muted rounded-[2.5rem] flex items-center justify-center text-foreground/20 mb-6">
              <Search size={48} />
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Search Zyng</h2>
            <p className="text-foreground/40 font-medium max-w-xs italic mx-auto">Find exactly what's happening on your campus right now.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
        ) : (!results || ((results.people?.length || 0) + (results.posts?.length || 0) === 0)) ? (
          <div className="text-center py-20">
            <p className="text-foreground/40 font-bold italic">No results found for "{query}".</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/30 px-2">RESULTS FOR "{query}"</h3>

            {/* People results */}
            {results?.people && results.people.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-black">People</h4>
                <div className="grid grid-cols-1 gap-3">
                  {results.people.map((u: any) => (
                    <Link key={u.id} href={`/z-profile?userId=${u.id}`} className="bg-muted/40 border border-border p-4 rounded-2xl flex items-center gap-3 hover:border-accent/20 transition-all">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold">{u.z_name?.[0]?.toUpperCase() || u.full_name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div className="font-black">{u.z_name || u.full_name}</div>
                        <div className="text-[11px] text-foreground/40">{u.full_name}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posts results */}
            {results?.posts && results.posts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-black">Posts</h4>
                <div className="grid grid-cols-1 gap-4">
                  {results.posts.map((post: any) => (
                    <Link key={post.id} href={`/z-post/${post.id}`} className="bg-muted/40 border border-border p-6 rounded-3xl hover:border-accent/20 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-black italic">{post.persona?.name || 'Anonymous'}</span>
                        <span className="text-[10px] text-foreground/30 font-black uppercase tracking-tighter">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-medium">{post.content}</p>
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {post.hashtags.map((h: string) => (
                            <Link key={h} href={`/z-search?q=${encodeURIComponent(h)}`} className="text-accent text-xs font-black">#{h}</Link>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
