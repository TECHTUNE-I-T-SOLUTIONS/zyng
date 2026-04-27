'use client';

import { useQuery } from '@tanstack/react-query';
import { campusService } from '@/lib/services/campusService';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, Loader2 } from 'lucide-react';

export default function AlumniEventsPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['alumni-events'],
    queryFn: () => campusService.getEvents(),
  });

  return (
    <div className="space-y-8 text-white">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Alumni Events</h1>
        <p className="text-white/40 text-sm italic">Professional meetups, talks, and campus reunions.</p>
      </header>

      {isLoading ? <Loader2 className="animate-spin text-indigo-400" /> : (
        <div className="grid grid-cols-1 gap-5">
          {events?.map((event: any, i: number) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
              <div className="flex items-center gap-4 mb-4">
                <Calendar size={18} className="text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">{new Date(event.start_time).toLocaleDateString()}</span>
                <Clock size={16} className="text-white/30" />
                <span className="text-xs font-bold text-white/40">{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <h3 className="text-2xl font-black mb-2">{event.title}</h3>
              <div className="flex items-center gap-2 text-white/40 text-sm"><MapPin size={16} />{event.location || 'Campus'}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
