'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { alumniService } from '@/lib/services/alumniService';
import { resumeService } from '@/lib/services/resumeService';
import { opportunityService } from '@/lib/services/opportunityService';
import { Briefcase, FileText, Loader2, Users, Bell, Megaphone, LayoutGrid, Sparkles, Save, Plus, Send } from 'lucide-react';

export default function AlumniProPage() {
  const queryClient = useQueryClient();
  const [resumeText, setResumeText] = useState('');
  const [opportunityForm, setOpportunityForm] = useState({ title: '', company: '', description: '', type: '', skills_required: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['alumni-me'],
    queryFn: () => alumniService.getProfileData(),
  });

  const { data: myApplications } = useQuery({
    queryKey: ['my-applications', data?.user?.id],
    queryFn: () => opportunityService.listMine(data!.user.id),
    enabled: !!data?.user?.id,
  });

  useQuery({
    queryKey: ['latest-resume', data?.user?.id],
    queryFn: () => resumeService.getLatestResume(data!.user.id),
    enabled: !!data?.user?.id,
    staleTime: 0,
  });

  const resumePayload = useMemo(() => ({
    summary: resumeText || data?.user?.bio || '',
    name: data?.user?.full_name || data?.user?.z_name || '',
    school: data?.user?.school?.name || '',
    faculty: data?.user?.faculty?.name || '',
    department: data?.user?.department?.name || '',
    skills: data?.user?.skills || [],
    hobbies: data?.user?.hobbies || [],
    referrals: data?.referrals || [],
  }), [resumeText, data]);

  const saveResume = async () => {
    if (!data?.user?.id) return;
    await resumeService.saveResume(data.user.id, resumePayload);
    queryClient.invalidateQueries({ queryKey: ['latest-resume', data.user.id] });
  };

  const createOpportunity = async () => {
    if (!data?.user?.id) return;
    await opportunityService.createOpportunity({
      posted_by: data.user.id,
      title: opportunityForm.title,
      company: opportunityForm.company,
      description: opportunityForm.description,
      type: opportunityForm.type,
      skills_required: opportunityForm.skills_required.split(',').map((s) => s.trim()).filter(Boolean),
      school_id: data.user.school_id,
    });
    queryClient.invalidateQueries({ queryKey: ['alumni-me'] });
  };

  const applyToOpportunity = async (opportunityId: string) => {
    if (!data?.user?.id) return;
    const latestResume = await resumeService.getLatestResume(data.user.id);
    await opportunityService.apply(opportunityId, data.user.id, latestResume?.id);
    queryClient.invalidateQueries({ queryKey: ['my-applications', data.user.id] });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-400" /></div>;

  return (
    <div className="space-y-8 text-white">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Pro Hub</h1>
          <p className="text-white/40 text-sm italic">Professional tools for alumni growth and opportunities.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat icon={FileText} label="Resume" value={data?.resume ? 'Saved' : 'Draft'} />
        <Stat icon={Briefcase} label="Jobs" value={`${data?.opportunities?.length || 0}`} />
        <Stat icon={Users} label="Referrals" value={`${data?.referrals?.length || 0}`} />
        <Stat icon={LayoutGrid} label="Rooms" value={`${data?.rooms?.length || 0}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-black uppercase text-xs tracking-widest"><Sparkles size={16} /> Resume Builder</div>
          <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} className="w-full min-h-56 rounded-2xl bg-black/20 border border-white/10 p-4 text-sm focus:outline-none" placeholder="Write your resume summary or paste structured JSON notes here..." />
          <div className="mt-4 flex gap-3">
            <button onClick={saveResume} className="bg-indigo-600 text-white px-4 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2"><Save size={14} /> Save Resume</button>
          </div>
        </section>

        <section className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-black uppercase text-xs tracking-widest"><Megaphone size={16} /> Create Opportunity</div>
          <div className="space-y-3">
            <input value={opportunityForm.title} onChange={(e) => setOpportunityForm({ ...opportunityForm, title: e.target.value })} className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-sm" placeholder="Title" />
            <input value={opportunityForm.company} onChange={(e) => setOpportunityForm({ ...opportunityForm, company: e.target.value })} className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-sm" placeholder="Company" />
            <input value={opportunityForm.type} onChange={(e) => setOpportunityForm({ ...opportunityForm, type: e.target.value })} className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-sm" placeholder="Type" />
            <textarea value={opportunityForm.description} onChange={(e) => setOpportunityForm({ ...opportunityForm, description: e.target.value })} className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-sm min-h-32" placeholder="Description" />
            <input value={opportunityForm.skills_required} onChange={(e) => setOpportunityForm({ ...opportunityForm, skills_required: e.target.value })} className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-sm" placeholder="Skills required, comma separated" />
            <button onClick={createOpportunity} className="bg-white text-black px-4 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2"><Plus size={14} /> Publish Opportunity</button>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-black uppercase text-xs tracking-widest"><Briefcase size={16} /> Opportunities</div>
          <div className="space-y-3">
            {data?.opportunities?.length ? data.opportunities.map((opp: any) => (
              <div key={opp.id} className="bg-black/20 border border-white/5 rounded-2xl p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-black">{opp.title}</div>
                  <div className="text-white/40 text-sm">{opp.company || 'Alumni Network'} • {opp.type || 'Role'}</div>
                </div>
                <button onClick={() => applyToOpportunity(opp.id)} className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Send size={12} /> Apply</button>
              </div>
            )) : <div className="text-white/30 italic">No opportunities yet.</div>}
          </div>
        </section>

        <section className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-black uppercase text-xs tracking-widest"><Bell size={16} /> Applications</div>
          <div className="space-y-3">
            {myApplications?.length ? myApplications.map((app: any) => (
              <div key={app.id} className="bg-black/20 border border-white/5 rounded-2xl p-4">
                <div className="font-black">{app.opportunity?.title || 'Opportunity'}</div>
                <div className="text-white/40 text-sm uppercase tracking-widest">{app.status}</div>
              </div>
            )) : <div className="text-white/30 italic">No applications yet.</div>}
          </div>
        </section>
      </div>

      <section className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
        <div className="flex items-center gap-2 mb-4 text-indigo-400 font-black uppercase text-xs tracking-widest"><Sparkles size={16} /> Profile Snapshot</div>
        <div className="space-y-2 text-white/80">
          <div><span className="text-white/40">Name:</span> {data?.user?.full_name || data?.user?.z_name || 'Alumni Member'}</div>
          <div><span className="text-white/40">School:</span> {data?.user?.school?.name || 'Not selected'}</div>
          <div><span className="text-white/40">Faculty:</span> {data?.user?.faculty?.name || 'Not selected'}</div>
          <div><span className="text-white/40">Department:</span> {data?.user?.department?.name || 'Not selected'}</div>
          <div><span className="text-white/40">Trust:</span> {data?.user?.trust_score ?? 0}</div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
      <div className="text-indigo-400 mb-4"><Icon size={28} /></div>
      <h3 className="text-xl font-black mb-1">{label}</h3>
      <p className="text-white/40 text-sm">{value}</p>
    </div>
  );
}
