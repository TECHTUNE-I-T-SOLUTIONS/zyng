'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, List, ArrowRight, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/toast';
import { userService } from '@/lib/services/userService';
import { opportunityService } from '@/lib/services/opportunityService';
import { useSearchParams } from 'next/navigation';

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [deadline, setDeadline] = useState<string>('');
  // controlled inputs
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [compensation, setCompensation] = useState('');
  const [typeValue, setTypeValue] = useState('Internship');
  const [externalUrl, setExternalUrl] = useState('');
  const [acceptsApplications, setAcceptsApplications] = useState(true);
  const [applicationInstructions, setApplicationInstructions] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<{
    id: string;
    name: string;
    preview?: string;
    blob: Blob | null;
    status: 'idle' | 'uploading' | 'done' | 'error';
    url?: string;
    mime?: string;
  }[]>([]);

  const { show } = useToast();
  const { data: user, isLoading: userLoading } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');

  // prefill when editing
  useEffect(() => {
    if (!editId) return;
    let mounted = true;
    (async () => {
      try {
        const opp = await opportunityService.getOpportunity(editId);
        if (!mounted || !opp) return;
        setTitle(opp.title || '');
        setCompany(opp.company || '');
        setDescription(opp.description || '');
        setLocation(opp.location || '');
        setCompensation(opp.compensation || '');
        setTypeValue(opp.type || 'Internship');
        setExternalUrl(opp.external_url || '');
        setAcceptsApplications(!!opp.accepts_applications);
        setApplicationInstructions(opp.application_instructions || '');
        setDeadline(opp.apply_deadline ? new Date(opp.apply_deadline).toISOString().slice(0,16) : '');
        setSkills(Array.isArray(opp.skills_required) ? opp.skills_required : (opp.skills_required ? opp.skills_required.split(',').map((s: string) => s.trim()) : []));
        // convert existing attachment urls into selectedAttachments entries
        if (Array.isArray(opp.attachments) && opp.attachments.length) {
          const mapped = opp.attachments.map((u: string, idx: number) => ({ id: `existing-${idx}-${u}`, name: u.split('/').pop() || `file-${idx}`, preview: u, blob: null, status: 'done' as const, url: u, mime: '' }));
          setSelectedAttachments(mapped);
        }
      } catch (err) {
        console.error('Prefill opportunity failed', err);
      }
    })();
    return () => { mounted = false; };
  }, [editId]);

  const handleAddSkill = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setSkills((s) => (s.includes(v) ? s : [...s, v]));
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // If user types comma-separated values, split on comma and add them
    if (v.includes(',')) {
      const parts = v.split(',').map(p => p.trim()).filter(Boolean);
      for (const p of parts) handleAddSkill(p);
      // keep the last partial segment (after last comma) as input
      const last = v.split(',').pop() || '';
      setSkillInput(last.trim());
    } else {
      setSkillInput(v);
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // prevent Enter from submitting the form while typing skills
    if (e.key === 'Enter') {
      e.preventDefault();
      if (skillInput.trim()) {
        handleAddSkill(skillInput.trim());
        setSkillInput('');
      }
    }
  };

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

    const maxDim = 1600;
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

    const targetBytes = 2 * 1024 * 1024; // 2MB target
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

  const handleFilePick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    if (files.length === 0) return;

    const incoming: typeof selectedAttachments = [];
    for (const file of files) {
      try {
        if (file.size > 2 * 1024 * 1024) {
          show(`File ${file.name} exceeds 2MB limit.`, 'error');
          continue;
        }

        if (file.type.startsWith('image/')) {
          const { blob, preview } = await compressImage(file);
          incoming.push({ id: String(Date.now()) + Math.random().toString(36).slice(2), name: file.name, preview, blob, status: 'idle', mime: file.type });
        } else {
          // read as blob and generate a simple data URL preview for non-images
          const dataUrl = await dataUrlFromBlob(file);
          incoming.push({ id: String(Date.now()) + Math.random().toString(36).slice(2), name: file.name, preview: undefined, blob: file, status: 'idle', mime: file.type });
        }
      } catch (err) {
        console.error('File processing failed', err);
        show('Failed to process file. Try a different file.', 'error');
      }
    }

    setSelectedAttachments((s) => {
      const combined = [...s, ...incoming];
      // allow up to 5 attachments
      if (combined.length > 5) return combined.slice(0, 5);
      return combined;
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadAttachment = async (att: typeof selectedAttachments[number]) => {
    setSelectedAttachments((s) => s.map((x) => (x.id === att.id ? { ...x, status: 'uploading' } : x)));
    try {
      const dataUrl = att.preview ? await dataUrlFromBlob(att.blob as Blob) : await dataUrlFromBlob(att.blob as Blob);
      const resourceType = (att.mime || '').startsWith('image/') ? 'image' : 'raw';
      const res = await fetch('/api/uploads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: att.name, dataUrl, resourceType }) });
      const json = await res.json();
      if (res.ok && json.url) {
        setSelectedAttachments((s) => s.map((x) => (x.id === att.id ? { ...x, status: 'done', url: json.url } : x)));
        return json.url as string;
      }
      setSelectedAttachments((s) => s.map((x) => (x.id === att.id ? { ...x, status: 'error' } : x)));
      throw new Error(json?.error || 'Upload failed');
    } catch (err) {
      console.error('Attachment upload failed', err);
      setSelectedAttachments((s) => s.map((x) => (x.id === att.id ? { ...x, status: 'error' } : x)));
      throw err;
    }
  };

  const handleRemoveAttachment = (id: string) => setSelectedAttachments((s) => s.filter((x) => x.id !== id));

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 pb-24 hide-scrollbar">
      <div className="max-w-3xl mx-auto space-y-10">
        <header>
          <button onClick={() => router.back()} className="text-foreground/40 hover:text-foreground text-xs font-black uppercase tracking-widest mb-6">← Cancel</button>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Post an Opportunity</h1>
          <p className="text-foreground/40 font-medium italic">Gigs, internships, or full-time roles for the campus network.</p>
        </header>

          <form className="space-y-8" onSubmit={async (ev) => {
            ev.preventDefault();
            // assemble payload and upload attachments
            try {
              const uploaded: string[] = [];
              if (selectedAttachments.length > 0) {
                for (const att of selectedAttachments) {
                  if (att.url) uploaded.push(att.url);
                  else {
                    const url = await uploadAttachment(att);
                    uploaded.push(url);
                  }
                }
              }

                // finalize skills: include any remaining text in skillInput (split by comma)
                const finalSkills = [...skills];
                if (skillInput && skillInput.trim()) {
                  const parts = skillInput.split(',').map(s => s.trim()).filter(Boolean);
                  for (const p of parts) {
                    if (!finalSkills.includes(p)) finalSkills.push(p);
                  }
                }

                // create or update opportunity (controlled inputs)
                const payload = {
                  posted_by: user?.id || null,
                  school_id: (user as any)?.school_id || null,
                  title: title || null,
                  company: company || null,
                  description: description || null,
                  type: typeValue || null,
                  skills_required: finalSkills.length ? finalSkills : null,
                  location: location || null,
                  compensation: compensation || null,
                  apply_deadline: deadline ? new Date(deadline).toISOString() : null,
                  attachments: uploaded.length ? uploaded : null,
                  external_url: externalUrl || null,
                  accepts_applications: !!acceptsApplications,
                  application_instructions: applicationInstructions || null,
                };

                if (editId) {
                  await opportunityService.updateOpportunity(editId, payload);
                } else {
                  await opportunityService.createOpportunity(payload);
                }

              router.push('/z-jobs');
            } catch (err) {
              console.error('Create opportunity failed', err);
              show('Failed to publish opportunity. Please try again.', 'error');
            }
          }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. Frontend Developer" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:border-accent outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Company / Group</label>
              <input 
                type="text" 
                placeholder="TechCorp / Private" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-muted border border-border rounded-2xl py-4 px-6 text-sm font-bold focus:border-accent outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Description</label>
            <textarea 
              placeholder="What are the responsibilities?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-muted border border-border rounded-[2rem] p-6 text-sm font-medium min-h-[150px] focus:border-accent outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
                <input type="text" placeholder="Remote / On-site" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Compensation</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
                <input type="text" placeholder="₦50k / Month" value={compensation} onChange={(e) => setCompensation(e.target.value)} className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Apply By</label>
              <div className="relative">
                <input title="Deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-muted border border-border rounded-2xl py-4 px-4 text-sm font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Type</label>
              <select title="Type" value={typeValue} onChange={(e) => setTypeValue(e.target.value)} className="w-full bg-muted border border-border rounded-2xl py-4 px-6 text-sm font-bold outline-none">
                <option>Internship</option>
                <option>Part-time</option>
                <option>Full-time</option>
                <option>Freelance / Gig</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input id="accepts_apps" type="checkbox" checked={acceptsApplications} onChange={(e) => setAcceptsApplications(e.target.checked)} />
              <label htmlFor="accepts_apps" className="text-sm">Accept on-platform applications</label>
            </div>

            {acceptsApplications ? (
              <>
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Application Instructions (optional)</label>
                <textarea placeholder="Instructions to applicants" value={applicationInstructions} onChange={(e) => setApplicationInstructions(e.target.value)} className="w-full bg-muted border border-border rounded-[1rem] p-3 text-sm" />
              </>
            ) : (
              <>
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">External Apply Link (optional)</label>
                <input type="text" placeholder="https://apply.example.com" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} className="w-full bg-muted border border-border rounded-2xl py-4 px-6 text-sm font-bold" />
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Required Skills (Press Enter)</label>
            <div className="p-2 bg-muted border border-border rounded-2xl flex flex-wrap gap-2 items-center min-h-[56px]">
              {skills.map(skill => (
                <span key={skill} className="bg-background px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-border">
                  {skill}
                  <X size={12} className="cursor-pointer text-foreground/30" onClick={() => setSkills(skills.filter(s => s !== skill))} />
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={handleSkillInputChange}
                onKeyDown={handleSkillKeyDown}
                placeholder="e.g. React, TypeScript" 
                className="bg-transparent text-sm font-bold px-2 outline-none flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Attachments (optional)</label>
            <div className="flex items-center gap-3">
              <input title="Attachments" ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} multiple />
              <button type="button" onClick={handleFilePick} className="px-4 py-2 bg-muted rounded-xl text-xs font-bold hover:bg-muted/80 transition-all">Add Files</button>
              <div className="text-sm text-foreground/40">{selectedAttachments.length} file(s)</div>
            </div>

            {selectedAttachments.length > 0 && (
              <div className="mt-2 grid grid-cols-1 gap-2">
                {selectedAttachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between gap-3 p-2 bg-muted border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      {att.preview ? (
                        <img src={att.preview} alt={att.name} className="w-16 h-12 rounded-md object-cover" />
                      ) : (
                        <div className="w-16 h-12 rounded-md bg-background/20 flex items-center justify-center text-xs text-foreground/60">{att.name.split('.').pop()?.toUpperCase() || 'FILE'}</div>
                      )}
                      <div className="truncate text-sm">
                        <div className="font-bold">{att.name}</div>
                        <div className="text-[11px] text-foreground/40">{att.mime || 'file'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {att.status === 'uploading' && <div className="text-[11px] text-foreground/40">Uploading…</div>}
                      {att.status === 'error' && <div className="text-[11px] text-red-500">Error</div>}
                      <button type="button" onClick={() => handleRemoveAttachment(att.id)} className="text-foreground/40">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full bg-accent text-black py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Broadcast Opportunity <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
