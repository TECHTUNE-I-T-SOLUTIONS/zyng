'use client';

import { motion } from 'framer-motion';
import { BriefcaseBusiness, GraduationCap, MessageSquare, Network, ShieldCheck, Sparkles, Target, Users, Server, Globe2 } from 'lucide-react';

const productSurfaces = [
  {
    title: 'Campus conversations',
    description: 'A chronological feed for confessions, questions, hot takes, updates, missed connections, project drops, and everyday campus signal.',
  },
  {
    title: 'Identity-aware personas',
    description: 'Multiple personas let people speak with context while keeping their core account and school identity protected behind the scenes.',
  },
  {
    title: 'Rooms and messages',
    description: 'Private and public rooms support class groups, communities, events, societies, alumni circles, and safer one-to-one conversation.',
  },
  {
    title: 'Opportunity network',
    description: 'Jobs, referrals, portfolios, alumni search, marketplace listings, and events connect campus reputation to practical next steps.',
  },
];

const audiences = [
  'Students who want a real campus feed without turning every thought into a permanent public profile.',
  'Graduates who want to keep their school network useful after final year, NYSC, internships, first jobs, or relocation.',
  'Alumni who want to mentor, refer, hire, host events, reconnect, or give back to the same school community.',
  'School communities that need safer digital spaces with reporting, verification, moderation, and network boundaries.',
];

const roadmap = [
  'AI-assisted discovery for search, summaries, matching, and safer moderation workflows.',
  'Stronger school verification paths for departments, programs, alumni cohorts, staff, and approved partners.',
  'Better professional profiles that turn campus activity, skills, projects, and referrals into career momentum.',
  'More tools for events, rooms, local marketplace needs, and alumni-led opportunity pipelines.',
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-accent/30 font-sans mt-10">
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="px-6 text-center max-w-auto mx-auto space-y-8 pt-16 pb-18"
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

      <section className="px-6 max-w-auto mx-auto pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-6"
          >
            <div className="text-xs font-black uppercase tracking-[0.24em] text-accent">Why Zyng exists</div>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight">Campus life has always been social. The tools around it have not kept up.</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border border-border bg-muted/20 p-8 space-y-5 text-sm leading-7 text-foreground/70"
          >
            <p>
              Most students already live inside dozens of disconnected group chats, anonymous pages, public social networks, departmental notices, marketplace groups, and alumni channels. The result is noisy, fragmented, and often unsafe: people miss important information, opportunities are hard to verify, and school communities lose their memory when students graduate.
            </p>
            <p>
              Zyng brings those pieces into one school-bound network. It is social enough for everyday campus culture, structured enough for opportunities and alumni relationships, and private enough to let people participate without forcing their full identity into every moment.
            </p>
          </motion.div>
        </div>
      </section>

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

      <section className="px-6 max-w-auto mx-auto mt-28 space-y-10">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-black uppercase tracking-[0.24em] text-accent">What the platform connects</div>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight">One place for the social, academic, and professional sides of school life.</h2>
          <p className="text-sm leading-7 text-foreground/60">
            Zyng is not only a feed, and it is not only a job board. The platform is designed as a connective layer for the things that already happen around school communities every day.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {productSurfaces.map((surface, index) => (
            <motion.div
              key={surface.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.06 }}
              className="rounded-lg border border-border bg-background p-7"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md border border-border bg-muted/40">
                {[MessageSquare, Sparkles, Network, BriefcaseBusiness][index] && (() => {
                  const Icon = [MessageSquare, Sparkles, Network, BriefcaseBusiness][index];
                  return <Icon size={20} className="text-accent" />;
                })()}
              </div>
              <h3 className="text-xl font-medium">{surface.title}</h3>
              <p className="mt-3 text-sm leading-7 text-foreground/65">{surface.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 max-w-auto mx-auto mt-28">
        <div className="rounded-lg border border-border bg-muted/10 p-8 md:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background">
                <GraduationCap className="text-accent" />
              </div>
              <h2 className="text-3xl font-medium tracking-tight">Built for the whole school lifecycle.</h2>
              <p className="text-sm leading-7 text-foreground/60">
                A school network should not expire at graduation. Zyng keeps students, graduates, alumni, and school communities connected through different seasons of the same identity.
              </p>
            </div>
            <div className="grid gap-3">
              {audiences.map((item) => (
                <div key={item} className="rounded-md border border-border bg-background p-4 text-sm leading-7 text-foreground/70">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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

      <section className="px-6 max-w-auto mx-auto pb-28">
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="rounded-lg border border-border bg-background p-8 space-y-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted/40">
              <ShieldCheck className="text-accent" />
            </div>
            <h2 className="text-3xl font-medium tracking-tight">Trust is part of the product, not an afterthought.</h2>
            <p className="text-sm leading-7 text-foreground/65">
              Zyng uses school context, personas, reporting, trust signals, verification, and admin workflows to reduce abuse without flattening every conversation into a corporate profile. The goal is to keep expression alive while giving communities tools to respond when something goes wrong.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.08 }}
            className="rounded-lg border border-border bg-background p-8 space-y-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted/40">
              <Sparkles className="text-accent" />
            </div>
            <h2 className="text-3xl font-medium tracking-tight">Where Zyng is going next.</h2>
            <div className="space-y-3">
              {roadmap.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-7 text-foreground/65">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
