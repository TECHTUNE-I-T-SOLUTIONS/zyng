'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campusService } from '@/lib/services/campusService';
import { zingService } from '@/lib/services/zingService';
import Link from 'next/link';
import { userService } from '@/lib/services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordJoinForm from './PasswordJoinForm';
import { 
  Users, 
  Hash, 
  Plus, 
  Lock, 
  Globe, 
  ShieldCheck, 
  ChevronRight,
  Search,
  Loader2,
  X,
  Key
} from 'lucide-react';

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'joined'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null);
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });

  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomPrivate, setNewRoomPrivate] = useState(false);
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);

  const queryClient = useQueryClient();
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms', activeTab],
    queryFn: () => zingService.getRooms(),
  });

  const joinMutation = useMutation({
    mutationFn: async ({ roomId, password }: { roomId: string; password?: string | null }) => {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, password }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to join');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    }
  });

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase italic">Campus Rooms</h1>
            <p className="text-foreground/40 font-medium italic">Private or Public spaces for Zyngers to connect.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
              <input 
                type="text" 
                placeholder="Search rooms..." 
                className="bg-muted border border-border rounded-2xl pl-12 pr-6 py-3 w-full md:w-64 focus:outline-none focus:border-accent transition-all text-sm"
              />
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-accent text-black px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all text-xs uppercase tracking-widest shadow-lg shadow-accent/20"
            >
              <Plus size={20} /> New Room
            </button>
          </div>
        </header>

        <div className="flex items-center gap-4 mb-8">
           {['all', 'joined'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeTab === tab ? 'bg-accent text-black' : 'bg-muted text-foreground/40 border border-border'
               }`}
             >
               {tab} Rooms
             </button>
           ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>
        ) : !rooms || rooms.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-[3rem]">
            <p className="text-foreground/40 font-bold italic">No active rooms found. Be the first to start one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, i) => {
              const memberCount = Array.isArray(room.zing_room_members) ? room.zing_room_members.length : 0;
              const lastMessage = Array.isArray(room.zing_messages) && room.zing_messages.length > 0
                ? [...room.zing_messages].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                : null;

              const card = (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <div className="bg-muted border border-border p-8 rounded-[2.5rem] h-full flex flex-col hover:border-accent/50 transition-all shadow-xl shadow-accent/5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-4 rounded-2xl ${room.is_private ? 'bg-indigo-500/10 text-indigo-400' : 'bg-accent/10 text-accent'}`}>
                        {room.is_private ? <Lock size={24} /> : <Globe size={24} />}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-foreground/40 tracking-widest">
                         <Users size={16} /> <span className="ml-1">{memberCount}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-black mb-2 tracking-tight group-hover:text-accent transition-colors">
                      {room.name || 'Unnamed Room'}
                    </h3>
                    <p className="text-xs text-foreground/40 font-medium italic mb-4 line-clamp-2">
                      {room.description || 'No description provided for this campus room.'}
                    </p>

                    {lastMessage && (
                      <div className="text-[12px] text-foreground/50 mb-6">
                        <span className="font-black text-foreground/70">{lastMessage.sender?.z_name || 'Someone'}:</span>{' '}
                        <span className="italic">{lastMessage.content}</span>
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/20" />
                                <div className="text-[10px] font-bold text-foreground/30 uppercase">{room.creator?.z_name || 'Creator'}</div>
                              </div>
                      <div>
                        {room.is_private ? (
                          <button title="Join Room" onClick={() => setShowPasswordModal(room.id)} className="p-3 bg-background border border-border rounded-xl group-hover:bg-accent group-hover:text-black transition-all">
                            <Key size={18} />
                          </button>
                        ) : (
                          <Link href={`/z-rooms/${room.id}`} className="p-3 bg-background border border-border rounded-xl group-hover:bg-accent group-hover:text-black transition-all inline-flex items-center">
                            <ChevronRight size={18} />
                          </Link>
                        )}
                      </div>
                    </div>

                        {room.is_private && (
                         <div className="absolute top-4 right-4 bg-indigo-500/20 text-indigo-400 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter border border-indigo-500/30">
                           Private
                         </div>
                        )}
                  </div>
                </motion.div>
              );

              return room.is_private ? (
                <div key={room.id} className="cursor-pointer" onClick={() => setShowPasswordModal(room.id)}>
                  {card}
                </div>
              ) : (
                <div key={room.id} className="cursor-pointer">{card}</div>
              );
            })}
          </div>
        )}
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-background border border-border p-8 rounded-[2.5rem] text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Key size={32} />
                </div>
              <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight uppercase">Enter Room Password</h2>
              <p className="text-foreground/40 text-xs font-medium italic mb-8">This is a private space. You need the access code shared by the room owner.</p>
              
                <PasswordJoinForm
                  roomId={showPasswordModal!}
                  onClose={() => setShowPasswordModal(null)}
                  onJoined={() => {
                    setShowPasswordModal(null);
                    queryClient.invalidateQueries(['rooms']);
                  }}
                  joinMutation={joinMutation}
                />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal Stub */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="relative w-full max-w-md bg-background border border-border h-full max-h-[80vh] rounded-[3rem] p-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">Start a Room</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-3 bg-muted rounded-2xl"><X size={20} /></button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Room Name</label>
                  <input value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} type="text" placeholder="e.g. Engineering Fair Prep" className="w-full bg-muted border border-border rounded-2xl p-4 text-sm font-bold" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Description (optional)</label>
                  <textarea value={newRoomDescription} onChange={(e) => setNewRoomDescription(e.target.value)} placeholder="Short description for the room" className="w-full bg-muted border border-border rounded-2xl p-4 text-sm font-bold min-h-[100px]" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setNewRoomPrivate(false)} className={`flex flex-col items-center gap-3 p-6 rounded-3xl ${!newRoomPrivate ? 'bg-accent/5 border border-accent/20 text-accent' : 'bg-muted/10 border border-border text-foreground/60'}`}>
                    <Globe size={24} />
                    <span className="text-[10px] font-black uppercase">Public</span>
                  </button>
                  <button onClick={() => setNewRoomPrivate(true)} className={`flex flex-col items-center gap-3 p-6 rounded-3xl ${newRoomPrivate ? 'bg-indigo-500/5 border border-indigo-500/20 text-indigo-400' : 'bg-muted/10 border border-border text-foreground/60'}`}>
                    <Lock size={24} />
                    <span className="text-[10px] font-black uppercase">Private</span>
                  </button>
                </div>
                
                {newRoomPrivate && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Set Password (Optional)</label>
                    <input value={newRoomPassword} onChange={(e) => setNewRoomPassword(e.target.value)} type="password" placeholder="Room Secret" className="w-full bg-muted border border-border rounded-2xl p-4 text-sm font-bold" />
                  </div>
                )}

                <button disabled={!newRoomName.trim() || creatingRoom} onClick={async () => {
                  if (!user?.id) return alert('Please login to create a room');
                  setCreatingRoom(true);
                  try {
                    await campusService.createRoom({
                      name: newRoomName.trim(),
                      description: newRoomDescription.trim() || undefined,
                      is_private: newRoomPrivate,
                      password: newRoomPrivate ? newRoomPassword || null : null,
                      school_id: user.school_id || null,
                      created_by: user.id,
                    });
                    setShowCreateModal(false);
                    // Ideally refresh rooms query; simple reload for now
                    queryClient.invalidateQueries(['rooms']);
                  } catch (err) {
                    console.error(err);
                    alert('Failed to create room.');
                  } finally {
                    setCreatingRoom(false);
                  }
                }} className="w-full bg-accent text-black py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-accent/20 mt-8 disabled:opacity-40">
                   {creatingRoom ? 'Creating...' : 'Initialize Campus Space'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
