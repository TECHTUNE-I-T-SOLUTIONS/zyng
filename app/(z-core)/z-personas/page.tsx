'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, PlusCircle, ShieldCheck, CheckSquare2, Square, Trash2, UserCircle, X, Image as ImageIcon, Upload, AlertTriangle } from 'lucide-react';
import { userService } from '@/lib/services/userService';
import { createPersona, getPersonas, setActivePersona, updatePersonaAvatar, clearAllPersonas } from '@/lib/services/persona';
import { cn } from '@/lib/utils';

export default function ZPersonas() {
  const [isCreating, setIsCreating] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaAvatar, setNewPersonaAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activatingPersonaId, setActivatingPersonaId] = useState<string | null>(null);
  const [updatingPersonaAvatarId, setUpdatingPersonaAvatarId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; confirmLabel: string; confirmTone?: 'danger' | 'primary'; onConfirm: () => Promise<void> } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const createAvatarInputRef = useRef<HTMLInputElement | null>(null);
  const avatarTargetPersonaIdRef = useRef<string | null>(null);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const { data: apiPersonas, isLoading, refetch } = useQuery({
    queryKey: ['personas', user?.id],
    queryFn: () => (user?.id ? getPersonas(user.id).then((res) => res.data || []) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  // prefer server API personas but fallback to `user.personas` included on the user object
  const personas = (apiPersonas && apiPersonas.length > 0) ? apiPersonas : (user?.personas || []);
  const activePersona = personas?.find((persona: any) => persona.is_active);
  const personaLimitReached = (personas?.length || 0) >= 2;

  const uploadAvatar = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, dataUrl }),
    });

    const json = await res.json();
    if (!res.ok || !json.url) throw new Error(json?.error || 'Upload failed');
    return json.url as string;
  };

  const handleCreatePersona = async () => {
    if (!user?.id || !newPersonaName.trim()) return;
    const { error } = await createPersona(user.id, newPersonaName.trim(), newPersonaAvatar || null);
    if (!error) {
      setNewPersonaName('');
      setNewPersonaAvatar('');
      setIsCreating(false);
      await refetch();
    }
  };

  const handlePersonaClick = async (personaId: string) => {
    if (!user?.id || personaId === activePersona?.id) return;
    setActivatingPersonaId(personaId);
    try {
      await setActivePersona(personaId);
      await refetch();
    } finally {
      setActivatingPersonaId(null);
    }
  };

  const handleAvatarPick = async (file: File | null) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(file);
      setNewPersonaAvatar(url);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePersonaAvatarClick = (personaId: string) => {
    avatarTargetPersonaIdRef.current = personaId;
    avatarInputRef.current?.click();
  };

  const handleExistingAvatarPick = async (file: File | null) => {
    const personaId = avatarTargetPersonaIdRef.current;
    if (!file || !personaId) return;
    setUpdatingPersonaAvatarId(personaId);
    try {
      const url = await uploadAvatar(file);
      await updatePersonaAvatar(personaId, url);
      await refetch();
    } finally {
      setUpdatingPersonaAvatarId(null);
      avatarTargetPersonaIdRef.current = null;
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleClearAll = () => {
    setConfirmModal({
      title: 'Delete All Personas?',
      message: 'This will remove every persona on your account so you can create new ones from scratch.',
      confirmLabel: 'Delete All',
      confirmTone: 'danger',
      onConfirm: async () => {
        await clearAllPersonas();
        await refetch();
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-sm font-black uppercase tracking-widest text-accent">Persona Manager</h1>
        <button
          onClick={() => {
            if (personaLimitReached) return;
            setIsCreating(true);
          }}
          disabled={personaLimitReached}
          className="flex items-center gap-2 text-xs font-bold text-foreground/60 hover:text-accent transition-colors disabled:opacity-40 disabled:hover:text-foreground/60"
        >
          <PlusCircle size={16} /> New Persona
        </button>
      </header>

      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-10">
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 mb-6">Active Identities</h2>
            <div className="grid gap-4">
              {isLoading ? (
                <div className="py-16 flex justify-center">
                  <Loader2 className="animate-spin text-accent" />
                </div>
              ) : personas?.length ? (
                personas.map((persona: any) => (
                  <div
                    key={persona.id}
                    className={cn(
                      'w-full text-left p-5 rounded-2xl border flex items-center gap-4 relative group transition-all',
                      persona.id === activePersona?.id
                        ? 'bg-accent/5 border-accent/20 shadow-[0_0_20px_rgba(255,184,0,0.05)]'
                        : 'bg-muted/40 border-border hover:border-accent/30 hover:bg-muted/60'
                    )}
                  >
                    <button
                      type="button"
                      title="Change persona avatar"
                      aria-label={`Change avatar for ${persona.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePersonaAvatarClick(persona.id);
                      }}
                      className="relative w-14 h-14 rounded-full overflow-hidden border border-border bg-background flex items-center justify-center shadow-inner group/avatar shrink-0"
                    >
                      {updatingPersonaAvatarId === persona.id ? (
                        <Loader2 size={18} className="animate-spin text-accent" />
                      ) : persona.avatar_url ? (
                        <img src={persona.avatar_url} alt={persona.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle size={22} className="text-foreground/40" />
                      )}
                      <span className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/35 transition-colors flex items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100">
                        <Upload size={14} />
                      </span>
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg truncate">{persona.name}</span>
                        {persona.id === activePersona?.id && <ShieldCheck size={14} className="text-accent" />}
                      </div>
                      <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1">
                        Reputation: <span className="text-accent">{persona.reputation || 0}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      title={persona.id === activePersona?.id ? 'Active persona' : 'Set as active'}
                      aria-label={persona.id === activePersona?.id ? `${persona.name} is active` : `Set ${persona.name} as active`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePersonaClick(persona.id);
                      }}
                      className={cn(
                        'shrink-0 p-1.5 rounded-md transition-all',
                        persona.id === activePersona?.id
                          ? 'text-accent bg-accent/10'
                          : 'text-foreground/30 hover:text-foreground/60 hover:bg-background/50'
                      )}
                    >
                      {activatingPersonaId === persona.id ? (
                        <Loader2 size={18} className="animate-spin text-accent" />
                      ) : persona.id === activePersona?.id ? (
                        <CheckSquare2 size={20} />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="bg-muted/40 border border-dashed border-border rounded-2xl p-8 text-center text-sm text-foreground/40">
                  No personas yet. Create one to start posting.
                </div>
              )}
            </div>
          </section>

          <section className="bg-muted rounded-2xl p-8 border border-border space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-accent">Identity Isolation</h3>
            <p className="text-xs text-foreground/40 leading-relaxed font-medium">
              Zyng keeps personas separate from your account identity so you can participate with the tone you choose.
            </p>
            <div className="pt-4 flex gap-4 flex-wrap items-center">
              <div className="bg-background px-4 py-2 rounded-xl text-[10px] font-bold text-foreground/60">
                Campus: {user?.school?.name || 'Not selected'}
              </div>
              <button type="button" onClick={handleClearAll} className="bg-background px-4 py-2 rounded-xl text-[10px] font-bold text-rose-500/60 flex items-center gap-2 hover:bg-rose-500/5 transition-all">
                <Trash2 size={12} /> Clear all Data
              </button>
            </div>
            {personaLimitReached && (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                <AlertTriangle size={12} className="text-amber-400" />
                You can only keep two personas at once. Clear all data to create new ones.
              </div>
            )}
          </section>
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-muted border border-border rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black italic tracking-tighter text-accent mb-2 uppercase">Forge New Persona</h2>
            <p className="text-xs text-foreground/40 mb-8 font-bold uppercase tracking-widest leading-normal">
              Choose a display name and avatar for your new identity.
            </p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Avatar</label>
                <button
                  type="button"
                  onClick={() => createAvatarInputRef.current?.click()}
                  className="w-full bg-background border border-dashed border-border rounded-2xl p-4 flex items-center justify-center gap-3 hover:border-accent transition-all"
                >
                  {newPersonaAvatar ? (
                    <img src={newPersonaAvatar} alt="Persona avatar preview" className="w-14 h-14 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-foreground/30">
                      <ImageIcon size={22} />
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-sm font-bold">{newPersonaAvatar ? 'Change avatar' : 'Upload avatar'}</div>
                    <div className="text-[10px] uppercase tracking-widest text-foreground/30">PNG or JPG</div>
                  </div>
                </button>
                <input
                  ref={createAvatarInputRef}
                  type="file"
                  accept="image/*"
                  title="Upload persona avatar"
                  aria-label="Upload persona avatar"
                  className="hidden"
                  onChange={(e) => handleAvatarPick(e.target.files?.[0] || null)}
                />
                {uploadingAvatar && <div className="text-[10px] font-black uppercase tracking-widest text-accent">Uploading avatar...</div>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. CampusRebel"
                  className="w-full bg-background border border-border rounded-2xl py-4 px-6 focus:outline-none focus:border-accent/50 transition-all font-bold placeholder:text-foreground/10"
                  value={newPersonaName}
                  onChange={(e) => setNewPersonaName(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 bg-background text-foreground/60 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-muted/80 transition-all border border-border"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePersona}
                  disabled={uploadingAvatar || personaLimitReached}
                  className="flex-1 bg-accent text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-40 disabled:hover:scale-100"
                >
                  Create Identity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <button aria-label="Close confirmation overlay" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
          <div className="relative w-full max-w-md rounded-[2rem] border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-black uppercase tracking-tight">{confirmModal.title}</h2>
              <button type="button" aria-label="Close confirmation" title="Close confirmation" onClick={() => setConfirmModal(null)} className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed">{confirmModal.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmModal(null)} className="px-5 py-3 rounded-2xl bg-muted text-foreground font-black uppercase tracking-widest text-xs">
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className={cn(
                  'px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-xs',
                  confirmModal.confirmTone === 'danger' ? 'bg-rose-500 text-white' : 'bg-accent text-black'
                )}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
