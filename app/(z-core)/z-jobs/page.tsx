'use client';

import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { campusService } from '@/lib/services/campusService';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, Building, Clock, ChevronRight, Loader2, MoreVertical, Pencil, Trash2, X, Share2 } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { userService } from '@/lib/services/userService';
import { opportunityService } from '@/lib/services/opportunityService';
import { useState } from 'react';

export default function JobsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [jobDraft, setJobDraft] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => campusService.getOpportunities(),
  });

  const openEditModal = (job: any) => {
    setEditingJob(job);
    setJobDraft({
      title: job.title || '',
      company: job.company || '',
      description: job.description || '',
      type: job.type || 'Internship',
      location: job.location || '',
      compensation: job.compensation || '',
      apply_deadline: job.apply_deadline ? new Date(job.apply_deadline).toISOString().slice(0, 16) : '',
      skills_required: Array.isArray(job.skills_required) ? job.skills_required.join(', ') : '',
      external_url: job.external_url || '',
      application_instructions: job.application_instructions || '',
    });
    setOpenMenuId(null);
  };

  const saveJob = async () => {
    if (!editingJob) return;
    setSaving(true);
    try {
      await opportunityService.updateOpportunity(editingJob.id, {
        title: jobDraft.title || null,
        company: jobDraft.company || null,
        description: jobDraft.description || null,
        type: jobDraft.type || null,
        location: jobDraft.location || null,
        compensation: jobDraft.compensation || null,
        apply_deadline: jobDraft.apply_deadline ? new Date(jobDraft.apply_deadline).toISOString() : null,
        skills_required: jobDraft.skills_required ? jobDraft.skills_required.split(',').map((skill: string) => skill.trim()).filter(Boolean) : null,
        external_url: jobDraft.external_url || null,
        application_instructions: jobDraft.application_instructions || null,
      });
      setEditingJob(null);
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    } finally {
      setSaving(false);
    }
  };

  const shareJob = async (job: any) => {
    const url = `${window.location.origin}/z-jobs/${slugify(job.title)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, text: job.description || 'Check out this opportunity on Zyng.', url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter mb-2">OPPORTUNITIES</h1>
          <p className="text-foreground/40 font-medium italic">Gigs, internships, and jobs for students.</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-[3rem]">
            <p className="text-foreground/40 font-bold italic">No active opportunities. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 6 }}
                onClick={() => router.push(`/z-jobs/${slugify(job.title)}`)}
                className="bg-muted border border-border p-6 rounded-[2rem] flex items-center gap-6 group cursor-pointer hover:border-accent/30 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Briefcase size={28} />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-foreground/40 uppercase tracking-tight">
                    <div className="flex items-center gap-1"><Building size={14} /> {job.company || 'Private Poster'}</div>
                    <div className="flex items-center gap-1"><MapPin size={14} /> {job.type}</div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {job.apply_deadline ? `Deadline: ${new Date(job.apply_deadline).toLocaleDateString()}` : 'No deadline'}
                    </div>
                  </div>
                  {Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills_required.map((s: string) => (
                        <div key={s} className="px-3 py-1 rounded-full bg-background/60 text-[12px] font-bold border border-border">{s}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="relative mb-2">
                    <button aria-label="Opportunity actions" onClick={(e) => { e.stopPropagation(); setOpenMenuId((current) => current === job.id ? null : job.id); }} className="rounded-xl border border-border bg-background p-3 text-foreground/50 hover:text-foreground">
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === job.id && (
                      <div className="absolute right-0 top-12 z-20 w-36 rounded-xl border border-border bg-background p-2 text-left shadow-xl">
                        <button onClick={(e) => { e.stopPropagation(); shareJob(job); setOpenMenuId(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                          <Share2 size={14} /> Share
                        </button>
                        {job.posted_by === user?.id && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(job); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                              <Pencil size={14} /> Edit
                            </button>
                            <button onClick={async (e) => {
                              e.stopPropagation();
                              if (!confirm('Delete this opportunity?')) return;
                              await opportunityService.deleteOpportunity(job.id);
                              queryClient.invalidateQueries({ queryKey: ['opportunities'] });
                              setOpenMenuId(null);
                            }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10">
                              <Trash2 size={14} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <button aria-label={`Open ${job.title}`} title={`Open ${job.title}`} onClick={(e) => { e.stopPropagation(); router.push(`/z-jobs/${slugify(job.title)}`); }} className="p-3 bg-background border border-border rounded-xl group-hover:bg-accent group-hover:text-black transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingJob(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-border bg-background p-6 shadow-2xl md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Edit Opportunity</h2>
              <button title="Close modal" aria-label="Close modal" onClick={() => setEditingJob(null)} className="rounded-xl bg-muted p-2"><X size={20} /></button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <JobField label="Title" value={jobDraft.title} onChange={(value) => setJobDraft((current: any) => ({ ...current, title: value }))} />
              <JobField label="Company" value={jobDraft.company} onChange={(value) => setJobDraft((current: any) => ({ ...current, company: value }))} />
              <JobField label="Type" value={jobDraft.type} onChange={(value) => setJobDraft((current: any) => ({ ...current, type: value }))} />
              <JobField label="Location" value={jobDraft.location} onChange={(value) => setJobDraft((current: any) => ({ ...current, location: value }))} />
              <JobField label="Compensation" value={jobDraft.compensation} onChange={(value) => setJobDraft((current: any) => ({ ...current, compensation: value }))} />
              <JobField label="Deadline" type="datetime-local" value={jobDraft.apply_deadline} onChange={(value) => setJobDraft((current: any) => ({ ...current, apply_deadline: value }))} />
              <div className="md:col-span-2"><JobField label="Skills required" value={jobDraft.skills_required} onChange={(value) => setJobDraft((current: any) => ({ ...current, skills_required: value }))} /></div>
              <div className="md:col-span-2"><JobField label="External URL" value={jobDraft.external_url} onChange={(value) => setJobDraft((current: any) => ({ ...current, external_url: value }))} /></div>
              <label className="md:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Description</span>
                <textarea value={jobDraft.description} onChange={(e) => setJobDraft((current: any) => ({ ...current, description: e.target.value }))} className="mt-1 h-32 w-full rounded-2xl border border-border bg-muted p-3 outline-none focus:border-accent" />
              </label>
              <label className="md:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Application instructions</span>
                <textarea value={jobDraft.application_instructions} onChange={(e) => setJobDraft((current: any) => ({ ...current, application_instructions: e.target.value }))} className="mt-1 h-24 w-full rounded-2xl border border-border bg-muted p-3 outline-none focus:border-accent" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingJob(null)} className="rounded-xl bg-muted px-5 py-3 font-bold">Cancel</button>
              <button onClick={saveJob} disabled={saving} className="rounded-xl bg-accent px-6 py-3 font-black text-black disabled:opacity-60">{saving ? 'Saving...' : 'Save Opportunity'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JobField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label>
      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{label}</span>
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-2xl border border-border bg-muted p-3 outline-none focus:border-accent" />
    </label>
  );
}
