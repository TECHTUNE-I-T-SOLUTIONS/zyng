'use client';

import { motion } from 'framer-motion';

export default function TermsPage() {
  const sections = [
    { title: 'Acceptance of terms', content: 'By creating an account or using Zyng, you agree to these terms and to any community rules or school-specific policies that apply to your campus or alumni network. If you do not agree, do not use the service.' },
    { title: 'Eligibility and account accuracy', content: 'You must provide accurate information when registering and keep your account secure. Zyng is open to people connected to a higher school, including universities, polytechnics, colleges, institutes, academies, and similar schools, whether they are current students, recent graduates, long-time alumni, staff, or approved community members.' },
    { title: 'School, faculty, and department details', content: 'Your school profile helps Zyng place you in the right network. You should choose the correct school, faculty, department, program, and graduation information where those fields apply. If your exact school or department is missing, you may request support instead of creating misleading information.' },
    { title: 'Acceptable use', content: 'You may not use Zyng to harass, threaten, impersonate others, spread malware, evade moderation, or post unlawful content. We may limit, suspend, or remove access if your activity puts the community or the platform at risk.' },
    { title: 'Content and personas', content: 'You are responsible for the content you post through your personas. Personas are a product feature for context and privacy, not a license to violate the rules or mislead people in harmful ways.' },
    { title: 'Respect across generations', content: 'Zyng connects current students, recent graduates, and older alumni. Users should communicate respectfully, especially in mentorship, referrals, jobs, events, and professional conversations. Connection requests to alumni should be thoughtful and not spammy.' },
    { title: 'Marketplace, jobs, events, and rooms', content: 'Listings, opportunities, rooms, and events must be honest, lawful, and relevant to the intended school or alumni community. Zyng may remove misleading listings, unsafe events, scams, or posts that abuse student or alumni trust.' },
    { title: 'Alumni access', content: 'When a user account transitions into alumni mode, the account may gain access to alumni-specific spaces, professional networking tools, and connect features. Availability can vary by school or program.' },
    { title: 'Feedback and support submissions', content: 'When you submit contact or feedback forms, you agree that Zyng may use the details to respond, investigate issues, improve the product, and keep records of support activity. Do not submit private information that is not needed for your request.' },
    { title: 'Service changes and termination', content: 'We may update, suspend, or discontinue features when needed to improve the service, comply with legal obligations, or protect the community. We may also suspend accounts that repeatedly violate the rules.' }
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
          <p className="opacity-40 font-bold uppercase tracking-widest text-xs pt-4">Last updated: May 2026</p>
          <p className="opacity-70 text-sm max-w-2xl mx-auto leading-relaxed">
            These terms summarize the rules for using Zyng across student, alumni, staff, and partner spaces tied to higher schools.
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
          TL;DR: Use Zyng responsibly, respect other people, and follow the rules of your campus community.
        </motion.div>
      </div>
    </div>
  );
}
