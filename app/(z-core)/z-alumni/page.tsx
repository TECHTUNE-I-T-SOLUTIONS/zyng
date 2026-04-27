'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Link as LinkIcon, UserCheck, MessageCircle, Loader2 } from 'lucide-react';

export default function AlumniPage() {
  const { data: alumniMode, isLoading } = useQuery({
    queryKey: ['alumni-data'],
    queryFn: async () => {
      // Fetch alumni posts or mentors
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_alumni_only', true);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-5xl font-black tracking-tighter mb-4 flex items-center gap-4 justify-center md:justify-start">
            ALUMNI MODE
            <GraduationCap size={48} className="text-accent" />
          </h1>
          <p className="text-foreground/40 text-lg font-medium max-w-2xl italic mx-auto md:mx-0">
            Connecting graduates with students. Professional networking, mentorship, and career growth.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-6 px-2">PROFESSIONAL OPPORTUNITIES</h2>
              {isLoading ? (
                <div className="flex justify-center py-10">
                   <Loader2 className="animate-spin text-accent" />
                </div>
              ) : !alumniMode || alumniMode.length === 0 ? (
                <div className="bg-muted/40 border border-dashed border-border p-12 rounded-[2.5rem] text-center">
                   <p className="text-foreground/30 text-xs font-black uppercase tracking-widest">No alumni-exclusive opportunities yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alumniMode.map((opp, i) => (
                    <motion.div
                      key={opp.id}
                      whileHover={{ y: -5 }}
                      className="bg-muted border border-border p-6 rounded-[2.5rem] hover:border-accent/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                           <Briefcase size={24} />
                        </div>
                        <div>
                          <div className="font-black text-lg">{opp.title}</div>
                          <div className="text-[10px] font-bold text-accent uppercase tracking-widest">{opp.company}</div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/60 mb-6 line-clamp-2 italic">
                        {opp.description}
                      </p>
                      <button className="w-full bg-background border border-border py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all">
                         Apply via Portal
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-muted to-muted/20 border border-border p-8 rounded-[3rem] shadow-xl shadow-accent/5">
              <h3 className="text-2xl font-black mb-4 tracking-tight">Are you a graduate?</h3>
              <p className="text-sm text-foreground/40 font-medium mb-8 italic">
                Switch to Alumni Mode to share your experience, post jobs, and mentor current students.
              </p>
              <button className="w-full bg-accent text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
                <UserCheck size={18} /> VERIFY ALUMNI STATUS
              </button>
            </div>

            <div className="bg-muted border border-border p-8 rounded-[3rem]">
               <h4 className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-4">QUICK LINKS</h4>
               <div className="space-y-3">
                  {['Professional Ethics', 'Interview Tips', 'CV Templates', 'Alumni Directory'].map((link) => (
                     <div key={link} className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-border/50 hover:text-accent hover:border-accent/30 transition-all cursor-pointer group">
                        <span className="text-xs font-bold">{link}</span>
                        <LinkIcon size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                     </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
