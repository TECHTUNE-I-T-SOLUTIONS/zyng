'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is Zyng?',
    a: 'Zyng is a school-based social and professional network that combines posting, direct messaging, rooms, marketplace listings, jobs, events, referrals, and alumni networking.',
  },
  {
    q: 'Who can join Zyng?',
    a: 'Anyone connected to a higher school can belong on Zyng. That includes universities, polytechnics, colleges, institutes, academies, and similar schools. You can be a current student, a recent graduate, a long-time alumni, or an approved member of that school community.',
  },
  {
    q: 'What if my school is not a university?',
    a: 'That is fine. Zyng is not only for universities. The important thing is that the community has a real school structure, usually with a school name, faculty or division, department or program, and a student or alumni relationship.',
  },
  {
    q: 'How do personas work?',
    a: 'A persona is the public identity you use inside Zyng. You can create more than one persona, choose an active one, and use that profile for posts and interactions while keeping your account credentials private.',
  },
  {
    q: 'What happens when a user who is a student becomes an alumnus?',
    a: 'Alumni accounts keep access to the alumni network and the pro tools that belong there. The student profile does not disappear; it transitions into the alumni experience so connections, referrals, and professional conversations remain organized.',
  },
  {
    q: 'Who can I see in my feed?',
    a: 'You will see people and content scoped to the school or network you belong to. That includes fellow students, alumni, rooms tied to your campus, and alumni content when you are in the alumni area. Social surfaces prefer active personas over raw usernames.',
  },
  {
    q: 'Why do I need an active persona?',
    a: 'Active personas keep Zyng consistent and safer. Posts, messages, matches, rooms, events, jobs, marketplace activity, and referrals are easier to understand when people show a persona identity instead of exposing account usernames everywhere.',
  },
  {
    q: 'Can older alumni use Zyng?',
    a: 'Yes. Zyng is not limited to recent graduates. If someone attended a school years ago and can reasonably belong to that school community, they can use alumni features, connect with others, share opportunities, and participate in school-linked spaces.',
  },
  {
    q: 'How are safety and moderation handled?',
    a: 'We combine reporting tools, admin review, and trust signals to identify spam or harmful behavior. Messages and rooms are designed to support moderation while keeping the product usable for genuine campus communication.',
  },
  {
    q: 'Can schools or departments be added?',
    a: 'Yes. If a school, faculty, department, or program is missing, users can contact Zyng support with the correct details. This helps avoid duplicate or misleading school records.',
  },
  {
    q: 'Can I get help if I have an account problem?',
    a: 'Yes. Use the contact page to report account issues, ask for recovery help, or request assistance with a school or alumni profile. If the issue is urgent, send it directly to the support address listed there.',
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
            Common <span className="text-accent">questions.</span>
          </h1 >
          <p className="opacity-60 text-sm">A clear overview of how Zyng works for students, alumni, and campus partners.</p>
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
