'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sightService } from '@/lib/services/sightService';
import { motion } from 'framer-motion';
import { Lightbulb, Plus, Code, Globe, Loader2, Search, MoreVertical, Pencil, Trash2, X, Upload, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { slugify } from '@/lib/utils';
import { userService } from '@/lib/services/userService';

export default function ZSightsPage() {
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingSight, setEditingSight] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('Technology');
  const [editTags, setEditTags] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  
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

  const openEditModal = (sight: any) => {
    setEditingSight(sight);
    setEditTitle(sight.title || '');
    setEditDescription(sight.description || '');
    setEditCategory(sight.category || 'Technology');
    setEditTags(Array.isArray(sight.tags) ? sight.tags.join(', ') : '');
    setEditLink(sight.link || sight.repo_url || sight.live_url || '');
    setEditImages(Array.isArray(sight.images) ? sight.images : []);
    setSelectedImages([]);
    setErrorMsg('');
    setOpenMenuId(null);
  };

  const handleNewImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setSelectedImages((current) => [...current, ...files]);
    setEditImages((current) => [...current, ...files.map((file) => URL.createObjectURL(file))]);
    event.target.value = '';
  };

  const handleSaveSight = async () => {
    if (!editingSight || !user?.id) return;
    if (!editTitle.trim() || !editDescription.trim()) {
      setErrorMsg('Title and description are required.');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const uploaded: string[] = [];
      for (const file of selectedImages) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl }),
        });
        const json = await res.json();
        if (res.ok && json.url) uploaded.push(json.url);
      }
      const existing = editImages.filter((src) => src.startsWith('http'));
      await sightService.saveSight({
        id: editingSight.id,
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory,
        tags: editTags.split(',').map((tag) => tag.trim()).filter(Boolean),
        images: [...existing, ...uploaded],
        link: editLink.trim() || undefined,
        user_id: user.id,
      } as any);
      setEditingSight(null);
      queryClient.invalidateQueries({ queryKey: ['sights'] });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const shareSight = async (sight: any) => {
    const url = `${window.location.origin}/z-sights/${slugify(`${sight.title}-${sight.id}`)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: sight.title, text: sight.description || 'Check out this Z-Sight on Zyng.', url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      await navigator.clipboard.writeText(url);
    }
  };

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
                  <div className="absolute right-3 top-3 z-20">
                    <button
                      type="button"
                      aria-label="Project actions"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId((current) => current === sight.id ? null : sight.id);
                      }}
                      className="rounded-lg border border-white/20 bg-background/80 p-2 text-foreground/70 backdrop-blur hover:text-foreground"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === sight.id && (
                      <div className="absolute right-0 top-10 w-36 rounded-xl border border-border bg-background p-2 shadow-xl">
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); shareSight(sight); setOpenMenuId(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                          <Share2 size={14} /> Share
                        </button>
                        {(sight.user_id === user?.id || sight.author?.id === user?.id) && (
                          <>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditModal(sight); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                              <Pencil size={14} /> Edit
                            </button>
                            <button onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!confirm('Delete this project?')) return;
                              await sightService.removeSight(sight.id);
                              queryClient.invalidateQueries({ queryKey: ['sights'] });
                              setOpenMenuId(null);
                            }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10">
                              <Trash2 size={14} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
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

      {editingSight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingSight(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-border bg-background p-6 shadow-2xl md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Edit Project</h2>
              <button title="Close modal" aria-label="Close modal" onClick={() => setEditingSight(null)} className="rounded-xl bg-muted p-2"><X size={20} /></button>
            </div>
            {errorMsg && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-500">{errorMsg}</div>}
            <div className="space-y-4">
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Project title" className="w-full rounded-2xl border border-border bg-muted p-3 outline-none focus:border-accent" />
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Project description" className="h-32 w-full rounded-2xl border border-border bg-muted p-3 outline-none focus:border-accent" />
              <div className="grid gap-4 md:grid-cols-2">
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="rounded-2xl border border-border bg-muted p-3 outline-none focus:border-accent">
                  {['Technology', 'Design', 'Business', 'Art', 'Science', 'Community', 'Other'].map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <input value={editLink} onChange={(e) => setEditLink(e.target.value)} placeholder="Project link" className="rounded-2xl border border-border bg-muted p-3 outline-none focus:border-accent" />
              </div>
              <input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="Tags, comma separated" className="w-full rounded-2xl border border-border bg-muted p-3 outline-none focus:border-accent" />
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleNewImages} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-sm font-black uppercase tracking-widest text-foreground/50 hover:border-accent hover:text-accent">
                <Upload size={18} /> Add Images
              </button>
              {!!editImages.length && (
                <div className="flex flex-wrap gap-3">
                  {editImages.map((src, index) => (
                    <div key={`${src}-${index}`} className="relative h-24 w-32 overflow-hidden rounded-xl border border-border">
                      <img src={src} alt="Project preview" className="h-full w-full object-cover" />
                      <button onClick={() => setEditImages((current) => current.filter((_, i) => i !== index))} className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setEditingSight(null)} className="rounded-xl bg-muted px-5 py-3 font-bold">Cancel</button>
                <button onClick={handleSaveSight} disabled={saving} className="rounded-xl bg-accent px-6 py-3 font-black text-black disabled:opacity-60">{saving ? 'Saving...' : 'Save Project'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
