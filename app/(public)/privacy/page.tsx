'use client';

import { motion } from 'framer-motion';

export default function PrivacyPage() {
  const sections = [
    { title: "Data Collection", content: "We collect minimal data to function: phone number for authentication and campus ID for feed scoping. We do NOT collect real names or home addresses." },
    { title: "Identity Security", content: "Your personas are logically isolated in our database. We do not associate your public activity with your phone number in any user-accessible interface." },
    { title: "Data Retention", content: "Zyng content is designed to be short-lived. Expiring posts are permanently purged from our primary database after their timer runs out." },
    { title: "Third Parties", content: "We do not sell data to advertisers. We use security services to protect against bots and DDoS attacks." }
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
           <p className="opacity-40 font-bold uppercase tracking-[0.2em] text-xs pt-4 text-accent">Your identity is your business. Keeping it that way is ours.</p>
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
      </div>
    </div>
  );
}
