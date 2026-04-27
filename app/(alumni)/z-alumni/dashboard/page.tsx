'use client';

import { useQuery } from '@tanstack/react-query';
import { campusService } from '@/lib/services/campusService';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  GraduationCap, 
  Globe, 
  MessageCircle, 
  TrendingUp,
  Award,
  ChevronRight,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

export default function AlumniDashboard() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['alumni-jobs'],
    queryFn: () => campusService.getOpportunities(undefined, 'Alumni'),
  });

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">CONGRATULATIONS, GRADUATE!</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Unilorin Alumni Network • Global Reach</p>
        </div>
        <div className="flex -space-x-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-neutral-800" />
          ))}
          <div className="w-12 h-12 rounded-full border-4 border-black bg-indigo-500 flex items-center justify-center text-xs font-black">
            +2k
          </div>
        </div>
      </header>

      {/* Career Alerts */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Briefcase size={120} />
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="bg-white/20 backdrop-blur-md w-fit px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            New Opportunity
          </div>
          <h2 className="text-3xl font-black mb-4 leading-tight">Software Engineer II @ TechCorp</h2>
          <p className="text-white/80 font-medium mb-8 italic">Based on your Computer Science degree and verified certificate from Unilorin.</p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center gap-2">
            Apply Now <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-white/20 mb-6 px-4">PROFESSIONAL ZYNGING</h3>
            <div className="space-y-4">
              {[1,2].map(i => (
                <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">JD</div>
                    <div>
                      <div className="text-sm font-bold italic">Jane_Done_20</div>
                      <div className="text-[10px] text-white/30 uppercase font-black">Senior Architect • Lagos</div>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-6 italic">"Just landed a new role! Anyone from Unilorin engineering looking for mentorship? Drop a Zing!"</p>
                  <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/20">
                    <span>12 Zing Requests</span>
                    <span>42 Likes</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-neutral-900 border border-white/5 p-8 rounded-[2.5rem]">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/20 mb-6">ALUMNI MILESTONES</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold">Certificate Verified</div>
                  <div className="text-[10px] text-white/30 font-medium italic">Your degree has been verified via the university portal.</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 text-white/20 flex items-center justify-center shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white/40">Portfolio Builder</div>
                  <div className="text-[10px] text-white/20 font-medium italic">Complete 80% of your portfolio to unlock high-tier job alerts.</div>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2">
            <GraduationCap size={18} /> DOWNLOAD E-RESUME
          </button>
        </aside>
      </div>
    </div>
  );
}
