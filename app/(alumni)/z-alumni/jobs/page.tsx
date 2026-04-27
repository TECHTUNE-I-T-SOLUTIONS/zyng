'use client';

import { useQuery } from '@tanstack/react-query';
import { campusService } from '@/lib/services/campusService';
import { Briefcase, Loader2, ChevronRight } from 'lucide-react';

export default function AlumniJobsPage() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['alumni-jobs'],
    queryFn: () => campusService.getOpportunities(),
  });

  return (
    <div className="space-y-8 text-white">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Opportunities</h1>
        <p className="text-white/40 text-sm italic">Career posts and alumni-friendly openings.</p>
      </header>
      {isLoading ? <Loader2 className="animate-spin text-indigo-400" /> : (
        <div className="space-y-4">
          {jobs?.map((job: any) => (
            <div key={job.id} className="bg-white/5 border border-white/5 rounded-[2rem] p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center"><Briefcase size={26} /></div>
                <div>
                  <h3 className="font-black text-xl">{job.title}</h3>
                  <div className="text-xs uppercase tracking-widest text-indigo-400 font-black">{job.company || 'Alumni Network'}</div>
                </div>
              </div>
              <ChevronRight className="text-white/20" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
