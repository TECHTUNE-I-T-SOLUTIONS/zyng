'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Save, 
  Award, 
  Briefcase, 
  BookOpen,
  Eye,
  Loader2
} from 'lucide-react';

export default function AlumniPortfolioPage() {
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState({
    experience: [{ company: '', role: '', duration: '' }],
    education: [{ school: 'University of Ilorin', degree: '', year: '' }],
    skills: [],
    certificates: []
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: ['alumni-portfolio'],
    queryFn: async () => {
      const { data, error } = await supabase.from('resumes').select('*').single();
      if (data) setPortfolio(data.content);
      return data;
    }
  });

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('resumes')
      .upsert([{ user_id: user?.id, content: portfolio }]);
    setLoading(false);
    if (!error) alert('Portfolio Saved Successfully');
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(portfolio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Zynger_Resume_${new Date().toLocaleDateString()}.json`;
    a.click();
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-indigo-400">PROFESSIONAL PORTFOLIO</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Build your resume for the global market</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={downloadJSON}
             className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:text-indigo-400 transition-all"
             title="Download Data"
           >
             <Download size={20} />
           </button>
           <button 
             onClick={handleSave}
             disabled={loading}
             className="bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
           >
             {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Sync Portfolio</>}
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Experience Section */}
        <section className="bg-neutral-900 border border-white/5 p-10 rounded-[3rem] shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black flex items-center gap-3">
              <Briefcase className="text-indigo-500" size={24} /> EXPERIENCE
            </h2>
            <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-xl">
               <Plus size={14} /> Add Role
            </button>
          </div>
          
          <div className="space-y-6">
            {portfolio.experience.map((exp, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/5 relative group">
                <input 
                  placeholder="Company" 
                  className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                  value={exp.company}
                  onChange={(e) => {
                    const newExp = [...portfolio.experience];
                    newExp[i].company = e.target.value;
                    setPortfolio({...portfolio, experience: newExp});
                  }}
                />
                <input 
                  placeholder="Role" 
                  className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                  value={exp.role}
                  onChange={(e) => {
                    const newExp = [...portfolio.experience];
                    newExp[i].role = e.target.value;
                    setPortfolio({...portfolio, experience: newExp});
                  }}
                />
                <input 
                  placeholder="Duration" 
                  className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                  value={exp.duration}
                  onChange={(e) => {
                    const newExp = [...portfolio.experience];
                    newExp[i].duration = e.target.value;
                    setPortfolio({...portfolio, experience: newExp});
                  }}
                />
                <button title="Delete" className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Preview Card */}
        <section className="bg-indigo-500/10 border border-indigo-500/20 p-10 rounded-[3rem] border-dashed text-center">
           <FileText className="mx-auto text-indigo-500 mb-4" size={48} />
           <h3 className="text-2xl font-black mb-2">Live E-Resume Preview</h3>
           <p className="text-white/40 text-sm font-medium italic mb-8 max-w-sm mx-auto">
             Visualize how recruiters see your verified Zyng profile. Export as PDF or share your professional link.
           </p>
           <button className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 mx-auto hover:scale-105 transition-all">
             <Eye size={18} /> Launch Preview
           </button>
        </section>
      </div>
    </div>
  );
}
