'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, UserPlus, Zap, Bell, Loader2, School, ShieldAlert, FileText, BadgeCheck, BriefcaseBusiness, Users, MessageCircle, Megaphone, GraduationCap } from 'lucide-react';

const notificationMeta: Record<string, { icon: any; color: string; label: string; group: string }> = {
  reaction: { icon: Heart, color: 'text-red-500', label: 'Reaction', group: 'social' },
  reply: { icon: MessageSquare, color: 'text-blue-500', label: 'Reply', group: 'social' },
  mention: { icon: UserPlus, color: 'text-green-500', label: 'Mention', group: 'social' },
  system: { icon: Zap, color: 'text-orange-500', label: 'System', group: 'system' },
  welcome: { icon: BadgeCheck, color: 'text-emerald-500', label: 'Welcome', group: 'system' },
  school_created: { icon: School, color: 'text-indigo-500', label: 'School', group: 'admin' },
  school_status: { icon: School, color: 'text-indigo-500', label: 'School', group: 'admin' },
  signup: { icon: Users, color: 'text-cyan-500', label: 'Signup', group: 'admin' },
  post_created: { icon: MessageCircle, color: 'text-fuchsia-500', label: 'Post', group: 'social' },
  post_updated: { icon: MessageCircle, color: 'text-fuchsia-500', label: 'Post', group: 'social' },
  persona_created: { icon: UserPlus, color: 'text-violet-500', label: 'Persona', group: 'profile' },
  resume_created: { icon: FileText, color: 'text-amber-500', label: 'Resume', group: 'profile' },
  opportunity_created: { icon: BriefcaseBusiness, color: 'text-emerald-500', label: 'Opportunity', group: 'career' },
  opportunity_match: { icon: BriefcaseBusiness, color: 'text-emerald-500', label: 'Opportunity', group: 'career' },
  verification_submitted: { icon: BadgeCheck, color: 'text-sky-500', label: 'Verification', group: 'trust' },
  verification_completed: { icon: BadgeCheck, color: 'text-sky-500', label: 'Verification', group: 'trust' },
  report_created: { icon: ShieldAlert, color: 'text-red-500', label: 'Report', group: 'trust' },
  report_reviewed: { icon: ShieldAlert, color: 'text-red-500', label: 'Report', group: 'trust' },
  referral_created: { icon: Megaphone, color: 'text-yellow-500', label: 'Referral', group: 'growth' },
  referral_signup: { icon: Megaphone, color: 'text-yellow-500', label: 'Referral', group: 'growth' },
  referred: { icon: Megaphone, color: 'text-yellow-500', label: 'Referral', group: 'growth' },
  zync: { icon: UserPlus, color: 'text-green-500', label: 'Connection', group: 'social' },
  alumni_post_created: { icon: GraduationCap, color: 'text-indigo-500', label: '[alumni]', group: 'alumni' },
  alumni_post_updated: { icon: GraduationCap, color: 'text-indigo-500', label: '[alumni]', group: 'alumni' },
  alumni_reply: { icon: GraduationCap, color: 'text-indigo-500', label: '[alumni]', group: 'alumni' },
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter mb-2 flex items-center gap-3">
            NOTIFICATIONS
            <Bell className="text-accent" />
          </h1>
          <p className="text-foreground/40 font-medium italic">Stay updated with your campus interactions.</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-[3rem]">
            <p className="text-foreground/40 font-bold italic">No new notifications. Start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif, i) => {
              const meta = notificationMeta[notif.type] ?? { icon: Bell, color: 'text-accent', label: 'Notification', group: 'general' };
              const Icon = meta.icon;
              const isAlumni = notif.type?.startsWith('alumni_') || notif.message?.toLowerCase().includes('[alumni]');
              const displayTitle = isAlumni && !notif.title.toLowerCase().startsWith('[alumni]')
                ? `[alumni] ${notif.title}`
                : notif.title;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-muted/40 border border-border/50 hover:border-accent/20 hover:bg-muted p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${!notif.is_read ? 'border-l-4 border-l-accent' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center ${meta.color}`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm flex items-center gap-2 flex-wrap">
                      <span className="font-black">{displayTitle}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30 bg-background/60 border border-border px-2 py-0.5 rounded-full">
                        {meta.label}
                      </span>
                      <span className="text-foreground/60">{notif.message}</span>
                    </div>
                    <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-tighter mt-1">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link href="/z-referral" className="bg-muted/40 border border-border rounded-2xl p-4 hover:border-accent/30 transition-all">
            <div className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-1">Referrals</div>
            <div className="text-sm font-semibold">Manage your referral code, signups, and rewards.</div>
          </Link>
          <Link href="/z-admin/reports" className="bg-muted/40 border border-border rounded-2xl p-4 hover:border-accent/30 transition-all">
            <div className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-1">Reports</div>
            <div className="text-sm font-semibold">Track report reviews and moderation updates.</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
