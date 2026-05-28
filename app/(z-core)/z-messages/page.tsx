'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { zingService } from '@/lib/services/zingService';
import { zyngMatchService } from '@/lib/services/zyngMatchService';
import { Search, Send, MoreVertical, MessageCircle, Check, X, Loader2, Users, Sparkles, ArrowRight } from 'lucide-react';
import { userService } from '@/lib/services/userService';
import { useSearchParams } from 'next/navigation';
import { ACTIVE_PERSONA_ALERT, getPersonaDisplay, hasActivePersona } from '@/lib/persona-utils';
import { useToast } from '@/components/toast';

const TABS = [
  { key: 'chats', label: 'Chats' },
  { key: 'requests', label: 'Requests' },
  { key: 'matches', label: 'Matches' },
] as const;

type InboxTab = (typeof TABS)[number]['key'];

function getUserDisplay(user: any) {
  return getPersonaDisplay(user);
}

function listContainsQuery(values: unknown[], query: string) {
  if (!query) return true;
  return values.some((value) => String(value || '').toLowerCase().includes(query));
}

export default function ZingMessagesPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<InboxTab>('chats');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const toast = useToast();
  const endRef = useRef<HTMLDivElement | null>(null);
  const normalizedSearch = search.trim().toLowerCase();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const chatIdParam = searchParams.get('chatId');
  const userIdParam = searchParams.get('userId');

  const { data: chats, isLoading, refetch } = useQuery({
    queryKey: ['zing-chats', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zing_chats')
        .select('*, receiver:users!receiver_id(id, z_name, avatar_url, personas(id, name, avatar_url, is_active), skills, hobbies), sender:users!sender_id(id, z_name, avatar_url, personas(id, name, avatar_url, is_active), skills, hobbies)')
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['zing-messages', selectedChat?.id],
    enabled: !!selectedChat?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zing_messages')
        .select('*, sender:users!sender_id(id, z_name, avatar_url, personas(id, name, avatar_url, is_active))')
        .eq('chat_id', selectedChat.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: matches, isLoading: loadingMatches } = useQuery({
    queryKey: ['zing-matches', user?.id],
    enabled: !!user?.id && activeTab === 'matches',
    queryFn: async () => {
      if (!user) return [];
      const suggestions = await zyngMatchService.getSuggestedZyngers(user, { limit: 20 });
      return suggestions.filter((candidate: any) => hasActivePersona(candidate));
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
      queryClient.invalidateQueries({ queryKey: ['zing-messages', selectedChat?.id] });
    }
  });

  const handleAccept = async (chatId: string) => {
    await zingService.acceptZingRequest(chatId);
    await queryClient.invalidateQueries({ queryKey: ['zing-chats', user?.id] });
    setSelectedChat((prev: any) => ({ ...prev, is_accepted: true }));
    setActiveTab('chats');
  };

  const handleRequest = async (candidate: any) => {
    if (!hasActivePersona(user)) {
      toast.show(ACTIVE_PERSONA_ALERT, 'error');
      return;
    }
    const existingChat = chats?.find((chat: any) => chat.sender_id === candidate.id || chat.receiver_id === candidate.id);
    if (existingChat) {
      setSelectedChat(existingChat);
      setActiveTab(existingChat.is_accepted ? 'chats' : 'requests');
      return;
    }

    const sharedSkills = candidate.sharedSkills?.slice?.(0, 2)?.join(', ') || 'shared interests';
    const sharedHobbies = candidate.sharedHobbies?.slice?.(0, 2)?.join(', ') || 'campus vibes';
    const intro = `Hey ${candidate.name}, we seem to share ${sharedSkills}${candidate.sharedHobbies?.length ? ` and ${sharedHobbies}` : ''}. Want to zync?`;

    if (candidate.status === 'alumni') {
      const ok = window.confirm('This Zynger is an alumni. Please connect with respect, stay curious, and use the conversation as a chance to learn from their experience.');
      if (!ok) return;
    }

    const chat = await zingService.sendZingRequest(candidate.id, intro);
    await queryClient.invalidateQueries({ queryKey: ['zing-chats', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['zing-matches', user?.id] });
    setSelectedChat(chat);
    setActiveTab('requests');
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
        () => {
          queryClient.invalidateQueries({ queryKey: ['zing-messages', selectedChat.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat?.id, queryClient]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`chats_updates_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'zing_chats', filter: `receiver_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['zing-chats', user.id] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'zing_chats', filter: `sender_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['zing-chats', user.id] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  useEffect(() => {
    if (!chats || chats.length === 0) return;
    if (chatIdParam) {
      const chat = chats.find((entry: any) => entry.id === chatIdParam);
      if (chat) setSelectedChat(chat);
      return;
    }
    if (userIdParam) {
      const chat = chats.find((entry: any) => entry.sender_id === userIdParam || entry.receiver_id === userIdParam);
      if (chat) setSelectedChat(chat);
    }
  }, [chatIdParam, userIdParam, chats]);

  const myChats = useMemo(() => {
    return (chats || []).filter((chat: any) => chat.is_accepted && hasActivePersona(chat.sender_id === user?.id ? chat.receiver : chat.sender));
  }, [chats]);

  const myRequests = useMemo(() => {
    return (chats || []).filter((chat: any) => !chat.is_accepted && hasActivePersona(chat.sender_id === user?.id ? chat.receiver : chat.sender));
  }, [chats]);

  const visibleChats = useMemo(() => {
    const source = activeTab === 'chats' ? myChats : myRequests;
    return source.filter((chat: any) => {
      const otherUser = chat.sender_id === user?.id ? chat.receiver : chat.sender;
      const display = getUserDisplay(otherUser);
      return listContainsQuery(
        [
          display.name,
          otherUser?.full_name,
          otherUser?.bio,
          ...(otherUser?.skills || []),
          ...(otherUser?.hobbies || []),
        ],
        normalizedSearch
      );
    });
  }, [activeTab, myChats, myRequests, normalizedSearch, user?.id]);

  const visibleMatches = useMemo(() => {
    return (matches || []).filter((candidate: any) => {
      const display = getUserDisplay(candidate);
      return listContainsQuery(
        [
          display.name,
          candidate.full_name,
          candidate.bio,
          ...(candidate.sharedSkills || []),
          ...(candidate.sharedHobbies || []),
        ],
        normalizedSearch
      );
    });
  }, [matches, normalizedSearch]);

  const hasSelectedChat = Boolean(selectedChat?.id);
  const otherUser = selectedChat ? (selectedChat.sender_id === user?.id ? selectedChat.receiver : selectedChat.sender) : null;
  const displayUser = getUserDisplay(otherUser);
  const isIncomingRequest = selectedChat?.receiver_id === user?.id && !selectedChat?.is_accepted;
  const isOutgoingRequest = selectedChat?.sender_id === user?.id && !selectedChat?.is_accepted;

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      <aside className="w-80 border-r border-border flex flex-col shrink-0 bg-muted/20">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tighter mb-4 uppercase italic">Zing Inbox</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-6">Requests, replies, and suggested matches</p>

          <div className="flex bg-muted rounded-2xl p-1 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedChat(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.key ? 'bg-background text-accent shadow-sm' : 'text-foreground/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats, requests, matches..."
              className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
          ) : activeTab === 'matches' ? (
            loadingMatches ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
            ) : visibleMatches.length === 0 ? (
              <div className="p-10 text-center space-y-4">
                <Users className="mx-auto text-foreground/10" size={40} />
                <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">No matches found</p>
              </div>
            ) : (
              visibleMatches.map((candidate: any) => {
                const existingChat = chats?.find((chat: any) => chat.sender_id === candidate.id || chat.receiver_id === candidate.id);
                const candidateDisplay = getUserDisplay(candidate);
                const requestState = existingChat ? (existingChat.is_accepted ? 'open' : existingChat.sender_id === user?.id ? 'sent' : 'received') : 'new';

                return (
                  <div key={candidate.id} className="p-4 border-b border-border/50 hover:bg-muted/50 transition-all">
                    <button onClick={() => existingChat && setSelectedChat(existingChat)} className="w-full text-left flex items-start gap-4">
                      <img src={candidateDisplay.avatar} alt={candidateDisplay.name} className="w-12 h-12 rounded-full object-cover bg-background border border-border" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5 gap-2">
                          <span className="font-bold text-sm truncate uppercase tracking-tight">{candidateDisplay.name}</span>
                          {candidate.status === 'alumni' && (
                            <span className="shrink-0 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-indigo-400">Alumni</span>
                          )}
                          <span className="text-[9px] uppercase font-black tracking-widest text-foreground/30">{candidate.score} match</span>
                        </div>
                        <p className="text-xs text-foreground/40 truncate italic">{candidate.reason}</p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {candidate.sharedSkills?.slice(0, 2).map((skill: string) => (
                            <span key={skill} className="text-[9px] px-2 py-1 rounded-full bg-accent/10 text-accent uppercase font-black tracking-widest">{skill}</span>
                          ))}
                          {candidate.sharedHobbies?.slice(0, 1).map((hobby: string) => (
                            <span key={hobby} className="text-[9px] px-2 py-1 rounded-full bg-muted text-foreground/60 uppercase font-black tracking-widest">{hobby}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30">
                        {requestState === 'open' ? 'Chat ready' : requestState === 'sent' ? 'Request sent' : requestState === 'received' ? 'Incoming request' : 'Suggested match'}
                      </span>
                      {requestState === 'new' ? (
                        <button
                          onClick={() => handleRequest(candidate)}
                          className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-black"
                        >
                          Request <ArrowRight size={12} />
                        </button>
                      ) : requestState === 'open' ? (
                        <button
                          onClick={() => setSelectedChat(existingChat)}
                          className="inline-flex items-center gap-2 rounded-full bg-background border border-border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-foreground/70"
                        >
                          Open chat
                        </button>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Awaiting reply</span>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : visibleChats.length === 0 ? (
            <div className="p-10 text-center space-y-4">
              <MessageCircle className="mx-auto text-foreground/10" size={40} />
              <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">No active {activeTab}</p>
            </div>
          ) : (
            visibleChats.map((chat: any) => {
              const other = chat.sender_id === user?.id ? chat.receiver : chat.sender;
              const display = getUserDisplay(other);
              const isIncoming = chat.receiver_id === user?.id;
              return (
                <div 
                  key={chat.id} 
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-border/50 hover:bg-muted/50 ${selectedChat?.id === chat.id ? 'bg-muted border-l-4 border-l-accent' : ''}`}
                >
                  <img src={display.avatar} alt={display.name} className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5 gap-2">
                      <span className="font-bold text-sm truncate uppercase tracking-tight">{display.name}</span>
                      <span className={`text-[9px] uppercase font-black tracking-widest ${isIncoming ? 'text-accent' : 'text-foreground/30'}`}>
                        {isIncoming ? 'Incoming' : 'Sent'}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/40 truncate italic">
                      {chat.is_accepted ? 'Tap to continue the conversation' : isIncoming ? 'Tap to review the request' : 'Waiting for a reply'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-[radial-gradient(circle_at_bottom_left,rgba(var(--accent-rgb),0.03),transparent_50%)] relative min-w-0">
        {hasSelectedChat ? (
          <>
            <header className="h-20 border-b border-border px-8 flex items-center justify-between bg-background/50 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <img src={displayUser.avatar} alt={displayUser.name} className="w-10 h-10 rounded-full object-cover bg-accent/10 border border-border" />
                <div className="min-w-0">
                  <h2 className="font-black text-sm uppercase tracking-widest truncate">{displayUser.name}</h2>
                  {selectedChat.is_accepted ? (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-green-500 uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active Now
                    </div>
                  ) : isIncomingRequest ? (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-accent uppercase">
                      Incoming request
                    </div>
                  ) : isOutgoingRequest ? (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-foreground/40 uppercase">
                      Waiting for reply
                    </div>
                  ) : null}
                </div>
              </div>
              <button title="More options" aria-label="More options" className="p-2 text-foreground/40 hover:text-foreground transition-all">
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
                  const senderDisplay = getUserDisplay(m.sender);
                  return (
                    <div key={m.id} className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`flex items-center gap-3 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <img src={senderDisplay.avatar} alt={senderDisplay.name} className="w-8 h-8 rounded-full object-cover bg-background border border-border" />
                        <span className="text-[9px] uppercase tracking-widest font-black text-foreground/40">{senderDisplay.name}</span>
                      </div>
                      <div className={`p-4 rounded-2xl text-sm font-medium border ${isMe ? 'bg-accent text-black border-accent rounded-br-sm' : 'bg-muted border-border/50 rounded-bl-sm'}`}>
                        {m.content}
                      </div>
                      <span className="text-[9px] text-foreground/40 mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
            ) : isIncomingRequest ? (
              <div className="p-10 border-t border-border bg-accent/5 backdrop-blur-md text-center shrink-0">
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">Message Request</h3>
                <p className="text-xs text-foreground/40 font-medium italic mb-8 max-w-xs mx-auto">
                  {displayUser.name} wants to Zing with you. Their chat will move to Chats as soon as you accept.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => handleAccept(selectedChat.id)}
                    className="bg-accent text-black px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-accent/20 hover:scale-105 transition-all"
                  >
                    <Check size={18} /> Accept
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedChat(null);
                      setActiveTab('requests');
                    }}
                    className="bg-white/5 border border-border text-red-500 px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500/10 transition-all"
                  >
                    <X size={18} /> Later
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-t border-border bg-background text-center text-xs text-foreground/50 shrink-0 italic">
                Waiting for {displayUser.name} to accept your request.
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
