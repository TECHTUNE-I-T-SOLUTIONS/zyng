'use client';

import { motion } from 'framer-motion';
import { Terminal, Send, Github, Mail, ShieldAlert, BriefcaseBusiness, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/services/userService';

export default function ContactPage() {
  const { data: user } = useQuery({ queryKey: ['contact-me'], queryFn: () => userService.getCurrentUser() });
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Account support');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [notice, setNotice] = useState('');
  const userName = user?.z_name || user?.full_name || user?.phone || '';
  const userSchoolName = user?.school?.name || '';
  const contactEmail = user?.email || email;

  const submitContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setNotice('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contactEmail, topic, message, name: userName || null, school_name: userSchoolName || null }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Unable to submit your request.');

      setEmail('');
      setTopic('Account support');
      setMessage('');
      setStatus('success');
      setNotice('Your request has been saved. The Zyng team will review it.');
    } catch (err) {
      setStatus('error');
      setNotice(err instanceof Error ? err.message : 'Unable to submit your request.');
    }
  };

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
              Contact the Zyng<br />
              <span className="text-accent">team.</span>
            </h1>
            <p className="opacity-60 text-sm leading-relaxed max-w-md">
              Use this page for support, campus partnership questions, press requests, safety reports, or feedback on the product experience. We review each message and route it to the right team.
            </p>
            
            <div className="space-y-4 pt-8 border-t border-border">
              <a href="mailto:hello@zyng.network" className="flex items-center gap-4 text-sm font-medium hover:text-accent transition-colors group">
                 <div className="w-10 h-10 border border-border bg-muted/30 rounded-lg flex items-center justify-center group-hover:border-accent/50 transition-colors">
                   <Mail size={16} />
                 </div>
                 hello@zyng.network - general support
              </a>
              <a href="mailto:partnerships@zyng.network" className="flex items-center gap-4 text-sm font-medium hover:text-accent transition-colors group">
                 <div className="w-10 h-10 border border-border bg-muted/30 rounded-lg flex items-center justify-center group-hover:border-accent/50 transition-colors">
                   <BriefcaseBusiness size={16} />
                 </div>
                 partnerships@zyng.network - campus and organization partnerships
              </a>
              <a href="mailto:safety@zyng.network" className="flex items-center gap-4 text-sm font-medium hover:text-accent transition-colors group">
                 <div className="w-10 h-10 border border-border bg-muted/30 rounded-lg flex items-center justify-center group-hover:border-accent/50 transition-colors">
                   <ShieldAlert size={16} />
                 </div>
                 safety@zyng.network - moderation and trust reports
              </a>
              <a href="https://github.com/TECHTUNE-I-T-SOLUTIONS/zyng" target="_blank" rel="noreferrer noopener" className="flex items-center gap-4 text-sm font-medium hover:text-accent transition-colors group">
                 <div className="w-10 h-10 border border-border bg-muted/30 rounded-lg flex items-center justify-center group-hover:border-accent/50 transition-colors">
                   <Github size={16} />
                 </div>
                 Source and issue tracking
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

             {status === 'success' ? (
               <div className="relative z-10 flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-accent/30 bg-accent/10 p-8 text-center">
                 <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-background">
                   <CheckCircle2 size={32} />
                 </div>
                 <h2 className="text-2xl font-black tracking-tight">Request submitted</h2>
                 <p className="mt-3 max-w-sm text-sm leading-relaxed text-foreground/60">
                   {notice || 'Your request has been saved. The Zyng team will review it and route it to the right people.'}
                 </p>
                 <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40">
                   Refresh this page to send another request.
                 </p>
               </div>
             ) : (
               <form className="space-y-4 relative z-10" onSubmit={submitContact}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium opacity-70 ml-1">Your email</label>
                    <input 
                      type="email" 
                      value={contactEmail}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@school.edu" 
                      required
                      readOnly={!!user?.email}
                      className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>

                  {user && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium opacity-70 ml-1">Submitting as</label>
                        <input value={userName || 'Signed-in Zynger'} readOnly className="w-full bg-background/70 border border-border rounded-md px-4 py-2.5 text-sm text-foreground/70" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium opacity-70 ml-1">School</label>
                        <input value={userSchoolName || 'School not set'} readOnly className="w-full bg-background/70 border border-border rounded-md px-4 py-2.5 text-sm text-foreground/70" />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium opacity-70 ml-1">Topic</label>
                    <select title="Topic" aria-label="Topic" value={topic} onChange={(event) => setTopic(event.target.value)} className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none">
                      <option>Account support</option>
                      <option>School partnership</option>
                      <option>Community safety</option>
                      <option>Product feedback</option>
                      <option>Press or media</option>
                      <option>Missing school, faculty, or department</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium opacity-70 ml-1">Message</label>
                    <textarea 
                      rows={4}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Tell us what happened, what you expected, and any links or screenshots that help us reproduce it." 
                      required
                      className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-4">
                    <button disabled={status === 'submitting'} className="w-full bg-accent hover:bg-accent/90 text-[hsl(var(--background))] font-bold rounded-md px-4 py-2.5 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                      {status === 'submitting' ? 'Submitting...' : 'Submit request'} <Send size={14} />
                    </button>
                  </div>
               </form>
             )}
             {status === 'error' && notice && (
               <p className="mt-4 text-xs font-medium text-red-500">
                 {notice}
               </p>
             )}
             <p className="mt-6 text-[11px] text-foreground/40 leading-relaxed">
               For urgent safety or moderation issues, email the safety address above directly. This form is best for non-urgent support, partnership, and product questions.
             </p>
          </motion.div>

        </div>
      </motion.section>
    </div>
  );
}
