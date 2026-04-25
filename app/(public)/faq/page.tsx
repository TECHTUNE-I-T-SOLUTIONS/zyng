'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How does the Persona system actually work?',
    a: 'When you sign up, you provide your student ID or email, which we securely verify. But when you post, you use a Persona—an isolated profile that isn\'t publicly linked to your real identity. You can create multiple personas to express different sides of yourself on campus.',
  },
  {
    q: 'Is my data geofenced to my campus?',
    a: 'Yes. Every post, confession, and missed connection is strictly locked to your university. You will never see posts from other colleges in your main feed, ensuring everything is 100% relevant to you.',
  },
  {
    q: 'How do Alumni transitions work?',
    a: 'When you graduate, your student account naturally transitions. You can choose to verify your alumni status, which unlocks access to the Global Alumni network, professional mentorship, and career opportunities.',
  },
  {
    q: 'How does the Trust Score work?',
    a: 'Zyng relies on a community-moderation system. High-quality posts and positive interactions increase your Trust Score. Toxicity or spam lowers it, eventually limiting a persona\'s ability to post.',
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-accent/30 font-sans mt-10">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 max-w-3xl mx-auto space-y-16 pt-16 pb-32"
      >
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight">
            Got <span className="text-accent">questions?</span>
          </h1 >
          <p className="opacity-60 text-sm">Everything you need to know about Zyng's platform and community rules.</p>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="space-y-4"
        >
          {faqs.map((faq, i) => (
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              key={i} 
              className="border border-border bg-background rounded-lg overflow-hidden group hover:border-foreground/30 transition-colors"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none"
              >
                <span className="font-medium text-sm">{faq.q}</span>
                <ChevronDown 
                  size={16} 
                  className={`opacity-50 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out px-6 overflow-hidden ${openIndex === i ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="h-px w-full bg-border mb-4" />
                <p className="text-sm opacity-70 leading-relaxed text-accent/90 dark:text-accent/80">
                  {faq.a}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
}
