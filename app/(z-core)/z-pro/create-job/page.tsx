'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, List, ArrowRight, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput) {
      setSkills([...skills, skillInput]);
      setSkillInput('');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-10">
        <header>
          <button onClick={() => router.back()} className="text-foreground/40 hover:text-foreground text-xs font-black uppercase tracking-widest mb-6">← Cancel</button>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Post an Opportunity</h1>
          <p className="text-foreground/40 font-medium italic">Gigs, internships, or full-time roles for the campus network.</p>
        </header>

        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. Frontend Developer" 
                  className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:border-accent outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Company / Group</label>
              <input 
                type="text" 
                placeholder="TechCorp / Private" 
                className="w-full bg-muted border border-border rounded-2xl py-4 px-6 text-sm font-bold focus:border-accent outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Description</label>
            <textarea 
              placeholder="What are the responsibilities?" 
              className="w-full bg-muted border border-border rounded-[2rem] p-6 text-sm font-medium min-h-[150px] focus:border-accent outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
                <input type="text" placeholder="Remote / On-site" className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Compensation</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
                <input type="text" placeholder="₦50k / Month" className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Type</label>
              <select className="w-full bg-muted border border-border rounded-2xl py-4 px-6 text-sm font-bold outline-none">
                <option>Internship</option>
                <option>Part-time</option>
                <option>Full-time</option>
                <option>Freelance / Gig</option>
              </select>
            </div>
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
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="e.g. React" 
                className="bg-transparent text-sm font-bold px-2 outline-none flex-1"
              />
            </div>
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
