'use client';

import { motion } from 'framer-motion';

export default function TermsPage() {
  const sections = [
    { title: "Acceptance of Terms", content: "By accessing or using Zyng, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services." },
    { title: "Eligibility", content: "Zyng is strictly for registered university and polytechnic students. You must have a valid campus identifier or invite code to join." },
    { title: "Conduct", content: "You are responsible for your activity on Zyng. We prohibit harassment, hate speech, and illegal activities. We reserve the right to ban users who violate community safety." },
    { title: "Semi-Anonymity", content: "While we use personas to protect your privacy, we store connection data needed for security. We do not sell your personal data." }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-3xl mx-auto px-6 py-20 space-y-16 relative z-10">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase">
            TERMS <span className="text-accent underline decoration-accent/30 underline-offset-8">OF SERVICE.</span>
          </h1>
          <p className="opacity-40 font-bold uppercase tracking-widest text-xs pt-4">Last updated: April 2026</p>
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
                <span className="text-accent drop-shadow-md">0{i + 1}.</span> {s.title}
              </h2>
              <p className="opacity-70 leading-relaxed font-medium text-lg">
                {s.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-8 bg-accent text-black rounded-3xl border-4 border-black/10 dark:border-white/10 text-center italic text-xl font-black shadow-xl shadow-accent/20 uppercase tracking-tight"
        >
          TL;DR: Be cool, respect the campus, don't be a creep.
        </motion.div>
      </div>
    </div>
  );
}
