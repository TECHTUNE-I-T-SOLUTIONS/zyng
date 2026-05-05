'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, PlusCircle, ShieldCheck, Check, ChevronRight, Trash2, UserCircle } from 'lucide-react';
import { userService } from '@/lib/services/userService';
import { createPersona, getPersonas } from '@/lib/services/persona';
import { cn } from '@/lib/utils';

export default function ZPersonas() {
  const [isCreating, setIsCreating] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const { data: apiPersonas, isLoading, refetch } = useQuery({
    queryKey: ['personas', user?.id],
    queryFn: () => (user?.id ? getPersonas(user.id).then((res) => res.data || []) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  // prefer server API personas but fallback to `user.personas` included on the user object
  const personas = (apiPersonas && apiPersonas.length > 0) ? apiPersonas : (user?.personas || []);
  const activePersona = personas?.find((persona: any) => persona.is_active);

  const handleCreatePersona = async () => {
    if (!user?.id || !newPersonaName.trim()) return;
    const { error } = await createPersona(user.id, newPersonaName.trim());
    if (!error) {
      setNewPersonaName('');
      setIsCreating(false);
      await refetch();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-sm font-black uppercase tracking-widest text-accent">Persona Manager</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 text-xs font-bold text-foreground/60 hover:text-accent transition-colors"
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
                      'w-full text-left p-6 rounded-2xl border flex items-center gap-5 relative group',
                      persona.id === activePersona?.id
                        ? 'bg-accent/5 border-accent/20 shadow-[0_0_20px_rgba(255,184,0,0.05)]'
                        : 'bg-muted/40 border-border'
                    )}
                  >
                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner', persona.id === activePersona?.id ? 'bg-accent text-black' : 'bg-muted')}>
                      <UserCircle size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{persona.name}</span>
                        {persona.id === activePersona?.id && <ShieldCheck size={14} className="text-accent" />}
                      </div>
                      <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1">
                        Reputation: <span className="text-accent">{persona.reputation || 0}</span>
                      </div>
                    </div>
                    {persona.id === activePersona?.id ? (
                      <div className="bg-accent text-black p-1.5 rounded-full">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    ) : (
                      <ChevronRight size={20} className="text-foreground/10 group-hover:text-foreground/40 transition-colors" />
                    )}
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
            <div className="pt-4 flex gap-4 flex-wrap">
              <div className="bg-background px-4 py-2 rounded-xl text-[10px] font-bold text-foreground/60">
                Campus: {user?.school?.name || 'Not selected'}
              </div>
              <div className="bg-background px-4 py-2 rounded-xl text-[10px] font-bold text-rose-500/60 flex items-center gap-2">
                <Trash2 size={12} /> Clear all Data
              </div>
            </div>
          </section>
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-muted border border-border rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black italic tracking-tighter text-accent mb-2 uppercase">Forge New Persona</h2>
            <p className="text-xs text-foreground/40 mb-8 font-bold uppercase tracking-widest leading-normal">
              Choose a display name for your new identity.
            </p>

            <div className="space-y-6">
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
                  className="flex-1 bg-accent text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  Create Identity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
