'use client';

import { motion } from 'framer-motion';
import { Database, Shield, Zap, RefreshCw, Cpu, Code2, Workflow, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function FeaturesPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-accent/30 font-sans mt-10">
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="px-6 text-center max-w-4xl mx-auto space-y-8 pt-16"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.05]"
        >
          Everything you need <br />
          for <span className="text-accent">campus life.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg md:text-xl opacity-70 font-normal leading-relaxed"
        >
          From semi-anonymous confessions to verified professional networking.
          Zyng gives you the tools to express yourself freely and connect deeply.
        </motion.p>
      </motion.section>

      {/* Main Architecture Diagram */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-24 px-6 max-w-5xl mx-auto"
      >
        <div className="bg-muted/10 border border-border rounded-xl p-8 md:p-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
           <div className="relative z-10 flex flex-col items-center">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
               {/* Client Layer */}
               <div className="bg-background border border-border p-6 rounded-lg text-center space-y-4 shadow-xl z-20 hover:border-foreground/30 transition-colors group">
                 <Shield className="text-foreground/40 mx-auto group-hover:text-accent transition-colors" />
                 <h3 className="font-semibold text-sm">Total Privacy</h3>
                 <p className="text-xs opacity-60">Create personas to talk without fear of judgment.</p>
               </div>
               
               {/* Logic Layer */}
               <div className="bg-background border border-accent/30 shadow-[0_0_20px_rgba(255,184,0,0.1)] p-6 rounded-lg text-center space-y-4 relative z-20 group hover:border-accent/50 transition-colors">
                 <Users className="text-accent mx-auto" />
                 <h3 className="font-semibold text-sm">Community Trust</h3>
                 <p className="text-xs opacity-60">Earn reputation to unlock alumni access after graduation.</p>
               </div>

               {/* Data Layer */}
               <div className="bg-background border border-border p-6 rounded-lg text-center space-y-4 shadow-xl z-20 hover:border-foreground/30 transition-colors group">
                 <Zap className="text-foreground/40 mx-auto group-hover:text-accent transition-colors" />
                 <h3 className="font-semibold text-sm">Real-time Pulse</h3>
                 <p className="text-xs opacity-60">Watch trending topics and campus sentiment update instantly.</p>
               </div>
             </div>
             
             {/* Connection Lines */}
             <div className="hidden md:block absolute top-[50%] left-[20%] right-[20%] border-t-2 border-dashed border-border z-10 opacity-50" />
           </div>
        </div>
      </motion.section>


      {/* Technical Specifications */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-24 px-6 max-w-5xl mx-auto border-t border-border"
      >
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            <div className="space-y-12">
               <div className="space-y-4">
                 <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                   <Shield size={20} />
                 </div>
                 <h3 className="text-2xl font-medium tracking-tight">Semi-Anonymous Freedom</h3>
                 <p className="opacity-70 text-sm leading-relaxed">
                   When you switch Personas, Zyng provisions a localized session that protects your core identity. Speak your mind, ask questions, or make jokes without worrying about permanent social consequences.
                 </p>
               </div>

               <div className="space-y-4">
                 <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                   <Zap size={20} />
                 </div>
                 <h3 className="text-2xl font-medium tracking-tight">Instant Interactions</h3>
                 <p className="opacity-70 text-sm leading-relaxed">
                   The campus feed moves fast. React to posts, drop confessions, and join trending conversations in real-time. Everything is built to reflect the exact mood of the campus right now.
                 </p>
               </div>
            </div>

            <div className="space-y-12">
               <div className="space-y-4">
                 <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                   <Code2 size={20} />
                 </div>
                 <h3 className="text-2xl font-medium tracking-tight">Dynamic Trust System</h3>
                 <p className="opacity-70 text-sm leading-relaxed">
                   Freedom needs accountability. Our community-driven trust score rewards good actors and suppresses toxicity, ensuring the campus feed remains safe, fun, and authentic.
                 </p>
               </div>
               
               <div className="space-y-4">
                 <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                   <RefreshCw size={20} />
                 </div>
                 <h3 className="text-2xl font-medium tracking-tight">Strict Geofencing</h3>
                 <p className="opacity-70 text-sm leading-relaxed">
                   What happens on campus, stays on campus. Our feed is entirely localized to your university, ensuring every conversation is highly relevant to your immediate environment.
                 </p>
               </div>
            </div>
         </div>
      </motion.section>

      {/* API / Extensibility Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-24 px-6 max-w-5xl mx-auto text-center space-y-8 bg-muted/10 border-y border-border"
      >
         <h2 className="text-3xl font-medium tracking-tight">Built for your campus.</h2>
         <p className="opacity-60 max-w-xl mx-auto text-sm">
           Want Zyng at your university? We work with student unions and campus organizations to create customized, localized networks.
         </p>
         <Link href="/contact" className="inline-flex mt-4 px-6 py-2 bg-background border border-border hover:bg-muted text-foreground font-medium rounded-md transition-colors text-sm">
           Bring Zyng to you
         </Link>
      </motion.section>

    </div>
  );
}
