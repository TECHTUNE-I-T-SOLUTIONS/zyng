'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  { 
    quote: "It feels freeing to just say what's on my mind without worrying about my public profile. I found my missed connection from the library in under 10 minutes.", 
    author: "@midnight_runner", 
    desc: "Engineering, Class of '25" 
  },
  { 
    quote: "Honestly, the campus pulse feature is addictive. I can tell when midterms are happening just by the collectively stressed vibes on the feed.", 
    author: "@caffeine_fiend", 
    desc: "Biology, Class of '26" 
  },
  { 
    quote: "I switched my persona to ask a really basic question about financial aid. Got 5 helpful answers in minutes. No judgment, just help.", 
    author: "@curious_freshman", 
    desc: "Arts, Class of '27" 
  },
  { 
    quote: "Zyng is where the actual campus culture lives. It's raw, it's hilarious, and it completely bypasses the fake flex culture of other apps.", 
    author: "@truth_teller", 
    desc: "Business, Class of '24" 
  }
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(testimonials[0]);

  useEffect(() => {
    setActiveTestimonial(testimonials[Math.floor(Math.random() * testimonials.length)]);
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col pt-8 px-6 pb-6 sm:px-12 lg:px-24">
        {children}
      </div>

      {/* Right Visual Side */}
      <div className="hidden lg:flex w-1/2 bg-muted/30 relative border-l border-border overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl z-0" />
        <div className="absolute w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 animate-pulse transition-all duration-1000" />
        <div className="absolute w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] bottom-0 right-0 z-0" />
        
        <div className="relative z-10 max-w-lg p-12 selection:bg-accent/30">
          <div className="text-6xl font-serif text-foreground/20 leading-none mb-4">"</div>
          
          <div className="min-h-[160px]">
            <AnimatePresence mode="wait">
              {mounted && (
                <motion.div
                  key={activeTestimonial.author}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <p className="text-2xl font-medium tracking-tight text-foreground/90 leading-snug">
                    {activeTestimonial.quote}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 bg-accent/20" />
                      <div className="w-6 h-6 bg-accent/50 rounded-full blur-[2px]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activeTestimonial.author}</p>
                      <p className="text-xs text-foreground/50">{activeTestimonial.desc}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
