'use client';

import { motion } from 'framer-motion';
import { Target, Users, Server, Globe2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-accent/30 font-sans mt-10">
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="px-6 text-center max-w-4xl mx-auto space-y-8 pt-16 pb-18"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.05]"
        >
          Building a safer social layer <br />
          for <span className="text-accent">everyone.</span>
        </motion.h1>
        <p className="text-base md:text-lg opacity-70 leading-relaxed max-w-3xl mx-auto">
          Zyng is a social network for everyone connected to a higher school, whether that school is a university, polytechnic, college, institute, academy, or another structured place of learning.
          It supports current students, recent graduates, long-time alumni, and school communities that need identity-aware social tools without exposing an entire personal profile to every interaction.
        </p>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="px-6 max-w-5xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          
          <div className="bg-background p-12 space-y-6">
             <div className="w-12 h-12 bg-muted/50 rounded-xl border border-border flex items-center justify-center">
                <Target className="text-foreground/70" />
             </div>
             <h3 className="text-2xl font-medium">What Zyng is for</h3>
             <p className="text-sm opacity-70 leading-relaxed">
               Zyng is designed for school-linked connection before, during, and after campus life. It helps people share updates, ask questions, collaborate on projects, discover opportunities, and stay in touch with classmates, departments, groups, staff, and alumni without forcing every interaction through a single public identity.
             </p>
          </div>

          <div className="bg-background p-12 space-y-6">
             <div className="w-12 h-12 bg-muted/50 rounded-xl border border-border flex items-center justify-center">
                <Server className="text-foreground/70" />
             </div>
             <h3 className="text-2xl font-medium">How the platform works</h3>
             <p className="text-sm opacity-70 leading-relaxed">
               Accounts are tied to a school profile, faculty, department, and graduation context where available. User-facing activity is expressed through active personas. Posts, messages, rooms, jobs, events, marketplace listings, and alumni profiles are then filtered by the relevant campus or network scope.
             </p>
          </div>

          <div className="bg-background p-12 space-y-6">
             <div className="w-12 h-12 bg-muted/50 rounded-xl border border-border flex items-center justify-center">
                <Users className="text-foreground/70" />
             </div>
             <h3 className="text-2xl font-medium">Community and moderation</h3>
             <p className="text-sm opacity-70 leading-relaxed">
               Zyng includes reporting, trust scoring, and moderation tools so communities can respond to spam, harassment, scams, impersonation, or abuse. The goal is to keep Zyng spaces useful and respectful while still allowing open discussion.
             </p>
          </div>

          <div className="bg-background p-12 space-y-6">
             <div className="w-12 h-12 bg-muted/50 rounded-xl border border-border flex items-center justify-center">
                <Globe2 className="text-foreground/70" />
             </div>
             <h3 className="text-2xl font-medium">Alumni continuity</h3>
             <p className="text-sm opacity-70 leading-relaxed">
               When a student graduates, the account can continue into the alumni network instead of starting over. That allows professional connections, referrals, mentorship, alumni rooms, jobs, and school memories to remain connected to the same school identity.
             </p>
          </div>

        </div>
      </motion.section>

      {/* Stats/Facts */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-32 px-6 max-w-auto mx-auto border-t border-border mt-32 text-center space-y-16"
      >
         <h2 className="text-3xl font-medium tracking-tight">Operating principles</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <p className="text-2xl font-medium text-accent">School-bound</p>
              <p className="text-xs uppercase tracking-widest opacity-60">Universities, polytechnics, colleges, institutes, and similar schools can all fit.</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-medium text-accent">Persona-first</p>
              <p className="text-xs uppercase tracking-widest opacity-60">People interact through active personas instead of exposing usernames everywhere.</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-medium text-accent">Moderated</p>
              <p className="text-xs uppercase tracking-widest opacity-60">Reports, trust signals, and admin review help keep the network usable.</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-medium text-accent">Alumni-ready</p>
              <p className="text-xs uppercase tracking-widest opacity-60">Recent and long-time graduates can keep learning, mentoring, hiring, and connecting.</p>
            </div>
         </div>
      </motion.section>
    </div>
  );
}
