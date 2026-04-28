'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { userService } from '@/lib/services/userService';
import { campusService } from '@/lib/services/campusService';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, Plus, Loader2 } from 'lucide-react';

export default function EventsPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => campusService.getEvents(),
  });

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const [showPostModal, setShowPostModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('General');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleCoverPick = () => fileRef.current?.click();
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl }),
        });
        const json = await res.json();
        if (res.ok && json.url) setCoverImage(json.url);
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePostEvent = async () => {
    if (!title.trim() || !startTime || !user?.id) return;
    setPosting(true);
    try {
      await campusService.createEvent({
        title: title.trim(),
        description: description || null,
        start_time: new Date(startTime).toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : null,
        location: location || null,
        category: category || null,
        cover_image: coverImage || null,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
        created_by: user.id,
        school_id: user.school_id || null,
      });
      setShowPostModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to post event');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">CAMPUS EVENTS</h1>
            <p className="text-foreground/40 font-medium italic">What's happening on campus today?</p>
          </div>
          <button onClick={() => setShowPostModal(true)} className="bg-accent text-black px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all">
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

      {/* Post Event Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div onClick={() => setShowPostModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-2xl bg-background border border-border p-8 rounded-[2rem] z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Post Event</h2>
              <button onClick={() => setShowPostModal(false)} className="p-2 bg-muted rounded-lg">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">Title</label>
                <input title="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">Category</label>
                <input title="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">Description</label>
                <textarea title="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3 h-40" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">Tags (comma separated)</label>
                <input title="Tags" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3" placeholder="e.g. music, networking, tech" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">Start Time</label>
                <input title="Start Time" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">End Time</label>
                <input title="End Time" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">Location</label>
                <input title="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">Cover Image</label>
                <input title="Cover Image" ref={fileRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                <div className="flex items-center gap-2">
                  <button onClick={handleCoverPick} className="px-4 py-2 bg-muted rounded-xl">Upload</button>
                  {coverImage && <div className="text-sm font-bold">Uploaded</div>}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button disabled={posting} onClick={handlePostEvent} className="bg-accent text-black px-6 py-3 rounded-2xl font-black hover:scale-105 transition-all">
                {posting ? 'Posting...' : 'Publish Event'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    // </div>
  );
}
