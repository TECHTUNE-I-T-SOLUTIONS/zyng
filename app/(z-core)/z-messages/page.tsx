'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { zingService } from '@/lib/services/zingService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Send, 
  MoreVertical, 
  ShieldCheck, 
  MessageCircle, 
  UserPlus, 
  Check, 
  X,
  Loader2
} from 'lucide-react';

export default function ZingMessagesPage() {
  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');
  const [selectedChat, setSelectedChat] = useState<any>(null);

  const { data: chats, isLoading, refetch } = useQuery({
    queryKey: ['zing-chats', activeTab],
    queryFn: async () => {
      const isAccepted = activeTab === 'chats';
      const { data, error } = await supabase
        .from('zing_chats')
        .select('*, receiver:users!receiver_id(z_name), sender:users!sender_id(z_name)')
        .eq('is_accepted', isAccepted)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleAccept = async (chatId: string) => {
    await zingService.acceptZingRequest(chatId);
    refetch();
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-80 border-r border-border flex flex-col shrink-0 bg-muted/20">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tighter mb-6 uppercase italic">Zing Inbox</h1>
          
          <div className="flex bg-muted rounded-2xl p-1 mb-6">
            <button 
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'chats' ? 'bg-background text-accent shadow-sm' : 'text-foreground/40'
              }`}
            >
              Chats
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${
                activeTab === 'requests' ? 'bg-background text-accent shadow-sm' : 'text-foreground/40'
              }`}
            >
              Requests
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-black flex items-center justify-center rounded-full text-[8px]">2</div>
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
            chats?.map((chat: any) => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat)}
                className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-border/50 hover:bg-muted/50 ${selectedChat?.id === chat.id ? 'bg-muted border-l-4 border-l-accent' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent">
                   {chat.receiver?.z_name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-sm truncate uppercase tracking-tight">@{chat.receiver?.z_name}</span>
                    <span className="text-[9px] text-foreground/30 font-bold">12:45</span>
                  </div>
                  <p className="text-xs text-foreground/40 truncate italic">Swipe to see more...</p>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col bg-[radial-gradient(circle_at_bottom_left,rgba(var(--accent-rgb),0.03),transparent_50%)]">
        {selectedChat ? (
          <>
            <header className="h-20 border-b border-border px-8 flex items-center justify-between bg-background/50 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">
                  {selectedChat.receiver?.z_name?.[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="font-black text-sm uppercase tracking-widest">@{selectedChat.receiver?.z_name}</h2>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-green-500 uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active Now
                  </div>
                </div>
              </div>
              <button className="p-2 text-foreground/40 hover:text-foreground transition-all">
                <MoreVertical size={20} />
              </button>
            </header>

            <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-6">
              {/* Message logic here */}
              <div className="bg-muted p-4 rounded-2xl max-w-sm self-start text-sm font-medium border border-border/50">
                 Hey! I saw your Zyng about the engineering fair. Are you still looking for partners?
              </div>
            </div>

            {selectedChat.is_accepted ? (
              <div className="p-6 border-t border-border bg-background">
                <div className="max-w-4xl mx-auto flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Type a Zing..." 
                    className="flex-1 bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-accent transition-all"
                  />
                  <button className="bg-accent text-black p-4 rounded-2xl shadow-lg shadow-accent/20 hover:scale-105 transition-all">
                    <Send size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-10 border-t border-border bg-accent/5 backdrop-blur-md text-center">
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">Message Request</h3>
                <p className="text-xs text-foreground/40 font-medium italic mb-8 max-w-xs mx-auto">
                  @{selectedChat.sender?.z_name} wants to Zing with you. Their real identity remains hidden until you accept.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => handleAccept(selectedChat.id)}
                    className="bg-accent text-black px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-accent/20"
                  >
                    <Check size={18} /> Accept
                  </button>
                  <button className="bg-white/5 border border-border text-red-500 px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500/10">
                    <X size={18} /> Ignore
                  </button>
                </div>
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
