'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { motion } from 'framer-motion';
import { Search, Filter, Users, MessageSquare, Tag, MapPin, Loader2 } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query, activeTab],
    queryFn: async () => {
      if (!query) return null;
      // Simple search implementation
      const { data, error } = await supabase
        .from('posts')
        .select('*, persona:personas(*)')
        .ilike('content', `%${query}%`)
        .limit(10);
      if (error) throw error;
      return data;
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
            <button className="ml-auto p-3 border border-border rounded-2xl hover:bg-muted transition-all">
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
             <p className="text-foreground/40 font-medium max-w-xs italic mx-auto">
                Find exactly what's happening on your campus right now.
             </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
             <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
        ) : !results || results.length === 0 ? (
          <div className="text-center py-20">
             <p className="text-foreground/40 font-bold italic">No results found for "{query}".</p>
          </div>
        ) : (
          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-widest text-foreground/30 px-2">RESULTS FOR "{query}"</h3>
             <div className="grid grid-cols-1 gap-4">
                {results.map((post: any) => (
                   <div key={post.id} className="bg-muted/40 border border-border p-6 rounded-3xl hover:border-accent/20 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-xs font-black italic">{post.persona?.name || 'Anonymous'}</span>
                         <span className="text-[10px] text-foreground/30 font-black uppercase tracking-tighter">
                            {new Date(post.created_at).toLocaleDateString()}
                         </span>
                      </div>
                      <p className="text-sm font-medium">{post.content}</p>
                   </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
