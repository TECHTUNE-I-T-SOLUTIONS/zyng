'use client';

import { useQuery } from '@tanstack/react-query';
import { campusService } from '@/lib/services/campusService';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Building, Clock, ChevronRight, Loader2 } from 'lucide-react';

export default function JobsPage() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => campusService.getOpportunities(),
  });

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
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 10 }}
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
                      {job.deadline ? `Deadline: ${new Date(job.deadline).toLocaleDateString()}` : 'No deadline'}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <button className="p-3 bg-background border border-border rounded-xl group-hover:bg-accent group-hover:text-black transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
