'use client';

import { motion } from 'framer-motion';
import { Target, Users, Server, Globe2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-accent/30 font-sans mt-10">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="px-6 text-center max-w-4xl mx-auto space-y-8 pt-16 pb-24"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.05]"
        >
          Building the infrastructure <br />
          of <span className="text-accent">campus society.</span>
        </motion.h1>
      </motion.section>

      {/* Mission Grid */}
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
             <h3 className="text-2xl font-medium">The Mission</h3>
             <p className="text-sm opacity-70 leading-relaxed">
               Current social networks are designed to perform, not connect. Zyng was built to lower the barrier to authentic interaction by decoupling identity from communication, allowing ideas, questions, and culture to move uninhibited.
             </p>
          </div>

          <div className="bg-background p-12 space-y-6">
             <div className="w-12 h-12 bg-muted/50 rounded-xl border border-border flex items-center justify-center">
                <Server className="text-foreground/70" />
             </div>
             <h3 className="text-2xl font-medium">The Technology</h3>
             <p className="text-sm opacity-70 leading-relaxed">
               We prioritize speed, security, and scalability. By treating social interaction as a real-time data problem, we've structured a platform that feels instantaneous and structurally prevents data bleed between isolated campus populations.
             </p>
          </div>

          <div className="bg-background p-12 space-y-6">
             <div className="w-12 h-12 bg-muted/50 rounded-xl border border-border flex items-center justify-center">
                <Users className="text-foreground/70" />
             </div>
             <h3 className="text-2xl font-medium">The Network</h3>
             <p className="text-sm opacity-70 leading-relaxed">
               An isolated network is a dying network. We architected Zyng to transition. You start in a highly-local, raw campus feed and graduate into a global, verified professional matrix where your accrued trust score matters.
             </p>
          </div>

          <div className="bg-background p-12 space-y-6">
             <div className="w-12 h-12 bg-muted/50 rounded-xl border border-border flex items-center justify-center">
                <Globe2 className="text-foreground/70" />
             </div>
             <h3 className="text-2xl font-medium">Global Scale</h3>
             <p className="text-sm opacity-70 leading-relaxed">
               Launched on a single campus, built to serve thousands. Our edge-routed architecture means that whether you are accessing Zyng in Boston or Berlin, the latency to your local peers remains sub-100ms.
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
        className="py-32 px-6 max-w-5xl mx-auto border-t border-border mt-32 text-center space-y-16"
      >
         <h2 className="text-3xl font-medium tracking-tight">By the numbers</h2>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-medium text-accent">0ms</p>
              <p className="text-xs uppercase tracking-widest opacity-60">Identity Spillage</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-medium text-accent">100%</p>
              <p className="text-xs uppercase tracking-widest opacity-60">Data Isolation</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-medium text-accent">2x</p>
              <p className="text-xs uppercase tracking-widest opacity-60">Daily Engagement</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-medium text-accent">&infin;</p>
              <p className="text-xs uppercase tracking-widest opacity-60">Active Personas</p>
            </div>
         </div>
      </motion.section>
    </div>
  );
}
