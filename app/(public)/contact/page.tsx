'use client';

import { motion } from 'framer-motion';
import { Terminal, Send, Github, Twitter, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-accent/30 font-sans mt-10">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 max-w-5xl mx-auto pt-16 pb-32"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
              Get in touch with<br />
              <span className="text-accent">our team.</span>
            </h1>
            <p className="opacity-60 text-sm leading-relaxed max-w-md">
              Whether you want to bring Zyng to your university, report an issue, or just say hello, we're here to listen.
            </p>
            
            <div className="space-y-4 pt-8 border-t border-border">
              <a href="mailto:hello@zyng.network" className="flex items-center gap-4 text-sm font-medium hover:text-accent transition-colors group">
                 <div className="w-10 h-10 border border-border bg-muted/30 rounded-lg flex items-center justify-center group-hover:border-accent/50 transition-colors">
                   <Mail size={16} />
                 </div>
                 hello@zyng.network
              </a>
              <a href="#" className="flex items-center gap-4 text-sm font-medium hover:text-accent transition-colors group">
                 <div className="w-10 h-10 border border-border bg-muted/30 rounded-lg flex items-center justify-center group-hover:border-accent/50 transition-colors">
                   <Twitter size={16} />
                 </div>
                 @zyng_campus
              </a>
            </div>
          </div>

          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2, duration: 0.5 }}
             className="bg-muted/10 border border-border rounded-xl p-8 relative overflow-hidden"
          >
             <div className="flex items-center gap-2 mb-6">
               <Terminal size={16} className="text-foreground/40" />
               <span className="text-xs font-medium uppercase tracking-widest opacity-50">Support Ticket</span>
             </div>

             <form className="space-y-4 relative z-10" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium opacity-70 ml-1">Your Email</label>
                  <input 
                    type="email" 
                    placeholder="you@university.edu" 
                    className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium opacity-70 ml-1">Topic</label>
                  <select className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none">
                    <option>University Partnership</option>
                    <option>Community Safety</option>
                    <option>Feature Request</option>
                    <option>Account Support</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium opacity-70 ml-1">Message</label>
                  <textarea 
                    rows={4}
                    placeholder="How can we help?" 
                    className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors resize-none"
                  />
                </div>

                <div className="pt-4">
                  <button className="w-full bg-accent hover:bg-accent/90 text-[hsl(var(--background))] font-bold rounded-md px-4 py-2.5 transition-colors flex items-center justify-center gap-2 text-sm">
                    Send Message <Send size={14} />
                  </button>
                </div>
             </form>
          </motion.div>

        </div>
      </motion.section>
    </div>
  );
}
