'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, TrendingDown, Send, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/services/userService';

export default function FeedbackPage() {
  const { data: user } = useQuery({ queryKey: ['feedback-me'], queryFn: () => userService.getCurrentUser() });
  const [mood, setMood] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [notice, setNotice] = useState('');
  const userName = user?.z_name || user?.full_name || user?.phone || '';
  const userSchoolName = user?.school?.name || '';
  const submittedName = userName || name;
  const submittedEmail = user?.email || email;

  const submitFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mood) {
      setStatus('error');
      setNotice('Please select a mood before submitting feedback.');
      return;
    }
    setStatus('submitting');
    setNotice('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: submittedName || null, email: submittedEmail || null, mood, category, message, school_name: userSchoolName || null }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Unable to submit feedback.');

      setName('');
      setEmail('');
      setCategory('general');
      setMessage('');
      setMood(null);
      setStatus('success');
      setNotice('Thank you. Your feedback has been saved for review.');
    } catch (err) {
      setStatus('error');
      setNotice(err instanceof Error ? err.message : 'Unable to submit feedback.');
    }
  };

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
            SHARE <br /> <span className="text-accent underline decoration-accent/30 underline-offset-8">FEEDBACK.</span>
          </h1>
          <p className="opacity-60 font-bold uppercase tracking-[0.2em] text-xs">Tell us what works, what breaks, and what should exist next.</p>
        </motion.div>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-10"
        >
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-center opacity-40">How is the product feeling?</h3>
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

        {status === 'success' ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/30 backdrop-blur-md rounded-[48px] p-8 md:p-14 border border-accent/30 shadow-2xl text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent text-black shadow-xl shadow-accent/20">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight">Feedback submitted</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/60">
              {notice || 'Thank you. Your feedback has been saved for review.'}
            </p>
            <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-border bg-background/50 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40">
                Refresh this page when you want to submit another form.
              </p>
            </div>
          </motion.section>
        ) : (
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={submitFeedback}
            className="bg-muted/30 backdrop-blur-md rounded-[48px] p-8 md:p-14 border border-border shadow-2xl space-y-8"
          >
            <p className="text-sm text-foreground/60 leading-relaxed max-w-2xl">
              Use this form for feature requests, bugs, moderation issues, partnership questions, or general product comments. The team reviews submissions and uses them to prioritize releases and support work.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background/50 border border-border rounded-3xl p-6 group transition-all focus-within:border-accent/50 focus-within:bg-background">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">What should we call you?</label>
                <input type="text" value={user ? submittedName : name} onChange={(event) => setName(event.target.value)} readOnly={!!user} placeholder="Name or team name" className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold focus:outline-none placeholder:opacity-30" />
              </div>
              <div className="bg-background/50 border border-border rounded-3xl p-6 group transition-all focus-within:border-accent/50 focus-within:bg-background">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">Contact email</label>
                <input type="email" value={user?.email ? submittedEmail : email} onChange={(event) => setEmail(event.target.value)} readOnly={!!user?.email} placeholder="you@school.edu" className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold focus:outline-none placeholder:opacity-30" />
              </div>
            </div>

            {user && (
              <div className="bg-background/50 border border-border rounded-3xl p-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">School</label>
                <input title="school" value={userSchoolName || 'School not set'} readOnly className="w-full bg-transparent border-none p-0 font-bold text-foreground/70 focus:outline-none" />
              </div>
            )}

            <div className="bg-background/50 border border-border rounded-3xl p-6 transition-all focus-within:border-accent/50 focus-within:bg-background">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">Feedback type</label>
              <select title="category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full bg-background/50 border-none p-0 focus:ring-0 font-bold focus:outline-none">
                <option value="general">General feedback</option>
                <option value="bug">Bug report</option>
                <option value="feature">Feature request</option>
                <option value="school">School, faculty, or department request</option>
                <option value="safety">Safety or moderation</option>
                <option value="partnership">Partnership idea</option>
              </select>
            </div>

            <div className="bg-background/50 border border-border rounded-3xl p-6 transition-all focus-within:border-accent/50 focus-within:bg-background">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">Message for the team</label>
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} required placeholder="Describe the issue, the page it happened on, and the steps you took so we can reproduce it." className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold min-h-[150px] resize-none focus:outline-none placeholder:opacity-30" />
            </div>

            <button type="submit" disabled={status === 'submitting'} className="w-full bg-accent text-black font-black py-6 rounded-full uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60">
              {status === 'submitting' ? 'Submitting...' : 'Submit request'} <Send size={18} />
            </button>

            {status === 'error' && notice && (
              <p className="text-xs font-bold text-center text-red-500">
                {notice}
              </p>
            )}

            <p className="text-[11px] text-foreground/40 leading-relaxed text-center">
              High-priority safety reports should go directly to the contact page. Product feedback is used for planning, bug triage, and campus rollout decisions.
            </p>
          </motion.form>
        )}
      </div>
    </div>
  );
}
