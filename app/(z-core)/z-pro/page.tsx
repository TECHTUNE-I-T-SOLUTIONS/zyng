'use client';

import { useQuery } from '@tanstack/react-query';
import { alumniService } from '@/lib/services/alumniService';
import { Briefcase, FileText, Plus, Settings, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfessionalHub() {
  const { data, isLoading } = useQuery({
    queryKey: ['pro-hub'],
    queryFn: () => alumniService.getProfileData(),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-2 flex items-center gap-4 italic uppercase">
              Pro Hub
              <Sparkles className="text-accent" size={32} />
            </h1>
            <p className="text-foreground/40 font-medium italic">Your professional workspace on Zyng.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/z-pro/create-job" className="bg-muted border border-border px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-black transition-all flex items-center gap-2">
              <Plus size={18} /> Post Gig
            </Link>
            <Link href="/z-pro/portfolio" className="bg-accent text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-accent/20">
              Build Resume
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-muted border border-border p-8 rounded-[3rem]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40">Your Skills</h2>
                <button className="p-2 hover:bg-background rounded-xl transition-all"><Settings size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data?.user?.skills?.length ? data.user.skills.map((skill: string) => (
                  <span key={skill} className="px-4 py-2 bg-background border border-border rounded-xl text-xs font-bold hover:border-accent hover:text-accent transition-all cursor-default">
                    {skill}
                  </span>
                )) : (
                  <p className="text-foreground/20 italic text-sm">Add skills to get matched with jobs.</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40 mb-6 px-4">Zyng Matches</h2>
              <div className="space-y-4">
                {(data?.opportunities || []).slice(0, 2).map((opportunity: any) => (
                  <div key={opportunity.id} className="bg-muted border border-border p-6 rounded-[2.5rem] flex items-center justify-between hover:border-accent/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-background border border-border rounded-2xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                        <Briefcase size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">{opportunity.title}</h3>
                        <div className="text-[10px] font-black text-accent uppercase tracking-widest">{opportunity.company || 'Open Opportunity'}</div>
                      </div>
                    </div>
                    <ChevronRight className="text-foreground/20 group-hover:text-accent group-hover:translate-x-2 transition-all" />
                  </div>
                ))}
                {!data?.opportunities?.length && (
                  <div className="bg-muted border border-border p-6 rounded-[2.5rem] text-sm text-foreground/40">
                    No opportunities found yet. Add one from the Pro Hub or alumni dashboard.
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-gradient-to-br from-muted to-muted/20 border border-border p-8 rounded-[3rem] text-center">
              <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center mx-auto mb-6 text-black shadow-xl shadow-accent/20">
                <FileText size={40} />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">AI Resume</h3>
              <p className="text-xs text-foreground/40 font-medium mb-8 italic">Export your campus activity and skills into a professional PDF resume instantly.</p>
              <button className="w-full bg-foreground text-background py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-accent hover:text-black transition-all">
                Generate PDF
              </button>
            </div>

            <div className="bg-muted border border-border p-8 rounded-[3rem]">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-6">OPPORTUNITY STATS</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground/60">Saved Resume</span>
                  <span className="text-sm font-black">{data?.resume ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground/60">Referrals</span>
                  <span className="text-sm font-black text-accent">{data?.referrals?.length || 0}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
