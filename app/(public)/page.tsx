'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Fingerprint, Activity, Zap, Lock, Radio, Briefcase, GraduationCap, Users, Shield, MapPin, Search, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-accent/30 font-sans mt-10">
      {/* Top Announcement Bar */}
      <div className="flex justify-center pt-8 md:pt-16 pb-8">
        <Link href="/in/signup" className="group flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/30 hover:bg-muted/50 transition-colors text-xs font-medium backdrop-blur-sm">
          <span className="opacity-70">Join us to shape Zyng.</span>
          <ChevronRight size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Hero Section */}
      <section className="px-6 text-center max-w-5xl mx-auto space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight leading-[1.05]"
        >
          Connect on campus.<br />
          <span className="text-accent dark:text-accent">Scale for life.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Zyng is the socio-professional development platform.<br className="hidden md:block" />
          Start your journey with a semi-anonymous campus feed, instant personas,<br className="hidden md:block" />
          real-time sentiment pulse, and verified alumni networks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link href="/in/signup" className="w-full sm:w-auto px-6 py-3 bg-accent hover:bg-accent dark:bg-accent text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2 text-sm">
            Start your network
          </Link>
          <Link href="/features" className="w-full sm:w-auto px-6 py-3 bg-muted/30 hover:bg-muted border border-border font-medium rounded-md transition-colors flex items-center justify-center gap-2 text-sm">
            Request a demo
          </Link>
        </motion.div>
      </section>

      {/* Trusted By Logos (Faux) */}
      <section className="py-24 px-6 border-b border-border">
        <p className="text-center text-xs font-semibold text-foreground/40 uppercase tracking-widest mb-8">
          Trusted by student bodies nationwide
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale">
          {/* Using Lucide icons as fake university/org logos */}
          <Shield size={32} />
          <GraduationCap size={32} />
          <Briefcase size={32} />
          <Users size={32} />
          <Globe size={32} />
        </div>
      </section>

      {/* Bento Grid Features */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 px-6 max-w-6xl mx-auto space-y-16"
      >

        {/* Bento Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personas Card */}
          <div className="lg:col-span-1 bg-background border border-border rounded-xl p-8 flex flex-col group overflow-hidden relative">
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Fingerprint size={16} className="text-foreground/60" />
                <span>Dynamic Personas</span>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                Express every side of your personality. Create multiple isolated personas to interact naturally without exposing your main profile.
              </p>
              <ul className="text-xs space-y-2 pt-4 opacity-70">
                <li className="flex items-center gap-2"><Check /> Complete privacy protection</li>
                <li className="flex items-center gap-2"><Check /> Built-in Trust Score</li>
                <li className="flex items-center gap-2"><Check /> Switch instantly</li>
              </ul>
            </div>

            {/* Visual */}
            <div className="mt-8 flex-1 border border-border rounded-lg bg-muted/20 relative overflow-hidden h-40 group-hover:bg-muted/40 transition-colors">
              {mounted && (
                <motion.div
                  animate={{ y: [0, -40, -80, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-x-4 top-4 space-y-3"
                >
                  <div className="bg-background border border-border rounded-md p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 w-1/3 bg-foreground/20 rounded" />
                      <div className="h-2 w-2/3 bg-foreground/10 rounded" />
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-md p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 w-1/2 bg-foreground/20 rounded" />
                      <div className="h-2 w-3/4 bg-foreground/10 rounded" />
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-md p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 w-1/4 bg-foreground/20 rounded" />
                      <div className="h-2 w-1/2 bg-foreground/10 rounded" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Authentication/Trust Card */}
          <div className="lg:col-span-1 bg-background border border-border rounded-xl p-8 flex flex-col group overflow-hidden relative">
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lock size={16} className="text-foreground/60" />
                <span>Verified Network</span>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                Exclusive to your university. Our rigorous verification and geofencing ensure you're only interacting with real students on your campus.
              </p>
            </div>

            {/* Visual */}
            <div className="mt-8 flex-1 border border-border rounded-lg bg-muted/20 relative overflow-hidden h-40 p-4 space-y-3 flex flex-col justify-end group-hover:bg-muted/40 transition-colors">
              <div className="h-8 border border-border rounded bg-background flex items-center px-3 opacity-60">
                <div className="w-24 h-2 bg-foreground/20 rounded" />
              </div>
              <div className="h-8 border border-border rounded bg-background flex items-center px-3 opacity-60">
                <div className="w-32 h-2 bg-foreground/20 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 border border-border rounded bg-background flex-1 flex items-center px-3 opacity-60">
                  <div className="w-20 h-2 bg-foreground/20 rounded" />
                </div>
                <div className="h-8 border border-accent/30 rounded bg-accent/10 flex-1 flex items-center px-3 text-accent font-bold text-[10px]">
                  VERIFIED
                </div>
              </div>
            </div>
          </div>

          {/* Edge Functions / Automation Card */}
          <div className="lg:col-span-1 bg-background border border-border rounded-xl p-8 flex flex-col group overflow-hidden relative">
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Activity size={16} className="text-foreground/60" />
                <span>Campus Pulse</span>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                Feel the heartbeat of your university. Watch trending topics, shared sentiments, and real-time activity metrics across the entire campus.
              </p>
            </div>

            {/* Visual - Radar/Graph */}
            <div className="mt-8 flex-1 border border-border rounded-lg bg-muted/20 relative overflow-hidden h-40 flex items-end justify-center px-4 group-hover:bg-muted/40 transition-colors">
              <div className="w-full h-[120px] relative border-b border-l border-border flex items-end gap-1 pb-1 pl-1">
                {[40, 70, 45, 90, 60, 85, 50, 100].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="flex-1 bg-accent/50 rounded-t-sm"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bento Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Realtime API Card */}
          <div className="bg-background border border-border rounded-xl p-8 flex flex-col समूह overflow-hidden relative min-h-[300px]">
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Radio size={16} className="text-foreground/60" />
                <span>Real-time Feed</span>
              </div>
              <p className="text-sm opacity-80 leading-relaxed max-w-sm">
                No algorithms. No delays. Experience campus life as it happens with our lightning-fast, chronological feed of confessions, events, and hot takes.
              </p>
            </div>
            {/* Visual - Map/Nodes */}
            <div className="absolute right-0 bottom-0 w-2/3 h-2/3 flex items-center justify-center opacity-40">
              <svg viewBox="0 0 100 100" className="w-full h-full stroke-foreground/20" fill="none">
                <path d="M 20 80 Q 50 10 80 80" strokeWidth="0.5" />
                <path d="M 10 50 L 90 50" strokeWidth="0.5" />
                <circle cx="20" cy="80" r="2" className="fill-accent" />
                <circle cx="80" cy="80" r="2" className="fill-accent" />
                <circle cx="50" cy="45" r="2" className="fill-accent" />

                {mounted && (
                  <motion.circle
                    cx="50" cy="45" r="6"
                    animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="fill-accent/20"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Database / Storage Card */}
          <div className="bg-background border border-border rounded-xl p-8 flex flex-col group overflow-hidden relative min-h-[300px]">
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Search size={16} className="text-foreground/60" />
                <span>Missed Connections</span>
              </div>
              <p className="text-sm opacity-80 leading-relaxed max-w-sm">
                Did you cross paths with someone special? Drop an anonymous note and let the campus community help you find your missed connection.
              </p>
            </div>

            {/* Visual - Social Card */}
            <div className="absolute bottom-6 -right-6 w-5/6 h-auto bg-muted/90 border border-border rounded-xl p-5 overflow-hidden opacity-95 backdrop-blur-xl shadow-2xl space-y-4 group-hover:-translate-y-2 transition-transform duration-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                  <div className="w-4 h-4 bg-rose-500/50 rounded-full" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="h-2 w-1/3 bg-foreground/40 rounded" />
                    <div className="text-[10px] text-foreground/50 font-medium">Just now</div>
                  </div>
                  <div className="h-2 w-1/4 bg-foreground/20 rounded" />
                </div>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                To the blond guy reading infinite jest on the 3rd floor of the main library... hit me up. Drop a comment if you see this.
              </p>
              <div className="flex gap-2">
                <div className="h-6 px-3 bg-accent/10 border border-accent/20 text-accent rounded-full text-[10px] flex items-center justify-center font-bold">Main Library</div>
                <div className="h-6 px-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full text-[10px] flex items-center justify-center font-bold">Crush</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-border">
          <p className="text-lg"><span className="font-semibold">One platform.</span> Complete campus coverage. Integrated for students and alumni.</p>
        </div>
      </motion.section>

      {/* Integration Logos section */}
      <section className="py-24 px-6 bg-muted/10 border-y border-border">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight">
            A network that grows with<br />
            <span className="text-accent">your career.</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            {/* Fake framework logos equivalent */}
            <div className="font-bold text-xl uppercase tracking-widest text-foreground/50">Finance</div>
            <div className="font-bold text-xl uppercase tracking-widest text-foreground/50">Tech</div>
            <div className="font-bold text-xl uppercase tracking-widest text-foreground/50">Medicine</div>
            <div className="font-bold text-xl uppercase tracking-widest text-foreground/50">Law</div>
            <div className="font-bold text-xl uppercase tracking-widest text-foreground/50">Arts</div>
          </div>
        </div>
      </section>


      {/* Life After Graduation Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 px-6 max-w-6xl mx-auto space-y-16"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight">Life After Graduation</h2>
          <p className="opacity-60 text-sm max-w-xl mx-auto">Your campus reputation matters. Use the trust score you built on Zyng to connect directly with verified alumni who walked the same halls.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Find Your First Role', desc: 'Bypass the resume stack with direct referrals from alumni who trust your campus reputation.' },
            { title: 'Relocating to a New City', desc: 'Connect with recent grads in your new city. Find roommates, local advice, and friendly faces.' },
            { title: 'Career Mentorship', desc: 'Get practical guidance from those\'ve been there. From choosing a major to negotiating your first offer.' }
          ].map((tmpl, i) => (
            <motion.div
              whileHover={{ y: -5 }}
              key={i}
              className="bg-background border border-border rounded-xl p-6 group hover:border-foreground/30 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="h-32 mb-6 border-b border-border bg-gradient-to-b from-muted/50 to-transparent -mx-6 -mt-6 p-6 rounded-t-xl flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                  <GraduationCap size={48} className="text-foreground/20 group-hover:text-accent/50 transition-colors" />
                </div>
                <h3 className="font-semibold text-lg">{tmpl.title}</h3>
                <p className="text-sm opacity-60 mt-2">{tmpl.desc}</p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold uppercase tracking-wider text-accent opacity-80 group-hover:opacity-100 transition-colors gap-2">
                Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer CTA */}
      <section className="py-32 px-6 text-center space-y-8 bg-muted/10 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 blur-[100px] z-0" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">Join other Zyngers today on Zyng.</h2>
          <p className="opacity-60 mb-8 max-w-md mx-auto">Join thousands of users sharing, creating, and connecting right now on Zyng.</p>
          <Link href="/in/signup" className="inline-flex px-8 py-3 bg-accent hover:bg-accent/90 text-[hsl(var(--background))] font-medium rounded-md transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/20">
            Get Started Now
          </Link>
        </div>
      </section>

    </div>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

