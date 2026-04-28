'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { userService } from '@/lib/services/userService';
import { portfolioService } from '@/lib/services/portfolioService';
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Save,
  Briefcase,
  BookOpen,
  Eye,
  Loader2,
  UploadCloud
} from 'lucide-react';

export default function AlumniPortfolioPage() {
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<any>({
    id: null,
    title: '',
    summary: '',
    experience: [{ company: '', role: '', duration: '' }],
    education: [{ school: '', degree: '', year: '' }],
    skills: [] as string[],
    attachments: [] as any[],
  });
  const fileRef = useRef<HTMLInputElement | null>(null);

  const { data: user, isLoading: userLoading } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const p = await portfolioService.getByUser(user.id);
        if (p) setPortfolio(p);
      } catch (err) {
        // ignore
      }
    })();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return alert('Please sign in');
    setLoading(true);
    try {
      const payload = {
        id: portfolio.id,
        user_id: user.id,
        title: portfolio.title,
        summary: portfolio.summary,
        skills: portfolio.skills,
        entries: { experience: portfolio.experience, education: portfolio.education },
        attachments: portfolio.attachments || [],
      };

      const res = portfolio.id
        ? await portfolioService.update(portfolio.id, payload)
        : await portfolioService.create(payload);

      setPortfolio(res);
      alert('Portfolio saved');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setPortfolio((p: any) => ({ ...p, skills: [...(p.skills || []), v] }));
  };

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch('/api/uploads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, dataUrl, resourceType: 'raw' }) });
        const json = await res.json();
        if (res.ok && json.url) {
          setPortfolio((p: any) => ({ ...p, attachments: [...(p.attachments || []), { url: json.url, filename: file.name, mime: file.type, size: file.size }] }));
        } else {
          alert('Upload failed');
        }
      } catch (err) {
        console.error(err);
        alert('Upload failed');
      }
    };
    reader.readAsDataURL(file);
  };

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
  };

  const exportAsDoc = () => {
    const html = renderExportHTML(portfolio, user);
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Zyng_Portfolio_${user?.full_name || 'portfolio'}.doc`;
    a.click();
  };

  const exportAsPDF = () => {
    const html = renderExportHTML(portfolio, user);
    const w = window.open('', '_blank');
    if (!w) return alert('Unable to open preview');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  if (userLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4 pt-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-accent">PROFESSIONAL PORTFOLIO</h1>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs mt-1">Showcase your work, skills and certifications</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={exportAsPDF} className="px-3 py-2 sm:px-4 sm:py-2 bg-muted border border-border rounded-2xl flex items-center gap-2 text-xs sm:text-sm"><FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Export PDF</button>
          <button onClick={exportAsDoc} className="px-3 py-2 sm:px-4 sm:py-2 bg-muted border border-border rounded-2xl flex items-center gap-2 text-xs sm:text-sm"><Download className="w-4 h-4 sm:w-5 sm:h-5" /> Export DOC</button>
          <button onClick={() => fileRef.current?.click()} className="px-3 py-2 sm:px-4 sm:py-2 bg-accent text-black rounded-2xl flex items-center gap-2 text-xs sm:text-sm"><UploadCloud className="w-4 h-4 sm:w-5 sm:h-5" /> Attach File</button>
          <input title="Attach File" ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={onFilePicked} />
          <button onClick={handleSave} disabled={loading} className="bg-accent text-black px-5 py-2 sm:px-6 sm:py-3 rounded-2xl font-black uppercase tracking-widest text-xs">{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div className="bg-muted border border-border rounded-[2.5rem] p-6">
            <div className="grid grid-cols-1 gap-4">
              <input className="bg-background border border-border rounded-xl p-3" placeholder="Portfolio Title" value={portfolio.title || ''} onChange={(e) => setPortfolio((p:any)=>({...p, title: e.target.value}))} />
              <textarea className="bg-background border border-border rounded-xl p-3 min-h-[120px]" placeholder="Short summary" value={portfolio.summary || ''} onChange={(e) => setPortfolio((p:any)=>({...p, summary: e.target.value}))} />
            </div>
          </motion.div>

          <motion.div className="bg-muted border border-border rounded-[2.5rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black uppercase text-xs">Skills</h3>
              <div className="flex items-center gap-2">
                <SkillInput onAdd={handleAddSkill} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(portfolio.skills || []).map((s:string,i:number)=> (
                <div key={i} className="px-3 py-1 bg-accent/10 border border-accent rounded-full text-sm font-bold">{s}</div>
              ))}
            </div>
          </motion.div>

          <motion.div className="bg-muted border border-border rounded-[2.5rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black uppercase text-xs">Experience</h3>
              <button onClick={() => setPortfolio((p:any)=>({...p, experience: [...(p.experience||[]), { company: '', role: '', duration: '' }]}))} className="px-3 py-1 bg-indigo-500/10 rounded-xl text-indigo-400 font-black text-sm">Add</button>
            </div>
            <div className="space-y-4">
              {(portfolio.experience||[]).map((exp:any,i:number)=> (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input value={exp.company} onChange={(e)=>{ const arr = [...portfolio.experience]; arr[i].company = e.target.value; setPortfolio((p:any)=>({...p, experience: arr})); }} placeholder="Company" className="bg-background border border-border rounded-xl p-3" />
                  <input value={exp.role} onChange={(e)=>{ const arr = [...portfolio.experience]; arr[i].role = e.target.value; setPortfolio((p:any)=>({...p, experience: arr})); }} placeholder="Role" className="bg-background border border-border rounded-xl p-3" />
                  <input value={exp.duration} onChange={(e)=>{ const arr = [...portfolio.experience]; arr[i].duration = e.target.value; setPortfolio((p:any)=>({...p, experience: arr})); }} placeholder="Duration" className="bg-background border border-border rounded-xl p-3" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <aside className="space-y-6">
          <div className="bg-muted border border-border rounded-[2.5rem] p-6">
            <h4 className="font-black uppercase text-xs mb-3">Attachments</h4>
            <div className="space-y-2">
              {(portfolio.attachments||[]).map((a:any,i:number)=> (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="truncate text-sm">{a.filename || a.url}</div>
                  <div className="flex items-center gap-2">
                    <a href={a.url} target="_blank" rel="noreferrer" className="text-accent">Open</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted border border-border rounded-[2.5rem] p-6 text-center">
            <FileText className="mx-auto text-accent mb-3" size={36} />
            <h5 className="font-black">Live Preview</h5>
            <p className="text-foreground/40 text-xs mt-2">Preview how your portfolio will look to others.</p>
            <button onClick={() => { const html = renderExportHTML(portfolio, user); const w = window.open('', '_blank'); if (w) { w.document.write(html); w.document.close(); } }} className="mt-4 px-4 py-2 bg-accent text-black rounded-2xl font-black">Open Preview</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SkillInput({ onAdd }: { onAdd: (v: string) => void }) {
  const [val, setVal] = useState('');
  return (
    <div className="flex items-center gap-2">
      <input value={val} onChange={(e)=>setVal(e.target.value)} onKeyDown={(e)=>{ if (e.key === 'Enter') { e.preventDefault(); onAdd(val); setVal(''); } }} placeholder="Add skill" className="bg-background border border-border rounded-xl p-2 text-sm" />
      <button onClick={()=>{ onAdd(val); setVal(''); }} className="px-3 py-1 bg-accent text-black rounded-xl">Add</button>
    </div>
  );
}

function renderExportHTML(portfolio: any, user: any) {
  const skills = (portfolio.skills || []).map((s:string) => `<li>${s}</li>`).join('');
  const exp = (portfolio.experience || []).map((e:any) => `<div><strong>${e.role}</strong> — ${e.company} <div>${e.duration}</div></div>`).join('<hr/>');
  return `
  <html><head><meta charset="utf-8"><title>Portfolio</title><style>body{font-family:Arial;padding:24px;color:#111} h1{color:#1e40af}</style></head><body>
    <h1>${user?.full_name || 'Zynger'}</h1>
    <h2>${portfolio.title || ''}</h2>
    <p>${portfolio.summary || ''}</p>
    <h3>Skills</h3><ul>${skills}</ul>
    <h3>Experience</h3>${exp}
  </body></html>`;
}
