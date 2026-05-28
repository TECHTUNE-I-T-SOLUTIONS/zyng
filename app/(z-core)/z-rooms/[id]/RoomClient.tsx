'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { zingService } from '@/lib/services/zingService';
import { supabase } from '@/lib/db/supabase';
import { Send, Users, Info, Loader2 } from 'lucide-react';

export default function RoomClient({ roomId }: { roomId: string }) {
  const { data: room, isLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => zingService.getRoomById(roomId),
  });
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const sendMutation = useMutation({
    mutationFn: (content: string) => zingService.sendMessage(roomId, content),
    onSuccess: () => {
      setMessage('');
    }
  });

  useEffect(() => {
    // Scroll to bottom on new messages
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.zing_messages]);

  useEffect(() => {
    // Supabase real-time subscription for new messages
    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'zing_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          // When a new message comes in, invalidate the room query to refetch data with user info
          queryClient.invalidateQueries({ queryKey: ['room', roomId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
    </div>
  );
  if (!room) return <div className="p-6 text-center text-foreground/50">Room not found</div>;

  const messages = Array.isArray(room.zing_messages) ? room.zing_messages.slice().sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) : [];
  const members = Array.isArray(room.zing_room_members) ? room.zing_room_members : [];
  const creatorPersona = room.creator?.personas?.find((persona: any) => persona.is_active) || room.creator?.personas?.[0];

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border relative">
        <header className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-black font-black text-xl">
              {room.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black truncate">{room.name}</h2>
              <div className="text-xs text-foreground/50 truncate max-w-sm">{room.description || 'Welcome to the room'}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-foreground/30 font-black flex items-center gap-2">
                Created by
                <img
                  src={creatorPersona?.avatar_url || room.creator?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creatorPersona?.name || room.creator?.z_name || 'creator'}`}
                  alt={creatorPersona?.name || room.creator?.z_name || 'Creator'}
                  className="w-4 h-4 rounded-full object-cover bg-muted"
                />
                <span className="text-foreground/60 normal-case tracking-normal font-bold">
                  {creatorPersona?.name || room.creator?.z_name || 'Creator'}
                </span>
              </div>
            </div>
          </div>
          <button title="Toggle room details" aria-label="Toggle room details" onClick={() => setShowSidebar(!showSidebar)} className="md:hidden p-2 bg-muted rounded-xl hover:text-accent transition">
            <Info size={20} />
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.length > 0 ? (
            messages.map((m: any) => {
              // Note: Assuming we have the current user to style messages differently. 
              // For now, we'll just style all messages uniformly but modernly.
              return (
                <div key={m.id} className="flex gap-4 group">
                  <img src={m.sender?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed='+m.sender?.z_name} alt="Avatar" className="w-10 h-10 rounded-full object-cover bg-muted" />
                  <div className="flex flex-col flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold">{m.sender?.z_name || 'Anonymous'}</span>
                      <span className="text-[10px] text-foreground/40">{new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="mt-1 bg-muted/50 p-3 rounded-2xl rounded-tl-sm w-fit max-w-[85%] text-sm border border-border">
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-foreground/40 h-full">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users size={32} />
              </div>
              <p className="font-bold text-lg">No messages yet</p>
              <p className="text-sm">Be the first to say hi!</p>
            </div>
          )}
          <div ref={endRef} />
        </section>

        <footer className="p-4 border-t border-border bg-background">
          <form 
            onSubmit={(e) => { e.preventDefault(); if (message.trim()) sendMutation.mutate(message); }}
            className="flex items-end gap-2 bg-muted p-2 rounded-[2rem] border border-border focus-within:border-accent transition-colors"
          >
            <input 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Type your message..." 
              className="flex-1 bg-transparent px-4 py-3 outline-none min-w-0" 
            />
            <button 
              type="submit"
              disabled={!message.trim() || sendMutation.isPending} 
              className="p-3 bg-accent text-black rounded-full font-black hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center"
            >
              {sendMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </footer>
      </div>

      {/* Right Sidebar - Room Info */}
      <aside className={`w-80 bg-muted/10 flex flex-col border-l border-border absolute md:relative right-0 top-0 bottom-0 z-20 transform transition-transform duration-300 ${showSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h4 className="font-black text-lg">Room Details</h4>
          <button onClick={() => setShowSidebar(false)} className="md:hidden p-2 text-foreground/50 hover:text-accent">✕</button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <div className="text-xs font-black uppercase text-foreground/40 mb-2 tracking-wider">About</div>
            <p className="text-sm">{room.description || 'No description provided.'}</p>
          </div>
          
          <div>
            <div className="text-xs font-black uppercase text-foreground/40 mb-3 tracking-wider flex items-center justify-between">
              Members
              <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-full">{members.length}</span>
            </div>
            <ul className="space-y-3">
              {members.map((m: any) => (
                <li key={m.id} className="flex items-center gap-3">
                  <img src={m.user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed='+m.user?.z_name} alt="Avatar" className="w-8 h-8 rounded-full object-cover bg-background" />
                  <div className="text-sm font-bold truncate flex-1">{m.user?.z_name || 'Member'}</div>
                  {m.role === 'owner' && <span className="text-[10px] bg-foreground text-background px-2 py-0.5 rounded-md font-black uppercase">Host</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
