'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { Search, Loader2, Users, MessageSquare, Tag, MapPin, Briefcase, UserCircle2, Home } from 'lucide-react';

export default function AlumniSearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const { data: results, isLoading } = useQuery({
    queryKey: ['alumni-search', query, activeTab],
    queryFn: async () => {
      if (!query) return null;
      const { data, error } = await supabase.from('posts').select('*, persona:personas(*)').ilike('content', `%${query}%`).limit(10);
      if (error) throw error;
      return data;
    },
    enabled: query.length > 2,
  });

  const { data: people } = useQuery({
    queryKey: ['alumni-search-people', query],
    queryFn: async () => {
      if (query.length < 3) return [];
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, z_name, bio, trust_score, school_id, school:schools(name), personas(name)')
        .or(`full_name.ilike.%${query}%,z_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
    enabled: query.length > 2,
  });

  const { data: opportunities } = useQuery({
    queryKey: ['alumni-search-jobs', query],
    queryFn: async () => {
      if (query.length < 3) return [];
      const { data, error } = await supabase
        .from('opportunities')
        .select('id, title, company, description, type, created_at')
        .or(`title.ilike.%${query}%,company.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
    enabled: query.length > 2,
  });

  const { data: rooms } = useQuery({
    queryKey: ['alumni-search-rooms', query],
    queryFn: async () => {
      if (query.length < 3) return [];
      const { data, error } = await supabase
        .from('zing_rooms')
        .select('id, name, description, is_private, created_at')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
    enabled: query.length > 2,
  });

  return (
    <div className="space-y-8 text-white">
      <header>
        <div className="relative mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search alumni, posts, or opportunities..." className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-14 pr-6 py-5 text-lg font-bold focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex gap-3 overflow-x-auto">
          {['All', 'Posts', 'People', 'Trends', 'Campus'].map((cat) => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${activeTab === cat ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}>{cat}</button>
          ))}
        </div>
      </header>

      {query.length < 3 ? (
        <div className="text-center py-20 text-white/40">Search the alumni network.</div>
      ) : isLoading ? (
        <Loader2 className="animate-spin text-indigo-400" />
      ) : !results || results.length === 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-white/30 font-black mb-2">People</div>
              <div className="text-2xl font-black">{people?.length || 0}</div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-white/30 font-black mb-2">Opportunities</div>
              <div className="text-2xl font-black">{opportunities?.length || 0}</div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-white/30 font-black mb-2">Rooms</div>
              <div className="text-2xl font-black">{rooms?.length || 0}</div>
            </div>
          </div>

          <div className="space-y-6">
            {!!people?.length && (
              <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/30">People</h3>
                {people.map((person: any) => (
                  <div key={person.id} className="bg-white/5 border border-white/5 rounded-[1.5rem] p-4 flex items-start gap-4">
                    <UserCircle2 className="text-indigo-400 mt-1" />
                    <div className="flex-1">
                      <div className="font-black">{person.full_name || person.z_name || 'Alumni Member'}</div>
                      <div className="text-white/40 text-sm">{person.bio || 'Professional profile'}</div>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {!!opportunities?.length && (
              <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Opportunities</h3>
                {opportunities.map((opp: any) => (
                  <div key={opp.id} className="bg-white/5 border border-white/5 rounded-[1.5rem] p-4 flex items-start gap-4">
                    <Briefcase className="text-indigo-400 mt-1" />
                    <div className="flex-1">
                      <div className="font-black">{opp.title}</div>
                      <div className="text-white/40 text-sm">{opp.company || 'Alumni Network'} • {opp.type || 'Role'}</div>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {!!rooms?.length && (
              <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Rooms</h3>
                {rooms.map((room: any) => (
                  <div key={room.id} className="bg-white/5 border border-white/5 rounded-[1.5rem] p-4 flex items-start gap-4">
                    <Home className="text-indigo-400 mt-1" />
                    <div className="flex-1">
                      <div className="font-black">{room.name}</div>
                      <div className="text-white/40 text-sm">{room.description || 'Private alumni room'}</div>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((post: any) => (
            <div key={post.id} className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
              <div className="font-black">{post.persona?.name || 'Anonymous'}</div>
              <div className="text-white/40 text-sm">{post.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
