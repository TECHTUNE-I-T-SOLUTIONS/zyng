'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { Inbox, Loader2, Mail, MessageSquare, Bell, CheckCircle2 } from 'lucide-react';

type Tab = 'contact' | 'feedback' | 'notifications';

export default function AdminSupportPage() {
  const [tab, setTab] = useState<Tab>('contact');

  const { data: contacts, isLoading: loadingContacts, refetch: refetchContacts } = useQuery({
    queryKey: ['admin-contact-submissions'],
    enabled: tab === 'contact',
    queryFn: async () => {
      const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: feedback, isLoading: loadingFeedback, refetch: refetchFeedback } = useQuery({
    queryKey: ['admin-feedback-submissions'],
    enabled: tab === 'feedback',
    queryFn: async () => {
      const { data, error } = await supabase.from('feedback_submissions').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: notifications, isLoading: loadingNotifications, refetch: refetchNotifications } = useQuery({
    queryKey: ['admin-notifications'],
    enabled: tab === 'notifications',
    queryFn: async () => {
      const { data, error } = await supabase.from('admin_notifications').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const markContact = async (id: string, status: string) => {
    await supabase.from('contact_submissions').update({ status }).eq('id', id);
    refetchContacts();
  };

  const markFeedback = async (id: string, status: string) => {
    await supabase.from('feedback_submissions').update({ status }).eq('id', id);
    refetchFeedback();
  };

  const resolveNotification = async (id: string) => {
    await supabase.from('admin_notifications').update({ is_resolved: true }).eq('id', id);
    refetchNotifications();
  };

  const isLoading = loadingContacts || loadingFeedback || loadingNotifications;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Support Desk</h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Contact requests, feedback, and admin notifications</p>
      </header>

      <div className="flex gap-2 rounded-2xl bg-neutral-900 border border-white/5 p-2 w-fit">
        {[
          { key: 'contact', label: 'Contacts', icon: Mail },
          { key: 'feedback', label: 'Feedback', icon: MessageSquare },
          { key: 'notifications', label: 'Notifications', icon: Bell },
        ].map((item) => (
          <button key={item.key} onClick={() => setTab(item.key as Tab)} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${tab === item.key ? 'bg-accent text-black' : 'text-white/40 hover:text-white'}`}>
            <item.icon size={14} /> {item.label}
          </button>
        ))}
      </div>

      <section className="bg-neutral-900 border border-white/5 rounded-[2rem] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>
        ) : tab === 'contact' ? (
          <Queue items={contacts || []} empty="No contact submissions yet." onMark={markContact} kind="contact" />
        ) : tab === 'feedback' ? (
          <Queue items={feedback || []} empty="No feedback submissions yet." onMark={markFeedback} kind="feedback" />
        ) : (
          <div className="divide-y divide-white/5">
            {(notifications || []).length === 0 ? <Empty text="No admin notifications yet." /> : notifications?.map((item: any) => (
              <div key={item.id} className={`p-6 flex items-start justify-between gap-4 ${item.is_resolved ? 'opacity-50' : ''}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/5 border border-white/10 px-2 py-1 text-[9px] font-black uppercase text-white/40">{item.target_level}</span>
                    <h3 className="font-black">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-white/50">{item.message}</p>
                  <p className="mt-2 text-[10px] text-white/20 uppercase font-black">{item.type} - {new Date(item.created_at).toLocaleString()}</p>
                </div>
                {!item.is_resolved && (
                  <button onClick={() => resolveNotification(item.id)} className="rounded-xl bg-accent px-3 py-2 text-[10px] font-black uppercase tracking-widest text-black">
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Queue({ items, empty, onMark, kind }: { items: any[]; empty: string; onMark: (id: string, status: string) => void; kind: 'contact' | 'feedback' }) {
  if (items.length === 0) return <Empty text={empty} />;
  return (
    <div className="divide-y divide-white/5">
      {items.map((item) => (
        <div key={item.id} className="p-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-white/5 border border-white/10 px-2 py-1 text-[9px] font-black uppercase text-white/40">{item.status}</span>
              <h3 className="font-black">{kind === 'contact' ? item.topic : item.category}</h3>
              {kind === 'feedback' && item.mood && <span className="text-[10px] font-black text-accent uppercase">Mood {item.mood}/5</span>}
            </div>
            <p className="mt-3 text-sm text-white/60 whitespace-pre-wrap">{item.message}</p>
            <p className="mt-3 text-[10px] text-white/25 uppercase font-black">
              {item.name || 'Anonymous'} - {item.email || 'No email'} - {item.school_name || 'No school'} - {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={() => onMark(item.id, 'reviewing')} className="rounded-xl bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/60">Review</button>
            <button onClick={() => onMark(item.id, 'resolved')} className="rounded-xl bg-accent px-3 py-2 text-[10px] font-black uppercase tracking-widest text-black"><CheckCircle2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-white/30">
      <Inbox size={40} />
      <p className="mt-4 text-xs font-black uppercase tracking-widest">{text}</p>
    </div>
  );
}
