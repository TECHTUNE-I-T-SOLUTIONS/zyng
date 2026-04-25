'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  UserCircle, 
  ShieldCheck, 
  PlusCircle, 
  Check, 
  Trash2,
  ChevronRight
} from 'lucide-react';
import { useZyngStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ZPersonas() {
  const { activePersona, setActivePersona } = useZyngStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');

  // Mocked personas for UI perfection
  const personaList = [
    { id: '1', display_name: 'GhostBoi_24', reputation_score: 4820, avatar_url: '👻' },
    { id: '2', display_name: 'Loner_In_Leco', reputation_score: 120, avatar_url: '🚶' },
  ];

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
              {personaList.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePersona(p as any)}
                  className={cn(
                    "w-full text-left p-6 rounded-2xl border transition-all flex items-center gap-5 relative group",
                    activePersona?.id === p.id 
                      ? "bg-accent/5 border-accent/20 shadow-[0_0_20px_rgba(255,184,0,0.05)]" 
                      : "bg-muted/40 border-border hover:bg-muted/60"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner",
                    activePersona?.id === p.id ? "bg-accent text-black" : "bg-muted"
                  )}>
                    {p.avatar_url}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-lg">{p.display_name}</span>
                       {activePersona?.id === p.id && <ShieldCheck size={14} className="text-accent" />}
                    </div>
                    <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1">
                      Reputation: <span className="text-accent">{p.reputation_score.toLocaleString()}</span>
                    </div>
                  </div>
                  {activePersona?.id === p.id ? (
                    <div className="bg-accent text-black p-1.5 rounded-full">
                      <Check size={16} strokeWidth={3} />
                    </div>
                  ) : (
                    <ChevronRight size={20} className="text-foreground/10 group-hover:text-foreground/40 transition-colors" />
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-muted rounded-2xl p-8 border border-border space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-accent">Identity Isolation</h3>
            <p className="text-xs text-foreground/40 leading-relaxed font-medium">
              Zyng ensures your personas are digitally isolated. Your real identity (Phone Number) is never linked to your public posts. Activity on one persona does not affect others.
            </p>
            <div className="pt-4 flex gap-4">
               <div className="bg-background px-4 py-2 rounded-xl text-[10px] font-bold text-foreground/60">
                 Campus: UNILORIN
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
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-muted border border-border rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-black italic tracking-tighter text-accent mb-2 uppercase">Forge New Persona</h2>
            <p className="text-xs text-foreground/40 mb-8 font-bold uppercase tracking-widest leading-normal">
              Who will you be on campus today? Choose a name that can&apos;t be traced to you.
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
                  className="flex-2 bg-accent text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  Create Identity
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
