'use client';

import { useState } from 'react';
import { Search, MessageCircle, Briefcase } from 'lucide-react';

export default function AlumniMessagesPage() {
  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');

  return (
    <div className="flex-1 flex overflow-hidden bg-black">
      <aside className="w-80 border-r border-white/5 flex flex-col shrink-0 bg-neutral-900/20">
        <div className="p-8">
          <h1 className="text-2xl font-black tracking-tighter mb-8 uppercase italic text-indigo-400">Professional Zing</h1>
          <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === 'chats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-white/20'
              }`}
            >
              Inbound
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-white/20'
              }`}
            >
              Requests
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" size={16} />
            <input
              type="text"
              placeholder="Search Network..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all text-white"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-20">
          <MessageCircle size={40} className="mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">No active Zings</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05),transparent_70%)]">
        <div className="max-w-sm text-center">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 text-indigo-400">
            <Briefcase size={32} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Secure Professional Channel</h2>
          <p className="text-white/30 text-xs font-medium italic leading-relaxed">
            All professional communications are end-to-end encrypted and verified by the alumni association.
          </p>
        </div>
      </main>
    </div>
  );
}
