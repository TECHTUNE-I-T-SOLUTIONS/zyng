'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/services/userService';
import { sightService } from '@/lib/services/sightService';
import { ArrowLeft, Upload, Loader2, X, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CreateSightPage() {
  const router = useRouter();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    // 5MB max total size for projects
    const MAX_SIZE = 5 * 1024 * 1024;
    const currentSize = selectedImages.reduce((acc, file) => acc + file.size, 0);
    const newFilesSize = files.reduce((acc, file) => acc + file.size, 0);
    
    if (currentSize + newFilesSize > MAX_SIZE) {
      setErrorMsg('Total image size cannot exceed 5MB');
      return;
    }
    setErrorMsg('');

    const newSelected = [...selectedImages, ...files];
    setSelectedImages(newSelected);
    setImagePreviews(newSelected.map(file => URL.createObjectURL(file)));
  };

  const removeImage = (index: number) => {
    const newSelected = [...selectedImages];
    newSelected.splice(index, 1);
    setSelectedImages(newSelected);
    setImagePreviews(newSelected.map(file => URL.createObjectURL(file)));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Title and description are required.');
      return;
    }
    if (!user?.id) {
      setErrorMsg('You must be logged in to post a project.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    try {
      const imageUrls: string[] = [];
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
        if (res.ok && json.url) imageUrls.push(json.url);
      }

      await sightService.createSight({
        title: title.trim(),
        description: description.trim(),
        category,
        tags,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        link: repoUrl || liveUrl || undefined,
        user_id: user.id,
      });
      
      router.push('/z-sights');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to publish project. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <Link href="/z-sights" className="p-3 bg-muted rounded-2xl hover:bg-muted/80 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Publish a Project</h1>
            <p className="text-foreground/50 text-sm font-bold">Share your innovation with the Zyng community.</p>
          </div>
        </header>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-2xl text-sm">
            {errorMsg}
          </div>
        )}

        <div className="bg-muted/30 border border-border rounded-[2rem] p-8 md:p-10 space-y-8">
          
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Project Title</label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="E.g., Zyng - Campus Social Network"
              className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-xl font-bold focus:border-accent outline-none transition-all placeholder:text-foreground/20" 
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="What problem does it solve? What technologies did you use?"
              className="w-full bg-background border border-border rounded-2xl px-6 py-4 h-40 font-medium focus:border-accent outline-none transition-all placeholder:text-foreground/20 resize-none" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full bg-background border border-border rounded-2xl px-6 py-4 font-bold focus:border-accent outline-none transition-all appearance-none"
              >
                {['Technology', 'Design', 'Business', 'Art', 'Science', 'Community', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Tags</label>
              <div className="flex gap-2">
                <input 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="React, Next.js, AI..."
                  className="flex-1 bg-background border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:border-accent outline-none transition-all" 
                />
                <button onClick={addTag} className="px-4 bg-muted border border-border rounded-2xl hover:bg-muted/80 transition-all font-black text-xs uppercase">
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {tags.map((t) => (
                    <span key={t} className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                      {t}
                      <button onClick={() => setTags(tags.filter(tag => tag !== t))} className="hover:text-foreground"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Repository URL (Optional)</label>
              <input 
                value={repoUrl} 
                onChange={(e) => setRepoUrl(e.target.value)} 
                placeholder="https://github.com/..."
                className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:border-accent outline-none transition-all" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Live URL (Optional)</label>
              <input 
                value={liveUrl} 
                onChange={(e) => setLiveUrl(e.target.value)} 
                placeholder="https://my-project.com"
                className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:border-accent outline-none transition-all" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Showcase Images (Max 5MB)</label>
            <div 
              onClick={() => fileRef.current?.click()}
              className="w-full bg-background border-2 border-dashed border-border rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-accent transition-all group"
            >
              <Upload size={32} className="text-foreground/20 group-hover:text-accent mb-4 transition-colors" />
              <span className="font-bold text-sm">Click to upload images</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mt-2">First image will be the cover</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            
            {imagePreviews.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-4 mt-6 scrollbar-hide">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-40 h-28 shrink-0 rounded-2xl overflow-hidden border border-border group">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeImage(i); }} 
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                      <X size={24} />
                    </button>
                    {i === 0 && (
                      <div className="absolute top-2 left-2 bg-accent text-black text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Cover</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
            <button 
              disabled={uploading} 
              onClick={handleSubmit} 
              className="bg-accent text-black px-10 py-5 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-accent/20 disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest text-sm"
            >
              {uploading ? <><Loader2 size={20} className="animate-spin" /> Publishing...</> : 'Publish Project'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
