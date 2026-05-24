'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { zingService } from '@/lib/services/zingService';
import { 
  Search, 
  Send, 
  MoreVertical, 
  MessageCircle, 
  Check, 
  X,
  Loader2
} from 'lucide-react';
import { userService } from '@/lib/services/userService';

export default function ZingMessagesPage() {
  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const endRef = useRef<HTMLDivElement | null>(null);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });

  const { data: chats, isLoading, refetch } = useQuery({
    queryKey: ['zing-chats', activeTab, user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const isAccepted = activeTab === 'chats';
      const { data, error } = await supabase
        .from('zing_chats')
        .select('*, receiver:users!receiver_id(id, z_name), sender:users!sender_id(id, z_name)')
        .eq('is_accepted', isAccepted)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['zing-messages', selectedChat?.id],
    enabled: !!selectedChat?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zing_messages')
        .select('*, sender:users!sender_id(id, z_name)')
        .eq('chat_id', selectedChat.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('zing_messages')
        .insert([{ chat_id: selectedChat.id, sender_id: user?.id, content }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setMessage('');
    }
  });

  const handleAccept = async (chatId: string) => {
    await zingService.acceptZingRequest(chatId);
    queryClient.invalidateQueries({ queryKey: ['zing-chats'] });
    setSelectedChat((prev: any) => ({ ...prev, is_accepted: true }));
    setActiveTab('chats');
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedChat?.id) return;
    const channel = supabase
      .channel(`chat_${selectedChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'zing_messages',
          filter: `chat_id=eq.${selectedChat.id}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['zing-messages', selectedChat.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat?.id, queryClient]);

  // For global chat updates (new requests/chats)
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`chats_updates_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'zing_chats', filter: `receiver_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['zing-chats'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'zing_chats', filter: `sender_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['zing-chats'] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  const getOtherUser = (chat: any) => {
    if (chat.sender_id === user?.id) return chat.receiver;
    return chat.sender;
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-80 border-r border-border flex flex-col shrink-0 bg-muted/20">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tighter mb-6 uppercase italic">Zing Inbox</h1>
          
          <div className="flex bg-muted rounded-2xl p-1 mb-6">
            <button 
              onClick={() => { setActiveTab('chats'); setSelectedChat(null); }}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'chats' ? 'bg-background text-accent shadow-sm' : 'text-foreground/40'
              }`}
            >
              Chats
            </button>
            <button 
              onClick={() => { setActiveTab('requests'); setSelectedChat(null); }}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${
                activeTab === 'requests' ? 'bg-background text-accent shadow-sm' : 'text-foreground/40'
              }`}
            >
              Requests
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20" size={16} />
            <input 
              type="text" 
              placeholder="Search Zyngers..." 
              className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
          ) : chats?.length === 0 ? (
            <div className="p-10 text-center space-y-4">
              <MessageCircle className="mx-auto text-foreground/10" size={40} />
              <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">No active {activeTab}</p>
            </div>
          ) : (
            chats?.map((chat: any) => {
              const otherUser = getOtherUser(chat);
              return (
                <div 
                  key={chat.id} 
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-border/50 hover:bg-muted/50 ${selectedChat?.id === chat.id ? 'bg-muted border-l-4 border-l-accent' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent">
                     {otherUser?.z_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-sm truncate uppercase tracking-tight">@{otherUser?.z_name || 'Anonymous'}</span>
                    </div>
                    <p className="text-xs text-foreground/40 truncate italic">Click to view messages...</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col bg-[radial-gradient(circle_at_bottom_left,rgba(var(--accent-rgb),0.03),transparent_50%)] relative">
        {selectedChat ? (
          <>
            <header className="h-20 border-b border-border px-8 flex items-center justify-between bg-background/50 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">
                  {getOtherUser(selectedChat)?.z_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="font-black text-sm uppercase tracking-widest">@{getOtherUser(selectedChat)?.z_name || 'Anonymous'}</h2>
                  {selectedChat.is_accepted && (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-green-500 uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active Now
                    </div>
                  )}
                </div>
              </div>
              <button className="p-2 text-foreground/40 hover:text-foreground transition-all">
                <MoreVertical size={20} />
              </button>
            </header>

            <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-4">
              {loadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="animate-spin text-accent" />
                </div>
              ) : messages?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-foreground/40">
                  <p className="text-sm font-bold">No messages yet</p>
                </div>
              ) : (
                messages?.map((m: any) => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`p-4 rounded-2xl text-sm font-medium border ${isMe ? 'bg-accent text-black border-accent rounded-br-sm' : 'bg-muted border-border/50 rounded-bl-sm'}`}>
                         {m.content}
                      </div>
                      <span className="text-[9px] text-foreground/40 mt-1">{new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>

            {selectedChat.is_accepted ? (
              <div className="p-6 border-t border-border bg-background shrink-0">
                <form 
                  onSubmit={(e) => { e.preventDefault(); if (message.trim()) sendMutation.mutate(message); }}
                  className="max-w-4xl mx-auto flex gap-4"
                >
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a Zing..." 
                    className="flex-1 bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-accent transition-all"
                  />
                  <button type="submit" disabled={!message.trim() || sendMutation.isPending} className="bg-accent text-black p-4 rounded-2xl shadow-lg shadow-accent/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100">
                    {sendMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </form>
              </div>
            ) : selectedChat.receiver_id === user?.id ? (
              <div className="p-10 border-t border-border bg-accent/5 backdrop-blur-md text-center shrink-0">
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">Message Request</h3>
                <p className="text-xs text-foreground/40 font-medium italic mb-8 max-w-xs mx-auto">
                  @{selectedChat.sender?.z_name} wants to Zing with you. Their real identity remains hidden until you accept.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => handleAccept(selectedChat.id)}
                    className="bg-accent text-black px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-accent/20 hover:scale-105 transition-all"
                  >
                    <Check size={18} /> Accept
                  </button>
                  <button className="bg-white/5 border border-border text-red-500 px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500/10 transition-all">
                    <X size={18} /> Ignore
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-t border-border bg-background text-center text-xs text-foreground/50 shrink-0 italic">
                Waiting for @{selectedChat.receiver?.z_name} to accept your request.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-muted rounded-[2.5rem] flex items-center justify-center text-foreground/10 border border-border mb-8">
               <MessageCircle size={48} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-2 italic">Select a conversation</h2>
            <p className="text-white/40 text-sm font-medium italic max-w-xs mx-auto">
               Your identity is protected by Zyng's end-to-end anonymity. Start a safe conversation with any Zynger.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
