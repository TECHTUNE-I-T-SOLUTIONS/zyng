'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { userService } from '@/lib/services/userService';
import { campusService } from '@/lib/services/campusService';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, Plus, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { slugify } from '@/lib/utils';

const CATEGORIES = ['General', 'Academic', 'Social', 'Sports', 'Career', 'Arts', 'Tech'];

export default function EventsPage() {
  const router = useRouter();
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
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  
  // Image handling
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  
  const [tags, setTags] = useState('');
  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Location Debounce & Fetch
  useEffect(() => {
    if (!locationSearch || locationSearch === location) {
      setLocationSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}&limit=5`);
        const data = await res.json();
        setLocationSuggestions(data);
      } catch (err) {
        console.error('OSM error', err);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [locationSearch, location]);

  const handleLocationSelect = (place: any) => {
    const locName = place.display_name;
    setLocation(locName);
    setLocationSearch(locName);
    setLocationSuggestions([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    // Check total size
    const MAX_SIZE = 1.5 * 1024 * 1024; // 1.5MB
    const currentSize = selectedImages.reduce((acc, file) => acc + file.size, 0);
    const newFilesSize = files.reduce((acc, file) => acc + file.size, 0);
    
    if (currentSize + newFilesSize > MAX_SIZE) {
      setErrorMsg('Total image size cannot exceed 1.5MB');
      return;
    }
    setErrorMsg('');

    const newSelected = [...selectedImages, ...files];
    setSelectedImages(newSelected);
    
    // Generate previews
    const previews = newSelected.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newSelected = [...selectedImages];
    newSelected.splice(index, 1);
    setSelectedImages(newSelected);
    setImagePreviews(newSelected.map(file => URL.createObjectURL(file)));
  };

  const handlePostEvent = async () => {
    if (!title.trim() || !startTime || !user?.id) return;
    setPosting(true);
    setErrorMsg('');
    try {
      // Upload images sequentially
      const imageUrls: string[] = [];
      for (const file of selectedImages) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl }),
        });
        const json = await res.json();
        if (res.ok && json.url) imageUrls.push(json.url);
      }

      await campusService.createEvent({
        title: title.trim(),
        description: description || null,
        start_time: new Date(startTime).toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : null,
        location: location || null,
        category: category || null,
        cover_image: imageUrls.length > 0 ? imageUrls[0] : null,
        images: imageUrls.length > 0 ? imageUrls : null,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
        created_by: user.id,
        school_id: user.school_id || null,
      });
      setShowPostModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to post event');
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
                    <button onClick={() => router.push(`/z-events/${slugify(`${event.title}-${event.id}`)}`)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-foreground text-background px-6 py-2 rounded-xl hover:bg-accent hover:text-black transition-all">
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
          <div onClick={() => setShowPostModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto"></div>
          <div className="relative w-full max-w-2xl bg-background border border-border p-8 rounded-[2rem] z-10 my-auto max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Post Event</h2>
              <button title="Close modal" aria-label="Close modal" onClick={() => setShowPostModal(false)} className="p-2 bg-muted rounded-xl hover:bg-muted/80"><X size={20}/></button>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold rounded-xl">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Images (Max 1.5MB total)</label>
                <div className="bg-muted border border-border border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition" onClick={() => fileRef.current?.click()}>
                   <ImageIcon size={32} className="text-foreground/20 mb-2" />
                   <span className="text-sm font-bold">Click to add images</span>
                </div>
                <input ref={fileRef} title="Upload event images" aria-label="Upload event images" type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-4">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          title="Remove image"
                          aria-label="Remove image"
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }} 
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Title</label>
                <input title="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3 focus:border-accent outline-none" placeholder="Enter event title" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Category</label>
                <select title="Event category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3 focus:border-accent outline-none appearance-none">
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2 md:col-span-2 relative">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Location</label>
                <input 
                  title="Location" 
                  value={locationSearch} 
                  onChange={(e) => {
                    setLocationSearch(e.target.value);
                    if (!e.target.value) setLocation('');
                  }} 
                  className="w-full bg-muted border border-border rounded-2xl p-3 focus:border-accent outline-none" 
                  placeholder="Search for a place..."
                />
                {locationSuggestions.length > 0 && (
                  <ul className="absolute z-20 left-0 right-0 top-[100%] mt-2 bg-background border border-border rounded-xl shadow-xl overflow-hidden">
                    {locationSuggestions.map((place: any) => (
                      <li 
                        key={place.place_id} 
                        onClick={() => handleLocationSelect(place)}
                        className="p-3 text-sm hover:bg-muted cursor-pointer border-b border-border/50 last:border-0"
                      >
                        {place.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Description</label>
                <textarea title="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3 h-32 focus:border-accent outline-none" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Start Time</label>
                <input title="Start Time" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3 focus:border-accent outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">End Time</label>
                <input title="End Time" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3 focus:border-accent outline-none" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Tags (comma separated)</label>
                <input title="Tags" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3 focus:border-accent outline-none" placeholder="e.g. music, networking, tech" />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button disabled={posting} onClick={handlePostEvent} className="bg-accent text-black px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2">
                {posting ? <><Loader2 size={18} className="animate-spin" /> POSTING...</> : 'PUBLISH EVENT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
