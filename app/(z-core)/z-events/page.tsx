'use client';

import { useQuery } from '@tanstack/react-query';
import { campusService } from '@/lib/services/campusService';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, Plus, Loader2 } from 'lucide-react';

export default function EventsPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => campusService.getEvents(),
  });

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">CAMPUS EVENTS</h1>
            <p className="text-foreground/40 font-medium italic">What's happening on campus today?</p>
          </div>
          <button className="bg-accent text-black px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all">
            <Plus size={20} />
            POST EVENT
          </button>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-[3rem]">
            <p className="text-foreground/40 font-bold italic">No upcoming events. Why not host one?</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-muted border border-border rounded-[2rem] overflow-hidden flex flex-col md:flex-row group hover:border-accent/30 transition-all"
              >
                {event.cover_image && (
                  <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden">
                    <img 
                      src={event.cover_image} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-accent text-black font-black px-3 py-1 rounded-xl text-xs uppercase">
                      {event.category || 'General'}
                    </div>
                  </div>
                )}
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2 text-accent font-black text-sm">
                      <Calendar size={16} />
                      {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 text-foreground/40 font-bold text-sm">
                      <Clock size={16} />
                      {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black mb-2">{event.title}</h3>
                  <div className="flex items-center gap-2 text-foreground/60 mb-6">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">{event.location || 'Campus'}</span>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="text-xs font-bold text-foreground/30">
                      Be the first to join
                    </div>
                    <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-foreground text-background px-6 py-2 rounded-xl hover:bg-accent hover:text-black transition-all">
                      <Ticket size={16} />
                      Interested
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
