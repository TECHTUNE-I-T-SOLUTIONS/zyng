'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/db/supabase';
import { userService } from '@/lib/services/userService';
import { zingService } from '@/lib/services/zingService';
import { Search, Send, MoreVertical, MessageCircle, Check, X, Loader2, Users, Sparkles, ArrowRight } from 'lucide-react';
import { getPersonaDisplay, hasActivePersona } from '@/lib/persona-utils';

function getDisplay(user: any) {
  return getPersonaDisplay(user);
}

export default function AlumniMessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const normalizedSearch = search.trim().toLowerCase();

  const { data: user } = useQuery({ queryKey: ['alumni-me'], queryFn: () => userService.getCurrentUser() });
  const chatIdParam = searchParams.get('chatId');
  const userIdParam = searchParams.get('userId');

  const { data: chats, isLoading } = useQuery({
    queryKey: ['alumni-zing-chats', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zing_chats')
        .select('*, receiver:users!receiver_id(id, z_name, avatar_url, personas(id, name, avatar_url, is_active), skills, hobbies), sender:users!sender_id(id, z_name, avatar_url, personas(id, name, avatar_url, is_active), skills, hobbies)')
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['alumni-zing-messages', selectedChat?.id],
    enabled: !!selectedChat?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zing_messages')
        .select('*, sender:users!sender_id(id, z_name, avatar_url, personas(id, name, avatar_url, is_active))')
        .eq('chat_id', selectedChat.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
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
      queryClient.invalidateQueries({ queryKey: ['alumni-zing-messages', selectedChat?.id] });
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedChat?.id) return;
    const channel = supabase
      .channel(`alumni_chat_${selectedChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'zing_messages', filter: `chat_id=eq.${selectedChat.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['alumni-zing-messages', selectedChat.id] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat?.id, queryClient]);

  const handleAccept = async (chatId: string) => {
    await zingService.acceptZingRequest(chatId);
    await queryClient.invalidateQueries({ queryKey: ['alumni-zing-chats', user?.id] });
    setSelectedChat((prev: any) => ({ ...prev, is_accepted: true }));
    setActiveTab('chats');
  };

  useEffect(() => {
    if (!chats || chats.length === 0) return;
    if (chatIdParam) {
      const chat = chats.find((entry: any) => entry.id === chatIdParam);
      if (chat) window.setTimeout(() => setSelectedChat(chat), 0);
      return;
    }
    if (userIdParam) {
      const chat = chats.find((entry: any) => entry.sender_id === userIdParam || entry.receiver_id === userIdParam);
      if (chat) window.setTimeout(() => setSelectedChat(chat), 0);
    }
  }, [chatIdParam, userIdParam, chats]);

  const visibleChats = useMemo(() => {
    const source = (chats || []).filter((chat: any) => {
      const other = chat.sender_id === user?.id ? chat.receiver : chat.sender;
      return (activeTab === 'chats' ? chat.is_accepted : !chat.is_accepted) && hasActivePersona(other);
    });
    return source.filter((chat: any) => {
      const other = chat.sender_id === user?.id ? chat.receiver : chat.sender;
      const display = getDisplay(other);
      return [display.name, other?.bio, ...(other?.skills || []), ...(other?.hobbies || [])].join(' ').toLowerCase().includes(normalizedSearch);
    });
  }, [activeTab, chats, normalizedSearch, user?.id]);

  const currentOther = selectedChat ? (selectedChat.sender_id === user?.id ? selectedChat.receiver : selectedChat.sender) : null;
  const display = getDisplay(currentOther);
  const isIncoming = selectedChat?.receiver_id === user?.id && !selectedChat?.is_accepted;
  const isOutgoing = selectedChat?.sender_id === user?.id && !selectedChat?.is_accepted;

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-black text-white">
      <aside className="w-80 border-r border-white/5 flex flex-col shrink-0 bg-neutral-900/20">
        <div className="p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-4">
            <Sparkles size={12} /> Alumni inbox
          </div>
          <h1 className="text-2xl font-black tracking-tighter mb-2 uppercase italic text-indigo-400">Professional Zing</h1>
          <p className="text-white/30 text-xs font-medium italic mb-8">Accepted conversations and alumni requests in one place.</p>

          <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
            <button onClick={() => { setActiveTab('chats'); setSelectedChat(null); }} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'chats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-white/20'}`}>Chats</button>
            <button onClick={() => { setActiveTab('requests'); setSelectedChat(null); }} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-white/20'}`}>Requests</button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alumni..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all text-white"
            />
          </div>

          <button
            onClick={() => router.push('/z-alumni/connect')}
            className="w-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Users size={16} /> Discover alumni
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-400" /></div>
          ) : visibleChats.length === 0 ? (
            <div className="p-10 text-center space-y-4 text-white/30">
              <MessageCircle className="mx-auto" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest">No active conversations</p>
            </div>
          ) : (
            visibleChats.map((chat: any) => {
              const other = chat.sender_id === user?.id ? chat.receiver : chat.sender;
              const otherDisplay = getDisplay(other);
              const isRequest = !chat.is_accepted;
              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-white/5 hover:bg-white/5 text-left ${selectedChat?.id === chat.id ? 'bg-white/10 border-l-4 border-l-indigo-500' : ''}`}
                >
                  <img src={otherDisplay.avatar} alt={otherDisplay.name} className="w-12 h-12 rounded-full object-cover bg-white/5 border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-bold text-sm truncate uppercase tracking-tight">{otherDisplay.name}</span>
                      <span className={`text-[9px] uppercase font-black tracking-widest ${isRequest ? 'text-indigo-300' : 'text-white/20'}`}>{isRequest ? 'Request' : 'Chat'}</span>
                    </div>
                    <p className="text-xs text-white/30 truncate italic">{isRequest ? 'Waiting for a response' : 'Tap to continue the conversation'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05),transparent_70%)] min-w-0">
        {selectedChat ? (
          <>
            <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/30 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <img src={display.avatar} alt={display.name} className="w-10 h-10 rounded-full object-cover bg-white/10 border border-white/10" />
                <div className="min-w-0">
                  <h2 className="font-black text-sm uppercase tracking-widest truncate">{display.name}</h2>
                  {selectedChat.is_accepted ? (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-green-500 uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active Now
                    </div>
                  ) : isIncoming ? (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-300 uppercase">Incoming request</div>
                  ) : isOutgoing ? (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase">Waiting for reply</div>
                  ) : null}
                </div>
              </div>
              <button title="More options" aria-label="More options" className="p-2 text-white/40 hover:text-white transition-all">
                <MoreVertical size={20} />
              </button>
            </header>

            <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-4">
              {loadingMessages ? (
                <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-400" /></div>
              ) : messages?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-white/30">
                  <p className="text-sm font-bold">No messages yet</p>
                </div>
              ) : (
                messages?.map((m: any) => {
                  const isMe = m.sender_id === user?.id;
                  const senderDisplay = getDisplay(m.sender);
                  return (
                    <div key={m.id} className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`flex items-center gap-3 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <img src={senderDisplay.avatar} alt={senderDisplay.name} className="w-8 h-8 rounded-full object-cover bg-white/10 border border-white/10" />
                        <span className="text-[9px] uppercase tracking-widest font-black text-white/30">{senderDisplay.name}</span>
                      </div>
                      <div className={`p-4 rounded-2xl text-sm font-medium border ${isMe ? 'bg-indigo-500 text-white border-indigo-500 rounded-br-sm' : 'bg-white/5 border-white/10 rounded-bl-sm'}`}>
                        {m.content}
                      </div>
                      <span className="text-[9px] text-white/20 mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>

            {selectedChat.is_accepted ? (
              <div className="p-6 border-t border-white/5 bg-black shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); if (message.trim()) sendMutation.mutate(message); }} className="max-w-4xl mx-auto flex gap-4">
                  <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a Zing..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-indigo-500 transition-all text-white" />
                  <button type="submit" disabled={!message.trim() || sendMutation.isPending} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100">
                    {sendMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </form>
              </div>
            ) : isIncoming ? (
              <div className="p-10 border-t border-white/5 bg-indigo-500/5 backdrop-blur-md text-center shrink-0">
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">Message Request</h3>
                <p className="text-xs text-white/40 font-medium italic mb-8 max-w-xs mx-auto">
                  {display.name} wants to Zync with you. Accept the request to move it into Chats.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => handleAccept(selectedChat.id)} className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all">
                    <Check size={18} /> Accept
                  </button>
                  <button onClick={() => { setSelectedChat(null); setActiveTab('requests'); }} className="bg-white/5 border border-white/10 text-white/40 px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                    <X size={18} /> Later
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-t border-white/5 bg-black text-center text-xs text-white/40 shrink-0 italic">
                Waiting for {display.name} to accept your request.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-white/10 border border-white/10 mb-8">
              <MessageCircle size={48} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-2 italic">Select a conversation</h2>
            <p className="text-white/40 text-sm font-medium italic max-w-xs mx-auto">
              Alumni Zing keeps your professional conversations in one place and lets you respond to requests when you are ready.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
