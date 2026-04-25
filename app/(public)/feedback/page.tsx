'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, TrendingDown, Send } from 'lucide-react';

export default function FeedbackPage() {
  const [mood, setMood] = useState<number | null>(null);

  return (
    <div className="relative overflow-hidden min-h-screen">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-accent/5 blur-[150px] rounded-[100%] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 py-20 space-y-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
            MAKE ZYNG <br /> <span className="text-accent underline decoration-accent/30 underline-offset-8">BETTER.</span>
          </h1>
          <p className="opacity-60 font-bold uppercase tracking-[0.2em] text-xs">Your opinion shapes the campus future.</p>
        </motion.div>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-10"
        >
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-center opacity-40">Overall Campus Vibe?</h3>
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {[
              { label: '🔥', value: 1 },
              { label: '⚡', value: 2 },
              { label: '🤔', value: 3 },
              { label: '😴', value: 4 },
              { label: '💀', value: 5 },
            ].map((item, i) => (
              <motion.button 
                key={item.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                onClick={() => setMood(item.value)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center text-4xl transition-all border border-border/50 ${
                  mood === item.value ? 'bg-accent/20 border-accent/50 shadow-2xl shadow-accent/20 scale-110' : 'bg-muted/40 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:bg-muted'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.section>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-muted/30 backdrop-blur-md rounded-[48px] p-8 md:p-14 border border-border shadow-2xl space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background/50 border border-border rounded-3xl p-6 group transition-all focus-within:border-accent/50 focus-within:bg-background">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">Favorite Feature</label>
              <input type="text" placeholder="e.g. Persona Swapping" className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold focus:outline-none placeholder:opacity-30" />
            </div>
            <div className="bg-background/50 border border-border rounded-3xl p-6 group transition-all focus-within:border-accent/50 focus-within:bg-background">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">Biggest Issue</label>
              <input type="text" placeholder="e.g. Too many polls" className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold focus:outline-none placeholder:opacity-30" />
            </div>
          </div>

          <div className="bg-background/50 border border-border rounded-3xl p-6 transition-all focus-within:border-accent/50 focus-within:bg-background">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">Message for the Team</label>
            <textarea placeholder="Write your heart out..." className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold min-h-[150px] resize-none focus:outline-none placeholder:opacity-30" />
          </div>

          <button type="button" className="w-full bg-accent text-black font-black py-6 rounded-full uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            Submit Feedback <Send size={18} />
          </button>
        </motion.form>
      </div>
    </div>
  );
}
