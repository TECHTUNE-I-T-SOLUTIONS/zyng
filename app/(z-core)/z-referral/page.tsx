'use client';

import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/services/userService';
import { motion } from 'framer-motion';
import { Share2, Copy, Users, Gift, TrendingUp, Loader2 } from 'lucide-react';

export default function ReferralPage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => userService.getCurrentUser(),
  });

  const code = user?.referral_code || "ZYNG-USER-XXXX";

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied!');
  };

  const shareInvite = async () => {
    const url = `${window.location.origin}/in/signup?ref=${encodeURIComponent(code)}`;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: 'Join Zyng', text: 'Join Zyng with my referral code', url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Invite link copied to clipboard');
      }
    } catch (err) {
      console.error(err);
      alert('Unable to share. Link copied to clipboard.');
      try { await navigator.clipboard.writeText(url); } catch {}
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-accent rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-black shadow-xl shadow-accent/20"
          >
            <Gift size={40} />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter mb-4">REFER & EARN</h1>
          <p className="text-foreground/40 text-lg font-medium max-w-xl mx-auto italic">
            Invite your friends to Zyng and unlock exclusive personas and features.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Referral Code Card */}
          <section className="bg-muted border border-border p-8 rounded-[3rem] flex flex-col items-center shadow-2xl shadow-accent/5">
            <h2 className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-8">YOUR UNIQUE CODE</h2>
            <div className="bg-background border-2 border-dashed border-accent/30 p-6 rounded-2xl w-full text-center mb-6 relative group">
              <span className="text-2xl font-black tracking-widest text-accent">{code}</span>
              <button
                title="Copy Code"
                onClick={copyCode}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-muted rounded-xl hover:bg-accent hover:text-black transition-all"
              >
                <Copy size={18} />
              </button>
            </div>
            <button onClick={shareInvite} className="w-full bg-accent text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
              <Share2 size={18} /> SHARE INVITE LINK
            </button>
          </section>

          {/* Stats Card */}
          <section className="bg-muted border border-border p-8 rounded-[3rem]">
            <h2 className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-8">REFERRAL STATS</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/40 p-6 rounded-2xl border border-border/50 text-center">
                <div className="text-3xl font-black mb-1">0</div>
                <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Invites Sent</div>
              </div>
              <div className="bg-background/40 p-6 rounded-2xl border border-border/50 text-center">
                <div className="text-3xl font-black text-accent mb-1">0</div>
                <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Successful</div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-accent/5 rounded-2xl border border-accent/10">
               <div className="flex items-center gap-3 mb-2 text-accent">
                  <TrendingUp size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Current Milestone</span>
               </div>
               <p className="text-xs font-medium text-foreground/60 mb-4 italic">Refer 2 friends to unlock the "Master" persona badge.</p>
               <div className="w-full bg-accent/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-accent h-full w-[0%]" />
               </div>
            </div>
          </section>
        </div>

        <section className="mt-12">
           <h2 className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-6 px-2">RECENT REFERRALS</h2>
           <div className="bg-muted/40 border border-dashed border-border p-12 rounded-[2.5rem] text-center">
              <p className="text-foreground/30 text-xs font-black uppercase tracking-widest">No referrals yet. Spread the word!</p>
           </div>
        </section>
      </div>
    </div>
  );
}
