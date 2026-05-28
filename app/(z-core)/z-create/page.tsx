'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { X, Image as ImageIcon, MessageSquare, Zap, BarChart2, Flame, MapPin, PlusSquare, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { userService } from '@/lib/services/userService';
import { postService } from '@/lib/services/postService';
// personas are included on the user object when available from the server fallback
import { useRef } from 'react';
import { useToast } from '@/components/toast';
import { ACTIVE_PERSONA_ALERT, getActivePersona } from '@/lib/persona-utils';

type PostType = 'regular' | 'confession' | 'poll' | 'hot_take' | 'missed_connection';

export default function ZCreate() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<PostType>('regular');
  const [content, setContent] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<{
    id: string;
    name: string;
    preview: string;
    blob: Blob | null;
    status: 'idle' | 'uploading' | 'done' | 'error';
    url?: string;
  }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const personas = (user as any)?.personas || [];
  const activePersona = getActivePersona(personas);

  const types = [
    { id: 'regular', name: 'Zyng', icon: MessageSquare, color: 'text-red-300' },
    { id: 'confession', name: 'Confess', icon: Zap, color: 'text-[#FFB800]' },
    { id: 'poll', name: 'Poll', icon: BarChart2, color: 'text-indigo-400' },
    { id: 'hot_take', name: 'Hot Take', icon: Flame, color: 'text-rose-500' },
    { id: 'missed_connection', name: 'Missed', icon: MapPin, color: 'text-emerald-400' },
  ];

  const { show } = useToast();

  const handleSubmit = async () => {
    // validate early and show feedback if missing
    if (!content.trim()) {
      show('Please enter some content for your Zyng.', 'error');
      return;
    }
    if (!activePersona?.id) {
      show(ACTIVE_PERSONA_ALERT, 'error');
      return;
    }
    if (!user?.id || !user.school_id) {
      show('Unable to identify your school. Please try again.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // If there are selected images, upload them concurrently first
      let uploadedUrls: string[] = [];
      if (selectedImages.length > 0) {
        setUploading(true);
        try {
          const uploadImage = async (img: typeof selectedImages[number]) => {
            setSelectedImages((s) => s.map((x) => (x.id === img.id ? { ...x, status: 'uploading' } : x)));
            const dataUrl = await dataUrlFromBlob(img.blob as Blob);
            const res = await fetch('/api/uploads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename: img.name, dataUrl }),
            });
            const json = await res.json();
            if (res.ok && json.url) {
              setSelectedImages((s) => s.map((x) => (x.id === img.id ? { ...x, status: 'done', url: json.url } : x)));
              return json.url as string;
            }
            // Log server response for easier debugging
            console.error('Upload failed response', { status: res.status, body: json });
            setSelectedImages((s) => s.map((x) => (x.id === img.id ? { ...x, status: 'error' } : x)));
            throw new Error(json?.error || 'Upload failed');
          };

          uploadedUrls = await Promise.all(selectedImages.map((img) => uploadImage(img)));
          if (uploadedUrls.length > 0) setMediaUrl(uploadedUrls[0]);
          } catch (err) {
            console.error('One or more uploads failed', err);
            show('Image upload failed. Please try again.', 'error');
            setUploading(false);
            setIsSubmitting(false);
            return;
          } finally {
            setUploading(false);
          }
      }

      await postService.createPost({
        user_id: user.id,
        persona_id: activePersona.id,
        school_id: user.school_id,
        type: activeType,
        content,
        hashtag: hashtag || null,
        media_url: uploadedUrls[0] || mediaUrl || null,
        media_urls: uploadedUrls.length ? uploadedUrls : mediaUrl ? [mediaUrl] : null,
        poll: activeType === 'poll' ? { question: content, options: pollOptions.filter((o) => o && o.trim()) } : undefined,
      });
      router.push('/z-feed');
    } catch (err) {
      console.error('Failed to create post', err);
      show('Failed to create post. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilePick = () => fileInputRef.current?.click();

  // helpers for compression and conversion
  const dataUrlFromBlob = (blob: Blob) => new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });

  const compressImage = async (file: File) => {
    const originalDataUrl = await new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });

    // create image
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = originalDataUrl;
    });

    const maxDim = 1200;
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const ratio = width / height;
      if (ratio > 1) {
        width = maxDim;
        height = Math.round(maxDim / ratio);
      } else {
        height = maxDim;
        width = Math.round(maxDim * ratio);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unsupported');
    ctx.drawImage(img, 0, 0, width, height);

    // try decreasing quality until under target or minimum quality reached
    const targetBytes = 200 * 1024; // 200KB target
    const qualities = [0.9, 0.75, 0.6, 0.45, 0.3];
    for (const q of qualities) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve as any, 'image/jpeg', q));
      if (!blob) continue;
      if (blob.size <= targetBytes || q === qualities[qualities.length - 1]) {
        const preview = await dataUrlFromBlob(blob);
        return { blob, preview };
      }
    }

    // fallback: return original file as blob
    return { blob: file, preview: originalDataUrl };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    const incoming: typeof selectedImages = [];
    for (const file of files) {
      try {
        const { blob, preview } = await compressImage(file);
        incoming.push({ id: String(Date.now()) + Math.random().toString(36).slice(2), name: file.name, preview, blob, status: 'idle' });
      } catch (err) {
        console.error('Compress failed', err);
      }
    }

    // Determine allowed count: if all compressed are small (<150KB) allow up to 3, else 1
    const smallThreshold = 150 * 1024;
    const allSmall = incoming.every((it) => (it.blob ? it.blob.size : Infinity) <= smallThreshold);
    const maxAllowed = allSmall ? 3 : 1;

    setSelectedImages((s) => {
      const combined = [...s, ...incoming];
      if (combined.length > maxAllowed) return combined.slice(0, maxAllowed);
      return combined;
    });

    // reset file input so same file can be reselected
    input.value = '';
  };

  return (
    <div className="flex-1 flex pb-24 flex-col bg-background">
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <Link href="/z-feed" className="flex items-center gap-2 text-foreground/40 hover:text-foreground transition-colors">
          <ChevronLeft size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Back to Feed</span>
        </Link>
        <button
          onClick={handleSubmit}
            disabled={isSubmitting || !content.trim() || userLoading || uploading}
          className="bg-accent text-black px-6 py-2 rounded-full font-black text-xs uppercase shadow-lg shadow-accent/20 disabled:opacity-30 disabled:scale-95 transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" />
              Posting...
            </span>
          ) : (
            'Post Zyng'
          )}
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
                <span className="p-1 px-2 bg-accent/10 rounded border border-accent/20 flex items-center gap-2">
                  <img src={activePersona?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activePersona?.name || 'anonymous'}`} alt="avatar" className="w-4 h-4 rounded-full" />
                  {activePersona?.name || 'No Active Persona'}
                </span>
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
            <input title="Media" ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            <button onClick={handleFilePick} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-xs font-bold hover:bg-muted/80 transition-all text-foreground/60">
              <ImageIcon size={16} /> Add Media
            </button>
            <input
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value)}
              placeholder="#hashtag"
              className="bg-background border border-border rounded-2xl py-2 px-3 text-sm placeholder:text-foreground/30"
            />
            {activeType === 'poll' && (
              <button
                onClick={() => setShowPollModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-xl text-xs font-bold hover:bg-indigo-500/20 transition-all text-indigo-400 border border-indigo-500/20"
              >
                <PlusSquare size={16} /> Add Options
              </button>
            )}
            <div className="ml-auto text-[10px] font-black text-foreground/20 uppercase tracking-widest">{content.length} / 500</div>
          </div>
          {selectedImages.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-bold mb-2">Media preview</div>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {selectedImages.map((img) => (
                  <div key={img.id} className="relative">
                    <img src={img.preview} alt={img.name} className="w-full rounded-xl object-cover h-40" />
                    <button
                      title="select"
                      type="button"
                      onClick={() => setSelectedImages((s) => s.filter((x) => x.id !== img.id))}
                      className="absolute top-2 right-2 bg-black/40 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                    {img.status === 'uploading' && <div className="absolute inset-0 flex items-center justify-center"><div className="px-2 py-1 rounded-full bg-black/40 text-white text-xs">Uploading…</div></div>}
                    {img.status === 'error' && <div className="absolute inset-0 flex items-center justify-center"><div className="px-2 py-1 rounded-full bg-red-600/80 text-white text-xs">Error</div></div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {activeType === 'poll' && pollOptions.length > 0 && (
        <div onClick={() => setShowPollModal(true)} className="cursor-pointer max-w-xl mx-auto mt-6 space-y-3 px-6 md:px-12">
          <div className="text-sm font-bold">Poll preview</div>
          {content ? <div className="text-lg font-extrabold">{content}</div> : <div className="text-sm text-foreground/40">No question set</div>}
          <div className="grid grid-cols-1 gap-2">
            {pollOptions.map((opt, i) => (
              <div key={i} className="px-4 py-2 rounded-xl border border-border bg-background/50 text-sm">{opt || `Option ${i + 1}`}</div>
            ))}
          </div>
        </div>
      )}
      {showPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-accent">Poll</div>
                <h2 className="text-2xl font-semibold tracking-tight mt-3">Edit poll question & options</h2>
              </div>
              <button title="Close" onClick={() => setShowPollModal(false)} className="text-foreground/40 hover:text-foreground">
                <X />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="text-sm text-foreground/60">The post details field will be used as the poll question.</div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Options</div>
                  <button
                    type="button"
                    onClick={() => setPollOptions((s) => [...s, ''])}
                    className="text-xs font-bold uppercase text-accent"
                  >
                    Add option
                  </button>
                </div>

                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={opt}
                        onChange={(e) => setPollOptions((s) => s.map((v, i) => (i === idx ? e.target.value : v)))}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 rounded-xl border border-border bg-background py-2 px-3"
                      />
                      <button
                        type="button"
                        onClick={() => setPollOptions((s) => s.filter((_, i) => i !== idx))}
                        disabled={pollOptions.length <= 1}
                        className="text-sm text-red-500 disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={() => {
                  setShowPollModal(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn flex-1"
                onClick={() => {
                  // trim empty options
                  setPollOptions((s) => s.map((o) => o.trim()));
                  setShowPollModal(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
