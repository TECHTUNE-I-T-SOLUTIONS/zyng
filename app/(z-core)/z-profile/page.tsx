'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/services/userService';
import { postService } from '@/lib/services/postService';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/toast';
import { Settings, Shield, LogOut, Award, Users, BookOpen, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/db/supabase';

export default function ProfilePage() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => userService.getCurrentUser(),
  });

  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: myPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', 'me'],
    queryFn: () => user?.id ? postService.getPostsByUser(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const editPostId = searchParams?.get?.('editPostId');
    if (!editPostId) return;
    // if posts are already loaded, try to open the edit modal from local posts
    if (myPosts && myPosts.length > 0) {
      const target = myPosts.find((p: any) => String(p.id) === String(editPostId));
      if (target) {
        setEditingPost(target);
        setEditContent(target.content || '');
        // remove query param
        try { router.replace('/z-profile'); } catch (e) {}
        return;
      }
    }

    // fallback: fetch the post directly
    (async () => {
      try {
        const p = await postService.getPostById(editPostId);
        if (p) {
          setEditingPost(p);
          setEditContent(p.content || '');
          try { router.replace('/z-profile'); } catch (e) {}
        }
      } catch (err) {
        // ignore
      }
    })();
  }, [searchParams, myPosts]);

  // Personas fallback: if API returns empty, use personas included on user
  const effectivePersonas = myPosts && myPosts.length === 0 && user?.personas ? user.personas : undefined;

  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editContent, setEditContent] = useState<string>('');

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: any) => postService.updatePost(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts', 'me'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts', 'me'] }),
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/in/login';
  };

  const handleAvatarPick = () => fileRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl, resourceType: 'image' }),
        });
        const json = await res.json();
        if (res.ok && json.url) {
          await userService.updateProfile({ avatar_url: json.url });
          window.location.reload();
        } else {
          console.error('Avatar upload failed', json);
          toast.show('Avatar upload failed', 'error');
        }
      } catch (err) {
        console.error(err);
        toast.show('Avatar upload failed', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // Helpers and state for edit-modal media uploads
  const editFileRef = useRef<HTMLInputElement | null>(null);
  const [editingMedia, setEditingMedia] = useState<Array<any>>([]);

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

    const targetBytes = 200 * 1024;
    const qualities = [0.9, 0.75, 0.6, 0.45, 0.3];
    for (const q of qualities) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve as any, 'image/jpeg', q));
      if (!blob) continue;
      if (blob.size <= targetBytes || q === qualities[qualities.length - 1]) {
        const preview = await dataUrlFromBlob(blob);
        return { blob, preview };
      }
    }

    return { blob: file, preview: originalDataUrl };
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black mb-2">Not Signed In</h2>
        <p className="text-foreground/40 mb-8">Please login to view your profile.</p>
        <button className="bg-accent text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 pb-24 relative">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Zynger Profile</h1>
          <button title="Settings" className="p-3 bg-muted border border-border rounded-xl hover:bg-muted/80 transition-all">
            <Settings size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted border border-border rounded-[2.5rem] p-8 shadow-2xl shadow-accent/5"
            >
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-3xl bg-accent overflow-hidden flex items-center justify-center text-4xl font-black text-black">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">{user.full_name?.[0] || user.z_name?.[0] || 'U'}</div>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{user.full_name || 'Zyng User'}</h2>
                  <p className="text-accent font-bold uppercase tracking-widest text-xs mt-1">@{user.z_name || 'anonymous'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/40 p-4 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2 text-foreground/40 text-[10px] font-black uppercase mb-1">
                    <BookOpen size={12} /> University
                  </div>
                  <div className="text-sm font-bold">{user.school?.name || 'Not Selected'}</div>
                </div>
                <div className="bg-background/40 p-4 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2 text-foreground/40 text-[10px] font-black uppercase mb-1">
                    <Award size={12} /> Trust Level
                  </div>
                  <div className="text-sm font-bold">{user.trust_score >= 100 ? 'Verified' : 'Newcomer'}</div>
                </div>
              </div>
              <div className="mt-4">
                <input title="Upload Avatar" ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <button onClick={handleAvatarPick} className="mt-3 bg-muted px-4 py-2 rounded-xl text-sm">Upload Avatar</button>
              </div>
            </motion.div>

              <div className="bg-muted border border-border rounded-[2.5rem] p-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-6">Your Posts</h3>
                <div className="space-y-4">
                  {postsLoading ? (
                    <div className="text-center text-foreground/40">Loading posts...</div>
                  ) : (myPosts && myPosts.length > 0 ? (
                    myPosts.map((p: any) => (
                      <div key={p.id} className="p-4 bg-background/40 rounded-2xl border border-border/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                          <div className="md:col-span-2">
                            <div className="text-sm font-medium leading-6">{p.content}</div>
                            <div className="mt-3 text-[11px] text-foreground/40 flex items-center gap-2">
                              <div>{new Date(p.created_at).toLocaleString()}</div>
                              {p.hashtags && p.hashtags.length > 0 && (
                                <div className="ml-2 flex gap-2 flex-wrap">
                                  {p.hashtags.map((h: string) => (
                                    <a key={h} href={`/z-search?q=${encodeURIComponent(h)}`} className="text-accent text-xs font-black py-1 px-2 bg-muted rounded-full">#{h}</a>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex gap-2">
                              <button onClick={() => { setEditingPost(p); setEditContent(p.content); }} className="text-xs font-black uppercase text-foreground/40 hover:text-accent">Edit</button>
                              <button onClick={async () => { if (confirm('Delete this post?')) await deleteMutation.mutateAsync(p.id); }} className="text-xs font-black uppercase text-red-500">Delete</button>
                            </div>
                          </div>

                          <div className="md:col-span-1">
                            {p.media_urls && p.media_urls.length > 0 ? (
                              <div className="grid grid-cols-1 gap-2">
                                {p.media_urls.map((url: string, i: number) => (
                                  <div key={i} className="w-full h-36 rounded-xl overflow-hidden">
                                    <img src={url} alt={`post-image-${i}`} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="w-full h-36 rounded-xl bg-muted flex items-center justify-center text-foreground/40">No media</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-foreground/40">You have no posts yet.</div>
                  ))}
                </div>
              </div>

            <div className="bg-muted border border-border rounded-[2.5rem] p-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-6 flex items-center gap-2">
                <Users size={14} /> ACTIVE ZYNCS
              </h3>
              <div className="space-y-4">
                {user.personas && user.personas.length > 0 ? (
                  user.personas.map((persona: any) => (
                    <div key={persona.id} className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-border/50 hover:border-accent/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted-foreground/20 flex items-center justify-center font-bold">
                          {persona.name[0]}
                        </div>
                        <div className="font-bold">{persona.name}</div>
                      </div>
                      <div className="text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full">
                        Trust: {persona.reputation}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-foreground/30 text-xs font-black uppercase tracking-widest text-center py-4">No personas created yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-accent/10 border border-accent/20 rounded-[2.5rem] p-8 text-center"
            >
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-black">
                  <Shield size={40} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-accent mb-2">TRUST SCORE</h3>
              <div className="text-5xl font-black mb-4">{user.trust_score}</div>
              <div className="w-full bg-accent/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-accent h-full transition-all duration-1000" 
                  style={{ width: `${Math.min(user.trust_score / 10, 100)}%` }} 
                />
              </div>
              <p className="text-[10px] text-accent/60 font-bold uppercase mt-4 tracking-tighter">
                {user.trust_score > 500 ? 'TOP 1% OF CAMPUS' : 'BUILDING REPUTATION'}
              </p>
            </motion.div>

            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-full bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl py-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-red-500/20 transition-all mt-auto"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-background border border-border p-8 rounded-[2.5rem] text-center shadow-2xl"
            >
              <button 
                title="Close"
                onClick={() => setShowLogoutModal(false)}
                className="absolute top-6 right-6 text-foreground/20 hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} />
              </div>
              
              <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight uppercase">Leaving so soon?</h2>
              <p className="text-foreground/40 text-sm mb-8 font-medium italic">Your active personas will remain live, but you won't receive real-time notifications.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  onClick={handleSignOut}
                >
                  Confirm Sign Out
                </button>
                <button 
                  className="w-full bg-muted text-foreground/40 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:text-foreground transition-all"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Stay in Zyng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      <AnimatePresence>
        {editingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingPost(null)} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-background border border-border p-8 rounded-2xl">
              <h3 className="text-lg font-black mb-4">Edit Post</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs font-black uppercase text-foreground/50">Content</label>
                  <textarea title="Edit Content" value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full min-h-[120px] p-3 border border-border rounded-xl bg-muted mt-1" />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-foreground/50">Type</label>
                  <select title="Edit Type" value={editingPost?.type || 'default'} onChange={(e) => setEditingPost({ ...editingPost, type: e.target.value })} className="w-full p-2 mt-1 rounded-xl border border-border bg-background">
                    <option value="default">Default</option>
                    <option value="confession">Confession</option>
                    <option value="hot_take">Hot Take</option>
                    <option value="poll">Poll</option>
                    <option value="missed_connection">Missed Connection</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-foreground/50">Hashtags (comma separated)</label>
                  <input title="Edit Hashtags" value={(editingPost?.hashtags || []).join(', ')} onChange={(e) => setEditingPost({ ...editingPost, hashtags: e.target.value.split(',').map((s:any) => s.replace(/^#/, '').trim()).filter(Boolean) })} className="w-full p-2 mt-1 rounded-xl border border-border bg-background" />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-foreground/50">Persona</label>
                  <select title="Edit Persona" value={editingPost?.persona_id || (user?.personas?.[0]?.id ?? '')} onChange={(e) => setEditingPost({ ...editingPost, persona_id: e.target.value })} className="w-full p-2 mt-1 rounded-xl border border-border bg-background">
                    {user?.personas?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs font-black uppercase text-foreground/50">Media</label>
                  <div className="space-y-2 mt-2">
                    <input ref={editFileRef} title="Add media" type="file" accept="image/*" multiple onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      const incoming: any[] = [];
                      for (const f of files) {
                        try {
                          const { blob, preview } = await compressImage(f);
                          incoming.push({ id: String(Date.now()) + Math.random().toString(36).slice(2), file: blob, preview, status: 'pending', url: null });
                        } catch (err) {
                          console.error('compress failed', err);
                        }
                      }
                      setEditingMedia((s) => [...s, ...incoming]);
                      (e.target as HTMLInputElement).value = '';
                    }} className="hidden" />

                    <div className="flex flex-wrap gap-3">
                      {(editingPost?.media_urls || []).map((m: string, i: number) => (
                        <div key={`f-${i}`} className="w-36 h-36 rounded-xl overflow-hidden border border-border bg-background relative">
                          <img src={m} alt={`media-${i}`} className="w-full h-full object-cover" />
                          <button onClick={() => {
                            const arr = Array.from(editingPost.media_urls || []);
                            arr.splice(i, 1);
                            setEditingPost({ ...editingPost, media_urls: arr });
                          }} className="absolute top-2 right-2 bg-black/40 text-white rounded-full p-1">X</button>
                        </div>
                      ))}

                      {editingMedia.map((m, i) => (
                        <div key={m.id} className="w-36 h-36 rounded-xl overflow-hidden border border-border bg-background relative">
                          <img src={m.preview} alt={`preview-${i}`} className="w-full h-full object-cover" />
                          <button onClick={() => setEditingMedia((s) => s.filter((x) => x.id !== m.id))} className="absolute top-2 right-2 bg-black/40 text-white rounded-full p-1">X</button>
                          {m.status === 'uploading' && <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm">Uploading…</div>}
                        </div>
                      ))}

                      <button onClick={() => editFileRef.current?.click()} className="w-36 h-36 rounded-xl border border-dashed border-border flex items-center justify-center text-foreground/40 hover:bg-muted transition-all">Add Media</button>
                    </div>
                  </div>
                </div>
                {editingPost?.type === 'poll' && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-black uppercase text-foreground/50">Poll Options</label>
                    <div className="space-y-2 mt-2">
                      {(editingPost?.poll_options || []).map((opt: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <input title="Edit Poll Option"value={opt} onChange={(e) => {
                            const arr = Array.from(editingPost.poll_options || []);
                            arr[idx] = e.target.value;
                            setEditingPost({ ...editingPost, poll_options: arr });
                          }} className="flex-1 p-2 rounded-xl border border-border bg-background" />
                          <button onClick={() => {
                            const arr = Array.from(editingPost.poll_options || []);
                            arr.splice(idx, 1);
                            setEditingPost({ ...editingPost, poll_options: arr });
                          }} className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500">Remove</button>
                        </div>
                      ))}
                      <button onClick={() => setEditingPost({ ...editingPost, poll_options: [...(editingPost.poll_options || []), ''] })} className="mt-2 px-4 py-2 rounded-xl bg-muted">Add Option</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4 justify-end">
                <button onClick={() => setEditingPost(null)} className="px-4 py-2 rounded-xl bg-muted">Cancel</button>
                <button onClick={async () => {
                  try {
                    const updates: any = { content: editContent, type: editingPost.type };
                    if (Array.isArray(editingPost.hashtags)) updates.hashtags = editingPost.hashtags;

                    // start with existing media URLs (persisted)
                    const finalMedia: string[] = Array.isArray(editingPost.media_urls) ? editingPost.media_urls.filter(Boolean) : [];

                    // upload any new attachments from editingMedia
                    for (let i = 0; i < editingMedia.length; i++) {
                      const m = editingMedia[i];
                      if (m.url) {
                        finalMedia.push(m.url);
                        continue;
                      }
                      if (!m.file) continue;
                      // mark uploading
                      setEditingMedia((s) => s.map((x) => x.id === m.id ? { ...x, status: 'uploading' } : x));
                      try {
                        const dataUrl = await dataUrlFromBlob(m.file as Blob);
                        const res = await fetch('/api/uploads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: 'edit-' + Date.now() + '.jpg', dataUrl, resourceType: 'image' }) });
                        const json = await res.json();
                        if (res.ok && json.url) {
                          finalMedia.push(json.url);
                          setEditingMedia((s) => s.map((x) => x.id === m.id ? { ...x, status: 'done', url: json.url } : x));
                        } else {
                          setEditingMedia((s) => s.map((x) => x.id === m.id ? { ...x, status: 'error' } : x));
                        }
                      } catch (err) {
                        console.error('upload error', err);
                        setEditingMedia((s) => s.map((x) => x.id === m.id ? { ...x, status: 'error' } : x));
                      }
                    }

                    if (finalMedia.length) updates.media_urls = finalMedia;

                    await updateMutation.mutateAsync({ id: editingPost.id, updates });
                    setEditingPost(null);
                    setEditingMedia([]);
                  } catch (err) { console.error(err); toast.show('Update failed', 'error'); }
                }} className="px-4 py-2 rounded-xl bg-accent text-black font-black">Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
