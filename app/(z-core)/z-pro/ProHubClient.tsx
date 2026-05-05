"use client";

import React, { useState } from 'react';
import { Briefcase, FileText, Plus, Settings, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { alumniService } from '@/lib/services/alumniService';

export default function ProHubClient() {
  const [tab, setTab] = useState<'overview'|'manage'>('overview');
  const { data, isLoading } = useQuery({ queryKey: ['pro-hub'], queryFn: () => alumniService.getProfileData() });

  const showManage = () => {
    setTab('manage');
    const el = document.getElementById('manage-section');
    if (el) el.style.display = 'block';
  };
  const showOverview = () => {
    setTab('overview');
    const el = document.getElementById('manage-section');
    if (el) el.style.display = 'none';
  };

  if (isLoading) return <div className="flex justify-center py-20">Loading…</div>;

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 flex items-center gap-3 italic uppercase">
            Pro Hub
            <Sparkles className="text-accent" size={28} />
          </h1>
          <p className="text-foreground/40 font-medium italic">Your professional workspace on Zyng.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={showOverview} className={`px-4 py-2 rounded-2xl font-bold ${tab==='overview'?'bg-accent text-black':'bg-muted text-foreground'}`}>Overview</button>
          <button onClick={showManage} className={`px-4 py-2 rounded-2xl font-bold ${tab==='manage'?'bg-accent text-black':'bg-muted text-foreground'}`}>Manage</button>
          <Link href="/z-pro/create-job" className="bg-muted border border-border px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-black transition-all flex items-center gap-2">
            <Plus size={16} /> Post
          </Link>
        </div>
      </header>

      <div id="overview-section" style={{ display: tab==='overview' ? 'block' : 'none' }} className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-muted border border-border p-6 rounded-[2rem]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40">Your Skills</h2>
                <button className="p-2 hover:bg-background rounded-xl transition-all"><Settings size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data?.user?.skills?.length ? data.user.skills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1 bg-background border border-border rounded-xl text-xs font-bold hover:border-accent hover:text-accent transition-all">
                    {skill}
                  </span>
                )) : (
                  <p className="text-foreground/20 italic text-sm">Add skills to get matched with jobs.</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40 mb-4 px-2">Zyng Matches</h2>
              <div className="space-y-4">
                {(data?.opportunities || []).slice(0, 3).map((opportunity: any) => (
                  <Link key={opportunity.id} href={`/z-jobs/${opportunity.id}`} className="block">
                    <div className="bg-muted border border-border p-4 rounded-lg flex items-center justify-between hover:border-accent/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                          <Briefcase size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold mb-1">{opportunity.title}</h3>
                          <div className="text-[11px] font-black text-accent uppercase tracking-widest">{opportunity.company || 'Open Opportunity'}</div>
                        </div>
                      </div>
                      <ChevronRight className="text-foreground/20 group-hover:text-accent group-hover:translate-x-2 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-gradient-to-br from-muted to-muted/20 border border-border p-6 rounded-[2rem] text-center">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 text-black shadow-md shadow-accent/20">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-black mb-1 tracking-tight">AI Resume</h3>
              <p className="text-xs text-foreground/40 font-medium mb-4 italic">Export activity & skills to a PDF resume.</p>
              <button className="w-full bg-foreground text-background py-2 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-accent hover:text-black transition-all">
                Generate PDF
              </button>
            </div>

            <div className="bg-muted border border-border p-4 rounded-[2rem]">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-3">OPPORTUNITY STATS</h4>
              <div className="space-y-3">
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
    </>
  );
}
