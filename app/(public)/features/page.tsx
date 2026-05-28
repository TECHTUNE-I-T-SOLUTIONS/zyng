'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, RefreshCw, Code2, Users } from 'lucide-react';
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
        className="px-6 text-center max-w-6xl mx-auto space-y-8 pt-16"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.05]"
        >
          Tools for campus <br />
          life and <span className="text-accent">what comes after.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg md:text-xl opacity-70 font-normal leading-relaxed"
        >
          Zyng combines social posting, messaging, rooms, marketplace listings, jobs, events, referrals, and alumni networking into a single school-first product.
          The platform is designed for universities, polytechnics, colleges, institutes, and other higher schools so people can participate with the right identity for the right context.
        </motion.p>
      </motion.section>

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
               <div className="bg-background border border-border p-6 rounded-lg text-center space-y-4 shadow-xl z-20 hover:border-foreground/30 transition-colors group">
                 <Shield className="text-foreground/40 mx-auto group-hover:text-accent transition-colors" />
                 <h3 className="font-semibold text-sm">Persona controls</h3>
                 <p className="text-xs opacity-60">Create and activate personas so public activity fits the conversation without exposing account usernames everywhere.</p>
               </div>
               
               <div className="bg-background border border-accent/30 shadow-[0_0_20px_rgba(255,184,0,0.1)] p-6 rounded-lg text-center space-y-4 relative z-20 group hover:border-accent/50 transition-colors">
                 <Users className="text-accent mx-auto" />
                 <h3 className="font-semibold text-sm">Community trust</h3>
                 <p className="text-xs opacity-60">Trust signals and moderation tools help students, alumni, and school communities stay useful and accountable.</p>
               </div>

               <div className="bg-background border border-border p-6 rounded-lg text-center space-y-4 shadow-xl z-20 hover:border-foreground/30 transition-colors group">
                 <Zap className="text-foreground/40 mx-auto group-hover:text-accent transition-colors" />
                 <h3 className="font-semibold text-sm">Real-time updates</h3>
                 <p className="text-xs opacity-60">Messages, reactions, room activity, and notifications update without a page refresh.</p>
               </div>
             </div>
             
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
        className="py-24 px-6 max-w-auto pr-16 pl-16 mx-auto border-t border-border"
      >
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            <div className="space-y-12">
               <div className="space-y-4">
                 <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                   <Shield size={20} />
                 </div>
                   <h3 className="text-2xl font-medium tracking-tight">Identity separation</h3>
                 <p className="opacity-70 text-sm leading-relaxed">
                     People can participate with an active persona that is visible in the network without publishing their account credentials, private signup details, or raw usernames to everyone else.
                 </p>
               </div>

               <div className="space-y-4">
                 <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                   <Zap size={20} />
                 </div>
                   <h3 className="text-2xl font-medium tracking-tight">Instant interactions</h3>
                 <p className="opacity-70 text-sm leading-relaxed">
                     Reactions, replies, rooms, events, marketplace listings, and chat requests update in real time so students and alumni can respond while the conversation is still relevant.
                 </p>
               </div>
            </div>

            <div className="space-y-12">
               <div className="space-y-4">
                 <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                   <Code2 size={20} />
                 </div>
                   <h3 className="text-2xl font-medium tracking-tight">Messaging and discovery</h3>
                 <p className="opacity-70 text-sm leading-relaxed">
                     The inbox combines direct chats, requests, matches, and skill-based suggestions so it is easy to move from discovery to respectful conversation.
                 </p>
               </div>
               
               <div className="space-y-4">
                 <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                   <RefreshCw size={20} />
                 </div>
                   <h3 className="text-2xl font-medium tracking-tight">Campus and alumni scope</h3>
                 <p className="opacity-70 text-sm leading-relaxed">
                     Student content stays within the school network, while alumni content continues in a dedicated professional space that can connect graduates across shared schools, faculties, departments, skills, and interests.
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
        className="py-24 px-6 max-w-auto mx-auto text-center space-y-8 bg-muted/10 border-y border-border"
      >
         <h2 className="text-3xl font-medium tracking-tight">Built for schools that need structure.</h2>
         <p className="opacity-60 max-w-xl mx-auto text-sm">
           Zyng is designed for everyone with a school identity, from students to long-time alumni, with persona controls, moderation tools, and a clear alumni transition path.
         </p>
         <Link href="/in/signup" className="inline-flex mt-4 px-6 py-2 bg-background border border-border hover:bg-muted text-foreground font-medium rounded-md transition-colors text-sm">
           Join us Here
         </Link>
      </motion.section>

    </div>
  );
}
