'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Ticket, Loader2, MessageCircle } from 'lucide-react';
import { campusService } from '@/lib/services/campusService';
import { userService } from '@/lib/services/userService';
import { zingService } from '@/lib/services/zingService';
import { extractIdFromSlug } from '@/lib/utils';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventId = extractIdFromSlug(resolvedParams.id);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => campusService.getEventById(eventId),
  });

  const contactCreator = async () => {
    if (!user) return alert('Please login to contact the organizer.');
    if (!event?.created_by || event.created_by === user.id) return alert('This is your own event.');
    const chat = await zingService.sendZingRequest(event.created_by, `Hi, I want to register for "${event.title}".`);
    router.push(`/z-messages?userId=${event.created_by}&chatId=${chat.id}`);
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-10 h-10 text-accent animate-spin" /></div>;
  }

  if (!event) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] bg-background p-6 text-center">
        <h2 className="text-2xl font-black uppercase mb-2">Event Not Found</h2>
        <Link href="/z-events" className="bg-accent text-black px-6 py-3 rounded-2xl font-black hover:scale-105 transition-all uppercase tracking-widest text-xs">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 bg-muted rounded-xl hover:bg-muted/80 transition flex items-center gap-2 text-sm font-bold">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-xs font-black uppercase tracking-widest text-foreground/40">Event Details</div>
      </div>

      <div className="max-w-5xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-5 gap-10 mb-24">
        <div className="lg:col-span-3 space-y-4">
          <div className="aspect-video bg-muted rounded-[2rem] overflow-hidden border border-border">
            {event.cover_image ? <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-foreground/10"><Ticket size={72} /></div>}
          </div>
          {Array.isArray(event.images) && event.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {event.images.slice(1).map((img: string) => (
                <img key={img} src={img} alt={event.title} className="aspect-video object-cover rounded-2xl border border-border" />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col">
          <div className="text-[10px] text-accent font-black uppercase tracking-widest mb-3 bg-accent/10 w-fit px-3 py-1 rounded-lg">
            {event.category || 'General'}
          </div>
          <h1 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight">{event.title}</h1>
          <div className="space-y-3 text-sm text-foreground/60 mb-6">
            <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(event.start_time).toLocaleDateString()}</div>
            <div className="flex items-center gap-2"><Clock size={16} /> {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="flex items-center gap-2"><MapPin size={16} /> {event.location || 'Campus'}</div>
          </div>
          <p className="text-foreground/70 whitespace-pre-wrap mb-8">{event.description || 'No description provided.'}</p>

          <button onClick={contactCreator} className="w-full py-4 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-accent hover:text-black transition-all">
            <MessageCircle size={16} /> Contact Organizer
          </button>
        </div>
      </div>
    </div>
  );
}