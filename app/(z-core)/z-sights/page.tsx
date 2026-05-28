'use client';

import { useQuery } from '@tanstack/react-query';
import { sightService } from '@/lib/services/sightService';
import { motion } from 'framer-motion';
import { Lightbulb, Plus, Eye, Code, Globe, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { slugify } from '@/lib/utils';

export default function ZSightsPage() {
  const [search, setSearch] = useState('');
  
  const { data: sights, isLoading } = useQuery({
    queryKey: ['sights'],
    queryFn: () => sightService.getSights(),
  });

  const getPersonaDisplay = (author: any) => {
    const activePersona = author?.personas?.find((persona: any) => persona.is_active);
    const fallbackPersona = author?.personas?.[0];
    return activePersona || fallbackPersona || null;
  };

  const filtered = sights?.filter((s: any) => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.description?.toLowerCase().includes(search.toLowerCase()) ||
    s.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-[10px] font-black uppercase tracking-widest mb-3">
              <Lightbulb size={12} /> Innovation Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Z-SIGHTS</h1>
            <p className="text-foreground/50 font-medium italic">Showcase your campus projects, startups, and ideas.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-accent transition-colors" size={18} />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..." 
                className="bg-muted border border-border rounded-2xl pl-12 pr-6 py-3 w-full md:w-64 focus:outline-none focus:border-accent transition-all text-sm"
              />
            </div>
            <Link href="/z-sights/create" className="bg-accent text-black px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all text-xs uppercase tracking-widest shadow-lg shadow-accent/20">
              <Plus size={20} />
              Publish
            </Link>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-[3rem]">
            <p className="text-foreground/40 font-bold italic">No projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((sight: any, i: number) => (
              <motion.div
                key={sight.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-muted/30 border border-border rounded-[2rem] overflow-hidden hover:border-accent/50 transition-all hover:shadow-2xl hover:shadow-accent/10 flex flex-col"
              >
                <div className="aspect-video relative overflow-hidden bg-background">
                  {sight.images && sight.images[0] ? (
                    <img src={sight.images[0]} alt={sight.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/10 bg-muted">
                      <Lightbulb size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto scrollbar-hide">
                    {sight.tags?.slice(0,3).map((t: string) => (
                      <span key={t} className="px-2 py-1 bg-background/40 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-white border border-white/20 whitespace-nowrap">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-black mb-2 line-clamp-1 group-hover:text-accent transition-colors">{sight.title}</h3>
                  <p className="text-sm text-foreground/60 line-clamp-2 mb-6 flex-1">
                    {sight.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <img src={getPersonaDisplay(sight.author)?.avatar_url || sight.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getPersonaDisplay(sight.author)?.name || sight.author?.z_name || 'anon'}`} alt="" className="w-6 h-6 rounded-full bg-muted object-cover" />
                      <span className="text-[10px] font-black uppercase text-foreground/60 tracking-widest">{getPersonaDisplay(sight.author)?.name || sight.author?.z_name || 'Anonymous'}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {sight.repo_url && <Code size={14} className="text-foreground/40" />}
                      {sight.live_url && <Globe size={14} className="text-foreground/40" />}
                    </div>
                  </div>

                  <Link href={`/z-sights/${slugify(`${sight.title}-${sight.id}`)}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {sight.title}</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
