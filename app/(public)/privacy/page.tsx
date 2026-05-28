'use client';

import { motion } from 'framer-motion';

export default function PrivacyPage() {
  const sections = [
    { title: 'Information we collect', content: 'We collect account details that are needed to create and secure a Zyng account, including phone number or email for sign-in, school affiliation, faculty, department, graduation status, profile fields, personas, posts, messages, and activity required for moderation and service delivery.' },
    { title: 'School and community context', content: 'Zyng is built around higher education communities. A school can be a university, polytechnic, college, institute, academy, or other recognized place of higher learning. We use school, faculty, and department information to place people in the right campus or alumni context.' },
    { title: 'How we use information', content: 'We use data to authenticate users, scope feeds to the correct user, campus or alumni community, power rooms and direct messages, support matchmaking, keep trust and moderation systems working, and respond to support requests.' },
    { title: 'Sharing and access', content: 'Public activity is shown to the people who are meant to see it inside Zyng. We do not sell personal data to advertisers. Limited service providers may process data on our behalf to host the app, deliver email, or support security operations.' },
    { title: 'Personas and profile visibility', content: 'Zyng is persona-first. In most social surfaces, active personas are shown instead of account usernames. If a public persona is not available, Zyng may use a masked display name so the platform can remain understandable without exposing more profile information than needed.' },
    { title: 'Messages and sensitive reports', content: 'Messages, requests, matches, contact requests, and feedback submissions may be reviewed when needed for support, safety, abuse prevention, or legal compliance. Safety reports should include enough detail for the team to investigate without sharing unnecessary private information.' },
    { title: 'Retention and deletion', content: 'We keep account and content records for as long as they are needed to operate the platform, enforce rules, resolve disputes, or comply with legal obligations. Where deletion is supported, we remove data from active use and retain only what is required by law or operational need.' },
    { title: 'Security controls', content: 'Zyng uses authentication, access restrictions, and moderation tooling to reduce unauthorized access and abuse. No online service is perfectly secure, so users should protect their credentials and report suspicious activity quickly.' },
    { title: 'Your choices', content: 'You can update profile information, manage personas, and contact support to request help with account access, privacy concerns, or content review. School administrators and alumni moderators may also have limited visibility needed for safety and operations.' },
    { title: 'Graduation and alumni transition', content: 'When graduation information shows that a user has completed school, Zyng may transition that account into alumni mode. This helps keep school identity, referrals, professional conversations, and alumni-only spaces connected to the same account.' }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-3xl mx-auto px-6 py-20 space-y-16 relative z-10">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center space-y-4"
        >
           <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase">
             PRIVACY <span className="text-accent underline decoration-accent/30 underline-offset-8">POLICY.</span>
           </h1>
           <p className="opacity-40 font-bold uppercase tracking-[0.2em] text-xs pt-4 text-accent">Last updated: May 2026</p>
           <p className="opacity-70 text-sm max-w-2xl mx-auto leading-relaxed">
             This summary explains how Zyng handles information across students, graduates, and alumni communities from universities, polytechnics, colleges, and other higher schools.
           </p>
        </motion.div>

        <div className="space-y-12">
          {sections.map((s, i) => (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               key={i} 
               className="space-y-4 bg-muted/20 p-8 rounded-[32px] border border-border"
            >
              <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3 text-foreground">
                <span className="text-accent drop-shadow-md">P{i + 1}.</span> {s.title}
              </h2>
              <p className="opacity-70 leading-relaxed font-medium text-lg">
                {s.content}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center text-xs text-foreground/40 leading-relaxed max-w-2xl mx-auto">
          Questions about privacy, access, or deletion can be sent through the contact page. When a school or alumni community has additional policy requirements, those rules may apply alongside this page.
        </div>
      </div>
    </div>
  );
}
